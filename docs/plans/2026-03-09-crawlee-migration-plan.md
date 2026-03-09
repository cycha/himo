# Crawlee Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace raw Playwright with Crawlee PlaywrightCrawler to reduce bot RAM from ~1GB to ~200-350MB, eliminating Xvfb and running scrapers sequentially.

**Architecture:** Rewrite two scrapers (LeBonCoin, PAP) as Crawlee PlaywrightCrawler instances with stealth plugin. Simplify BaseScraper since Crawlee handles fetch/retry. Run scrapers sequentially instead of parallel. Slim Docker image by removing Xvfb/X11.

**Tech Stack:** Crawlee (PlaywrightCrawler), playwright-extra, puppeteer-extra-plugin-stealth, Prisma, TypeScript

---

### Task 1: Install Crawlee Dependencies

**Files:**
- Modify: `bot/package.json`

**Step 1: Install crawlee packages**

Run from repo root:
```bash
pnpm --filter @himo/bot add crawlee @crawlee/playwright
```

**Step 2: Verify installation**

Run:
```bash
pnpm --filter @himo/bot exec tsc --noEmit 2>&1 | head -5
```
Expected: Should compile (possibly with existing warnings, but no new crawlee-related errors).

**Step 3: Commit**

```bash
git add bot/package.json pnpm-lock.yaml
git commit -m "feat(bot): add crawlee dependencies for memory-optimized scraping"
```

---

### Task 2: Rewrite LeBonCoin Scraper with Crawlee

**Files:**
- Rewrite: `bot/src/scrapers/leboncoin-scraper-stealth.ts`

**Context:** The current scraper (846 lines) manages its own browser lifecycle, cookie persistence, anti-detection scripts, and human behavior simulation. Crawlee's PlaywrightCrawler handles browser pool management, session/cookie persistence, and page lifecycle automatically. We keep all the parsing logic (regex JSON extraction, price parsing, attribute mapping) and anti-detection scripts unchanged.

**Step 1: Rewrite the scraper**

Replace `bot/src/scrapers/leboncoin-scraper-stealth.ts` with:

```typescript
// @ts-nocheck - This file uses browser APIs (navigator, window) which are not available in Node context
import { PlaywrightCrawler, RequestList, Session } from 'crawlee';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BotAdData } from './base-scraper';
import { ScraperConfig, ScraperResult, RawAdData } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep, calculateStatistics } from '../utils/utils';

// Add stealth plugin to playwright
chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5,
  maxRetries: 0,
  waitSuccess: 20,
  waitError: 60,
  baseUrl: 'https://www.leboncoin.fr/recherche?category=9',
  provider: 'leboncoin',
};

export class LeBonCoinCrawleeScraper {
  private config: ScraperConfig;
  private logger: Logger;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.provider);
  }

  /**
   * Get anti-detection script to inject into every page
   */
  private getAntiDetectionScript() {
    return () => {
      // 1. Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      // 2. Override permissions
      const originalQuery = (window as any).navigator.permissions.query;
      (window as any).navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as any)
          : originalQuery(parameters);

      // 3. Add chrome object
      (window as any).chrome = { runtime: {}, loadTimes: function () {}, csi: function () {}, app: {} };

      // 4. Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', description: '', filename: 'internal-nacl-plugin' },
        ],
      });

      // 5-12. Override languages, platform, vendor, battery, connection, hardware
      Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en-US', 'en'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
      (navigator as any).getBattery = () =>
        Promise.resolve({ charging: true, chargingTime: 0, dischargingTime: Infinity, level: 1 });
      Object.defineProperty(navigator, 'connection', {
        get: () => ({ effectiveType: '4g', rtt: 50, downlink: 10, saveData: false }),
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
    };
  }

  /**
   * Simulate human behavior on page (mouse movements, scrolling)
   */
  private async simulateHumanBehavior(page: any): Promise<void> {
    // Random mouse movements
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * 1500 + 100);
      const y = Math.floor(Math.random() * 800 + 100);
      await page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 20) });
      await sleep(Math.random() * 0.5 + 0.2);
    }

    // Scroll like a human
    for (let i = 0; i < 3; i++) {
      await page.evaluate((scroll: number) => {
        window.scrollBy({ top: scroll, left: 0, behavior: 'smooth' });
      }, Math.floor(Math.random() * 300 + 100));
      await sleep(Math.random() * 1 + 0.5);
    }
  }

  /**
   * Accept cookie consent banner (Didomi)
   */
  private async acceptCookies(page: any): Promise<void> {
    const cookieSelectors = [
      'button[id*="didomi-notice-agree"]',
      'button[class*="didomi-agree"]',
      'button:has-text("Accepter")',
      'button:has-text("Tout accepter")',
      '#didomi-notice-agree-button',
    ];

    for (const selector of cookieSelectors) {
      try {
        const button = await page.waitForSelector(selector, { timeout: 3000 });
        if (button) {
          await sleep(Math.random() * 0.5 + 0.5);
          await button.click();
          this.logger.info('Cookie consent accepted');
          await sleep(1);
          return;
        }
      } catch {
        continue;
      }
    }
  }

  /**
   * Build page URLs for the request list
   */
  private buildPageUrls(): string[] {
    const urls: string[] = [];
    for (let i = 1; i <= this.config.maxPages; i++) {
      urls.push(i === 1 ? this.config.baseUrl : `${this.config.baseUrl}&page=${i}`);
    }
    return urls;
  }

  /**
   * Parse raw ad data from HTML using regex JSON extraction
   */
  private parseAdsFromHtml(html: string): RawAdData[] {
    // Primary method: Extract ads array from embedded JSON
    const regex = /"ads":(\[.+?\]),"ads_alu"/;
    const match = html.match(regex);

    if (match?.[1]) {
      return JSON.parse(match[1]);
    }

    // Fallback: broader regex
    const altRegex = /"ads":(\[[\s\S]+?\])(?=,"ads_alu"|,"parameters"|$)/;
    const altMatch = html.match(altRegex);

    if (altMatch?.[1]) {
      this.logger.warn('Using alternative regex for ad extraction');
      return JSON.parse(altMatch[1]);
    }

    this.logger.warn('No ads found in embedded JSON');
    return [];
  }

  /**
   * Transform raw ad to BotAdData format
   */
  private transformRawAd(rawAd: RawAdData): Partial<BotAdData> {
    const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());
    const ad: Partial<BotAdData> = {
      title: rawAd.subject?.substring(0, 200) || 'Sans titre',
      description: rawAd.body?.substring(0, 10000) || '',
      thumb_urls: rawAd.images?.urls?.slice(0, 10) || [],
      url: this.buildAdUrl(rawAd.url),
      price: this.parsePrice(rawAd.price),
      provider: 'leboncoin',
      location: {
        region_name: rawAd.location?.region_name?.substring(0, 100),
        department_id: rawAd.location?.department_id?.substring(0, 10),
        department_name: rawAd.location?.department_name?.substring(0, 100),
        city: rawAd.location?.city?.substring(0, 100),
        zipcode: rawAd.location?.zipcode?.substring(0, 10) || 'unknown',
        coordinates: this.extractCoordinates(rawAd.location),
      },
      release_date: releaseDate,
    };

    this.parseAdAttributes(ad, rawAd.attributes);
    return ad;
  }

  private buildAdUrl(url?: string): string {
    if (!url) return '';
    const fullUrl = url.startsWith('http') ? url : `https://www.leboncoin.fr/${url}`;
    return fullUrl.substring(0, 500);
  }

  private parsePrice(price?: unknown): number {
    if (!price) return 0;
    if (Array.isArray(price) && price.length > 0) return this.parsePrice(price[0]);
    if (typeof price === 'object' && (price as any).value !== undefined) return this.parsePrice((price as any).value);
    if (typeof price === 'string') return parseInt(price.replace(/\D/g, '')) || 0;
    if (typeof price === 'number') return price;
    return 0;
  }

  private extractCoordinates(location?: RawAdData['location']): [number, number] {
    const lng = location?.lng || location?.coordinates?.[0] || null;
    const lat = location?.lat || location?.coordinates?.[1] || null;
    return [lng, lat] as [number, number];
  }

  private parseAdAttributes(ad: Partial<BotAdData>, attributes?: Array<{ key: string; value: string; value_label?: string }>): void {
    if (!attributes) return;
    for (const attr of attributes) {
      switch (attr.key) {
        case 'real_estate_type':
          ad.real_estate_type = this.mapRealEstateType(attr.value_label);
          break;
        case 'rooms':
          ad.rooms = this.parseIntegerAttribute(attr.value);
          break;
        case 'square':
          ad.surface = this.parseIntegerAttribute(attr.value);
          break;
        case 'immo_sell_type':
          ad.immo_sell_type = this.mapImmoSellType(attr.value_label);
          break;
      }
    }
  }

  private mapRealEstateType(label?: string): string | undefined {
    const typeMap: Record<string, string> = {
      appartement: 'appartement', apartment: 'appartement',
      maison: 'maison', house: 'maison',
      terrain: 'terrain', land: 'terrain',
      parking: 'parking',
      'local commercial': 'local_commercial', commercial: 'local_commercial',
    };
    return typeMap[label?.toLowerCase() || ''] || undefined;
  }

  private mapImmoSellType(label?: string): string | undefined {
    const sellTypeMap: Record<string, string> = { old: 'ancien', new: 'neuf', ancien: 'ancien', neuf: 'neuf' };
    return sellTypeMap[label?.toLowerCase() || ''] || undefined;
  }

  private parseIntegerAttribute(value: string): number | undefined {
    const parsed = parseInt(value);
    return !isNaN(parsed) && parsed > 0 && parsed < 32767 ? parsed : undefined;
  }

  /**
   * Main scrape method using Crawlee PlaywrightCrawler
   */
  async scrape(): Promise<ScraperResult> {
    this.logger.info('Starting LeBonCoin scraping with Crawlee...');

    const { getLatestAdInDb, saveAds } = await import('./scraper-utils');
    const { date: latestDate, title: latestTitle } = await getLatestAdInDb(this.config.provider);
    this.logger.info(`Latest ad in DB: ${latestTitle} (${latestDate.toISOString()})`);

    let totalAdsSaved = 0;
    let pagesScraped = 0;
    let shouldStop = false;
    const retryArray: number[] = [];

    // Build request list - homepage first, then search pages
    const pageUrls = this.buildPageUrls();
    const requestList = await RequestList.open(null, [
      { url: 'https://www.leboncoin.fr', label: 'homepage' },
      ...pageUrls.map((url) => ({ url, label: 'search' })),
    ]);

    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 },
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];

    const self = this;

    const crawler = new PlaywrightCrawler({
      requestList,
      launchContext: {
        launcher: chromium,
        launchOptions: {
          headless: true,
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-translate',
            '--disable-extensions',
            '--lang=fr-FR',
            '--accept-lang=fr-FR,fr',
          ],
        },
      },
      browserPoolOptions: {
        maxOpenPagesPerBrowser: 1,
        retireBrowserAfterPageCount: 10,
      },
      useSessionPool: true,
      persistCookiesPerSession: true,
      maxRequestRetries: self.config.maxRetries,
      requestHandlerTimeoutSecs: 120,
      maxConcurrency: 1,

      preNavigationHooks: [
        async ({ page }) => {
          await page.setViewportSize(viewport);
          await page.addInitScript(self.getAntiDetectionScript());
          await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
          });
        },
      ],

      async requestHandler({ request, page, session, log }) {
        if (shouldStop) {
          log.info('Skipping - already up to date or stopped');
          return;
        }

        const label = request.label;

        // Homepage visit - establish session
        if (label === 'homepage') {
          log.info('Visiting homepage to establish session...');
          await sleep(Math.random() * 3 + 2);
          await self.acceptCookies(page);
          await self.simulateHumanBehavior(page);
          await sleep(Math.random() * 2 + 1);
          log.info('Homepage visit complete');
          return;
        }

        // Search page
        log.info(`Processing search page: ${request.url}`);

        // Human-like delay before interacting
        await sleep(Math.random() * 3 + 2);

        // Check for blocks
        const title = await page.title();
        if (title.toLowerCase().includes('captcha') || title.toLowerCase().includes('blocked')) {
          log.warning('CAPTCHA/block detected');
          session?.retire();
          shouldStop = true;
          throw new Error('Anti-bot protection detected');
        }

        // Wait for JavaScript render
        await sleep(5);

        // Try to detect ad containers
        try {
          await page.waitForSelector('[data-qa-id="aditem_container"]', { timeout: 5000 });
        } catch {
          log.warning('Ad containers not found');
        }

        // Simulate human behavior
        await self.simulateHumanBehavior(page);

        // Get HTML and parse ads
        const html = await page.content();
        log.info(`Fetched ${(html.length / 1024).toFixed(1)} KB`);

        const rawAds = self.parseAdsFromHtml(html);
        if (rawAds.length === 0) {
          log.warning('No ads found on page');
          retryArray.push(0);
          pagesScraped++;
          return;
        }

        log.info(`Found ${rawAds.length} raw ads`);

        // Process ads and check for up-to-date
        const newAds: Partial<BotAdData>[] = [];
        for (const rawAd of rawAds) {
          const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());
          if (
            releaseDate < latestDate ||
            (releaseDate.getTime() === latestDate.getTime() && rawAd.subject === latestTitle)
          ) {
            log.info('Reached latest ad in DB, stopping...');
            shouldStop = true;
            break;
          }
          newAds.push(self.transformRawAd(rawAd));
        }

        if (newAds.length > 0) {
          const savedCount = await saveAds(newAds, self.logger);
          totalAdsSaved += savedCount;
        }

        retryArray.push(0);
        pagesScraped++;

        // Human delay before next page
        const randomWait = self.config.waitSuccess + Math.random() * self.config.waitSuccess;
        log.info(`Waiting ${randomWait.toFixed(1)}s before next page...`);
        await sleep(randomWait);
      },

      failedRequestHandler({ request, log }) {
        log.error(`Request failed: ${request.url}`);
        retryArray.push(1);
      },
    });

    await crawler.run();

    const stats = calculateStatistics(retryArray);
    this.logger.info(`LeBonCoin scraping completed: ${totalAdsSaved} ads saved, ${pagesScraped} pages`);

    return {
      adsSaved: totalAdsSaved,
      pagesScraped,
      ...stats,
    };
  }
}

export const leboncoinScraper = new LeBonCoinCrawleeScraper();
```

**Step 2: Verify it compiles**

Run:
```bash
pnpm --filter @himo/bot exec tsc --noEmit
```
Expected: No new errors related to the LeBonCoin scraper. (Will fail until Task 4 creates `scraper-utils.ts`.)

**Step 3: Commit**

```bash
git add bot/src/scrapers/leboncoin-scraper-stealth.ts
git commit -m "feat(bot): rewrite LeBonCoin scraper with Crawlee PlaywrightCrawler"
```

---

### Task 3: Rewrite PAP Scraper with Crawlee

**Files:**
- Rewrite: `bot/src/scrapers/pap-scraper.ts`

**Context:** The PAP scraper uses infinite scroll + DOM parsing. We keep all parsing logic and scroll behavior, just wrap it in Crawlee's PlaywrightCrawler.

**Step 1: Rewrite the scraper**

Replace `bot/src/scrapers/pap-scraper.ts` with:

```typescript
import { PlaywrightCrawler, RequestList } from 'crawlee';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BotAdData } from './base-scraper';
import { ScraperConfig, ScraperResult } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep, calculateStatistics } from '../utils/utils';

chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 1,
  maxRetries: 3,
  waitSuccess: 20,
  waitError: 60,
  baseUrl: 'https://www.pap.fr/annonce/vente-immobilier-france-g25-2',
  provider: 'pap',
};

export class PAPCrawleeScraper {
  private config: ScraperConfig;
  private logger: Logger;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.provider);
  }

  /**
   * Scroll page to load more ads via infinite scroll
   */
  private async scrollToLoadMoreAds(page: any): Promise<void> {
    this.logger.info('Scrolling to load more ads...');

    let previousAdCount = 0;
    let scrollAttempts = 0;
    const maxScrolls = 10;
    const maxAds = 50;

    while (scrollAttempts < maxScrolls) {
      const currentAdCount = await page.$$eval(
        '.search-list-item-alt',
        (elements: any[]) => elements.length
      );

      if (currentAdCount >= maxAds) {
        this.logger.info(`   Reached ${currentAdCount} ads, stopping scroll`);
        break;
      }

      if (currentAdCount === previousAdCount && scrollAttempts > 2) {
        this.logger.info(`   No new ads after scroll (${currentAdCount} total)`);
        break;
      }

      previousAdCount = currentAdCount;

      await page.evaluate(() => {
        window.scrollBy({ top: window.innerHeight * 0.8, left: 0, behavior: 'smooth' });
      });

      await sleep(2 + Math.random() * 2);
      await page.mouse.move(500 + Math.random() * 500, 300 + Math.random() * 300);

      scrollAttempts++;
      this.logger.info(`   Scroll ${scrollAttempts}: ${currentAdCount} ads loaded`);
    }
  }

  /**
   * Extract listings from page using DOM selectors
   */
  private async extractListings(page: any): Promise<Array<{
    url: string;
    location: string;
    price: string;
    description: string;
    tags: string[];
    images: string[];
  }>> {
    return page.$$eval('.search-list-item-alt', (elements: any[]) => {
      return elements.map((el: any) => {
        const titleEl = el.querySelector('.item-title');
        const priceEl = el.querySelector('.item-price');
        const descEl = el.querySelector('.item-description');
        const tagsEls = el.querySelectorAll('.item-tags li');
        const imgEls = el.querySelectorAll('.owl-item img');

        const locationText = el.querySelector('.item-title .h1')?.textContent?.trim() || '';
        const tags = Array.from(tagsEls).map((tag: any) => tag.textContent?.trim() || '');
        const images = Array.from(imgEls)
          .map((img: any) => img.getAttribute('src'))
          .filter((src: any) => src && src.startsWith('http'));

        return {
          url: titleEl?.getAttribute('href') || '',
          location: locationText,
          price: priceEl?.textContent?.trim() || '',
          description: descEl?.textContent?.trim() || '',
          tags,
          images: images as string[],
        };
      });
    });
  }

  private buildFullUrl(relativeUrl: string): string {
    if (relativeUrl.startsWith('http')) return relativeUrl.substring(0, 500);
    return `https://www.pap.fr${relativeUrl}`.substring(0, 500);
  }

  private inferTypeFromUrl(url: string): string | undefined {
    if (url.includes('maison')) return 'maison';
    if (url.includes('appartement')) return 'appartement';
    if (url.includes('terrain')) return 'terrain';
    if (url.includes('parking')) return 'parking';
    return undefined;
  }

  private parsePrice(priceText: string): number {
    return parseInt(priceText.replace(/[^\d]/g, '')) || 0;
  }

  async scrape(): Promise<ScraperResult> {
    this.logger.info('Starting PAP scraping with Crawlee...');

    const { getLatestAdInDb, saveAds } = await import('./scraper-utils');
    const { title: latestTitle } = await getLatestAdInDb(this.config.provider);

    let totalAdsSaved = 0;
    let pagesScraped = 0;
    const retryArray: number[] = [];

    const requestList = await RequestList.open(null, [
      { url: this.config.baseUrl, label: 'search' },
    ]);

    const self = this;

    const crawler = new PlaywrightCrawler({
      requestList,
      launchContext: {
        launcher: chromium,
        launchOptions: {
          headless: true,
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--lang=fr-FR',
            '--accept-lang=fr-FR,fr',
          ],
        },
      },
      browserPoolOptions: {
        maxOpenPagesPerBrowser: 1,
      },
      useSessionPool: true,
      persistCookiesPerSession: true,
      maxRequestRetries: self.config.maxRetries,
      requestHandlerTimeoutSecs: 120,
      maxConcurrency: 1,

      preNavigationHooks: [
        async ({ page }) => {
          await page.setViewportSize({ width: 1920, height: 1080 });
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr-FR,fr;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          });
        },
      ],

      async requestHandler({ page, log }) {
        log.info('Processing PAP search page...');
        await sleep(3);

        // Wait for listings
        try {
          await page.waitForSelector('.search-list-item-alt', { timeout: 5000 });
          log.info('Listings detected');
        } catch {
          log.warning('Listings not found');
        }

        // Infinite scroll
        await self.scrollToLoadMoreAds(page);

        // Extract listings
        const listings = await self.extractListings(page);
        log.info(`Found ${listings.length} listings`);

        // Transform to ads
        const ads: Partial<BotAdData>[] = [];

        for (const listing of listings) {
          const title = `${listing.location}`.substring(0, 200);

          if (title === latestTitle) {
            log.info('Reached latest ad in DB');
            break;
          }

          let rooms: number | undefined;
          let surface: number | undefined;
          for (const tag of listing.tags) {
            if (tag.includes('piece')) rooms = parseInt(tag.replace(/\D/g, ''));
            else if (tag.includes('m')) surface = parseInt(tag.replace(/\D/g, ''));
          }

          const zipMatch = listing.location.match(/\((\d{5})\)/);
          const zipcode = zipMatch ? zipMatch[1] : 'unknown';
          const city = listing.location.replace(/\s*\(\d{5}\)/, '').trim();

          ads.push({
            title,
            description: listing.description.substring(0, 10000),
            thumb_urls: listing.images.slice(0, 10),
            url: self.buildFullUrl(listing.url),
            price: self.parsePrice(listing.price),
            provider: 'pap',
            release_date: new Date(),
            rooms,
            surface,
            real_estate_type: self.inferTypeFromUrl(listing.url),
            location: {
              city: city.substring(0, 100),
              zipcode: zipcode.substring(0, 10),
            },
          });
        }

        if (ads.length > 0) {
          const savedCount = await saveAds(ads, self.logger);
          totalAdsSaved += savedCount;
        }

        retryArray.push(0);
        pagesScraped++;
      },

      failedRequestHandler({ request, log }) {
        log.error(`Request failed: ${request.url}`);
        retryArray.push(1);
      },
    });

    await crawler.run();

    const stats = calculateStatistics(retryArray);
    this.logger.info(`PAP scraping completed: ${totalAdsSaved} ads saved`);

    return {
      adsSaved: totalAdsSaved,
      pagesScraped,
      ...stats,
    };
  }
}

export const papScraper = new PAPCrawleeScraper();
```

**Step 2: Commit**

```bash
git add bot/src/scrapers/pap-scraper.ts
git commit -m "feat(bot): rewrite PAP scraper with Crawlee PlaywrightCrawler"
```

---

### Task 4: Extract Shared Scraper Utilities

**Files:**
- Create: `bot/src/scrapers/scraper-utils.ts`
- Modify: `bot/src/scrapers/base-scraper.ts` (keep BotAdData interface, remove class)

**Context:** Both new scrapers import `saveAds` and `getLatestAdInDb` from a shared module. Extract these from BaseScraper into standalone functions.

**Step 1: Create scraper-utils.ts**

Create `bot/src/scrapers/scraper-utils.ts`:

```typescript
import { prisma } from '../lib/prisma';
import { Provider, Prisma, RealEstateType, ImmoSellType } from '@prisma/client';
import { BotAdData } from './base-scraper';
import { Logger } from '../utils/logger';

export async function getLatestAdInDb(provider: string): Promise<{ date: Date; title: string }> {
  const latestAd = await prisma.ad.findFirst({
    where: { provider: provider as Provider },
    orderBy: { releaseDate: 'desc' },
  });

  return {
    date: latestAd?.releaseDate || new Date(0),
    title: latestAd?.title || '',
  };
}

export async function saveAds(ads: Partial<BotAdData>[], logger: Logger): Promise<number> {
  if (ads.length === 0) {
    logger.info('No ads to save');
    return 0;
  }

  try {
    logger.info(`Saving ${ads.length} ads...`);

    const prismaAds: Prisma.AdCreateManyInput[] = ads.map((ad) => ({
      title: ad.title!,
      description: ad.description || '',
      thumbUrls: ad.thumb_urls || [],
      url: ad.url!,
      realEstateType: ad.real_estate_type as RealEstateType | undefined,
      rooms: ad.rooms,
      surface: ad.surface,
      immoSellType: ad.immo_sell_type as ImmoSellType | undefined,
      price: ad.price!,
      provider: ad.provider as Provider,
      releaseDate: ad.release_date!,
      regionName: ad.location?.region_name,
      departmentId: ad.location?.department_id,
      departmentName: ad.location?.department_name,
      city: ad.location?.city,
      zipcode: ad.location?.zipcode || 'unknown',
      latitude: ad.location?.coordinates?.[1],
      longitude: ad.location?.coordinates?.[0],
    }));

    const result = await prisma.ad.createMany({
      data: prismaAds,
      skipDuplicates: true,
    });

    logger.info(`${result.count} ads saved successfully`);
    return result.count;
  } catch (error: unknown) {
    logger.error('Error saving ads:', error);
    throw error;
  }
}
```

**Step 2: Simplify base-scraper.ts**

Keep only the `BotAdData` interface in `bot/src/scrapers/base-scraper.ts` (remove the `BaseScraper` class):

```typescript
// Shared types for bot ad data - used by all scrapers
export interface BotAdData {
  title: string;
  description: string;
  thumb_urls?: string[];
  url: string;
  real_estate_type?: string;
  rooms?: number;
  surface?: number;
  immo_sell_type?: string;
  price: number;
  provider: string;
  location?: {
    region_name?: string;
    department_id?: string;
    department_name?: string;
    city?: string;
    zipcode?: string;
    coordinates?: number[];
  };
  release_date: Date;
}
```

**Step 3: Verify compilation**

Run:
```bash
pnpm --filter @himo/bot exec tsc --noEmit
```
Expected: PASS - all imports resolve, types match.

**Step 4: Commit**

```bash
git add bot/src/scrapers/scraper-utils.ts bot/src/scrapers/base-scraper.ts
git commit -m "refactor(bot): extract shared scraper utilities, simplify base-scraper to types only"
```

---

### Task 5: Update Scraping Task to Run Sequentially

**Files:**
- Modify: `bot/src/tasks/scraping-task.ts`

**Context:** Change `Promise.all` (parallel) to sequential execution. This halves peak memory since only one browser runs at a time.

**Step 1: Update scraping-task.ts**

Change lines 68-83 in `scraping-task.ts` from:

```typescript
const results = await Promise.all(
  scrapers.map(async ({ name, scraper }) => {
    try {
      return await runScraper(name, scraper);
    } catch (error) {
      ...
    }
  })
);
```

To:

```typescript
const results: ScraperResult[] = [];
for (const { name, scraper } of scrapers) {
  try {
    const result = await runScraper(name, scraper);
    results.push(result);
  } catch (error) {
    logger.error(`${name} scraper failed:`, error);
    results.push({
      adsSaved: 0,
      pagesScraped: 0,
      failurePercentage: 100,
      averageRetriesPerRequest: 0,
    });
  }
}
```

**Step 2: Verify compilation**

Run:
```bash
pnpm --filter @himo/bot exec tsc --noEmit
```
Expected: PASS

**Step 3: Commit**

```bash
git add bot/src/tasks/scraping-task.ts
git commit -m "perf(bot): run scrapers sequentially to halve peak memory usage"
```

---

### Task 6: Slim Down Docker Configuration

**Files:**
- Rewrite: `bot/Dockerfile.prod`
- Modify: `docker-compose.prod.yml`

**Step 1: Rewrite bot/Dockerfile.prod**

Replace entire file:

```dockerfile
FROM node:22-slim

# Install only Playwright's Chromium dependencies (no Xvfb, no X11)
RUN apt-get update && \
    npx playwright install --with-deps chromium && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@10.22.0

WORKDIR /app

# Copy root config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.cjs tsconfig.json ./

# Copy workspace package.json files
COPY commons/package.json ./commons/
COPY api/package.json ./api/
COPY bot/package.json ./bot/

# Copy workspace source code
COPY commons ./commons
COPY api ./api
COPY api/prisma ./api/prisma
COPY bot ./bot

# Install dependencies
RUN pnpm install --frozen-lockfile --filter api --filter bot

# Generate Prisma Client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm --filter api exec prisma generate

# Build TypeScript
WORKDIR /app/bot
RUN pnpm run build || true

# Node.js memory limit for safety
ENV NODE_OPTIONS="--max-old-space-size=384"

# Start: run migrations then start bot (no Xvfb needed)
CMD sh -c "cd /app/api && npx prisma migrate deploy && cd /app/bot && pnpm start"
```

**Step 2: Add memory limits to docker-compose.prod.yml**

Add `mem_limit` and `shm_size` to each service:

```yaml
services:
  api:
    # ... existing config ...
    mem_limit: 256m

  client:
    # ... existing config ...
    mem_limit: 128m

  bot:
    # ... existing config ...
    mem_limit: 512m
    shm_size: 256m

  db:
    # ... existing config ...
    mem_limit: 512m
    shm_size: 256m
```

**Step 3: Commit**

```bash
git add bot/Dockerfile.prod docker-compose.prod.yml
git commit -m "perf(bot): slim Docker image (no Xvfb), add memory limits to all containers"
```

---

### Task 7: Clean Up Unused Files and Env Vars

**Files:**
- Modify: `docker-compose.yml` (remove HEADLESS, DISPLAY from bot service)
- Clean up any Xvfb-related references

**Step 1: Remove HEADLESS and DISPLAY env vars from compose files**

In `docker-compose.yml`, remove these lines from the bot service:
```yaml
      DISPLAY: :99
      HEADLESS: "false"
```

Also remove `mem_limit: 512m` and `shm_size: 256m` from the dev compose bot service (Crawlee manages its own memory in dev).

**Step 2: Verify no remaining Xvfb references**

Run:
```bash
grep -r "Xvfb\|DISPLAY.*:99\|HEADLESS" bot/ docker-compose*.yml --include="*.ts" --include="*.yml" --include="*.yaml" --include="Dockerfile*"
```
Expected: No matches (or only in comments/docs).

**Step 3: Commit**

```bash
git add -A
git commit -m "chore(bot): remove Xvfb, HEADLESS, and DISPLAY references"
```

---

### Task 8: Type-Check and Build Verification

**Step 1: Run type-check**

```bash
pnpm type-check
```
Expected: PASS

**Step 2: Run build**

```bash
pnpm --filter @himo/bot build
```
Expected: PASS - produces `bot/dist/` output.

**Step 3: Run lint**

```bash
pnpm lint
```
Expected: PASS (or only pre-existing warnings).

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(bot): resolve type-check and lint issues from Crawlee migration"
```

---

### Task 9: Local Docker Build Test

**Step 1: Build the bot Docker image locally**

```bash
docker build -f bot/Dockerfile.prod -t himo-bot:crawlee-test .
```
Expected: Build succeeds without Xvfb-related errors.

**Step 2: Verify image size reduction**

```bash
docker images himo-bot:crawlee-test --format "{{.Size}}"
```
Expected: Significantly smaller than the previous image (no Xvfb/X11 packages).

**Step 3: Quick smoke test**

```bash
docker run --rm himo-bot:crawlee-test node -e "const { PlaywrightCrawler } = require('crawlee'); console.log('Crawlee loaded OK')"
```
Expected: Prints "Crawlee loaded OK".

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore(bot): verify Docker build with Crawlee migration"
```
