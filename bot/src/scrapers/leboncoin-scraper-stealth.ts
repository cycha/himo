// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This file uses browser APIs (navigator, window) which are not available in Node context
import { PlaywrightCrawler, RequestList } from 'crawlee';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BotAdData } from './base-scraper';
import { ScraperConfig, ScraperResult, RawAdData } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep, calculateStatistics, getRandomUserAgent } from '../utils/utils';

// Add stealth plugin to playwright
chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5,
  maxRetries: 0, // No retries - if blocked, stop immediately to avoid detection
  waitSuccess: 20, // 20-40s between pages
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
   * Anti-detection script injected into every page
   */
  private getAntiDetectionScript() {
    return () => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      const originalQuery = (window as any).navigator.permissions.query;
      (window as any).navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as any)
          : originalQuery(parameters);

      (window as any).chrome = {
        runtime: {},
        loadTimes: function () {},
        csi: function () {},
        app: {},
      };

      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', description: '', filename: 'internal-nacl-plugin' },
        ],
      });

      Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en-US', 'en'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
      (navigator as any).getBattery = () =>
        Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1,
          onchargingchange: null,
          onchargingtimechange: null,
          ondischargingtimechange: null,
          onlevelchange: null,
        });
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
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * 1500 + 100);
      const y = Math.floor(Math.random() * 800 + 100);
      await page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 20) });
      await sleep(Math.random() * 0.5 + 0.2);
    }

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
   * Build location object from raw ad location data
   */
  private buildLocation(location?: RawAdData['location']): BotAdData['location'] {
    return {
      region_name: location?.region_name?.substring(0, 100),
      department_id: location?.department_id?.substring(0, 10),
      department_name: location?.department_name?.substring(0, 100),
      city: location?.city?.substring(0, 100),
      zipcode: location?.zipcode?.substring(0, 10) || 'unknown',
      coordinates: this.extractCoordinates(location),
    };
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
      location: this.buildLocation(rawAd.location),
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
    if (typeof price === 'object' && (price as any).value !== undefined)
      return this.parsePrice((price as any).value);
    if (typeof price === 'string') return parseInt(price.replace(/\D/g, '')) || 0;
    if (typeof price === 'number') return price;
    return 0;
  }

  private extractCoordinates(location?: RawAdData['location']): [number, number] {
    const lng = location?.lng || location?.coordinates?.[0] || null;
    const lat = location?.lat || location?.coordinates?.[1] || null;
    return [lng, lat] as [number, number];
  }

  private parseAdAttributes(
    ad: Partial<BotAdData>,
    attributes?: Array<{ key: string; value: string; value_label?: string }>
  ): void {
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
      appartement: 'appartement',
      apartment: 'appartement',
      maison: 'maison',
      house: 'maison',
      terrain: 'terrain',
      land: 'terrain',
      parking: 'parking',
      'local commercial': 'local_commercial',
      commercial: 'local_commercial',
    };
    return typeMap[label?.toLowerCase() || ''] || undefined;
  }

  private mapImmoSellType(label?: string): string | undefined {
    const sellTypeMap: Record<string, string> = {
      old: 'ancien',
      new: 'neuf',
      ancien: 'ancien',
      neuf: 'neuf',
    };
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

    // Bind methods for use in Crawlee handlers (arrow functions don't have `this`)
    const acceptCookies = this.acceptCookies.bind(this);
    const simulateHumanBehavior = this.simulateHumanBehavior.bind(this);
    const getAntiDetectionScript = this.getAntiDetectionScript.bind(this);
    const parseAdsFromHtml = this.parseAdsFromHtml.bind(this);
    const transformRawAd = this.transformRawAd.bind(this);
    const logger = this.logger;
    const config = this.config;

    const crawler = new PlaywrightCrawler({
      requestList,
      launchContext: {
        launcher: chromium,
        // Force launch() instead of launchPersistentContext() so playwright-extra's
        // StealthPlugin hooks fire correctly (onBrowser, _bindBrowserEvents)
        useIncognitoPages: true,
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
            '--lang=fr-FR',
            '--accept-lang=fr-FR,fr',
          ],
        },
        userAgent: getRandomUserAgent(),
      },
      browserPoolOptions: {
        maxOpenPagesPerBrowser: 1,
        retireBrowserAfterPageCount: 10,
      },
      useSessionPool: true,
      persistCookiesPerSession: true,
      sessionPoolOptions: {
        // Remove 403 from blocked status codes — DataDome serves a challenge page
        // on 403 that we need to process, not treat as a hard block
        blockedStatusCodes: [401, 429],
      },
      maxRequestRetries: config.maxRetries,
      requestHandlerTimeoutSecs: 120,
      maxConcurrency: 1,

      preNavigationHooks: [
        async ({ page }) => {
          await page.setViewportSize(viewport);
          await page.addInitScript(getAntiDetectionScript());
          await page.setExtraHTTPHeaders({
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            DNT: '1',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
          });
        },
      ],

      async requestHandler({ request, page, session, log, response }) {
        if (shouldStop) {
          log.info('Skipping — already up to date or stopped');
          return;
        }

        const label = request.label;

        // Homepage visit — establish session
        if (label === 'homepage') {
          log.info('Visiting homepage to establish session...');
          await sleep(Math.random() * 3 + 2);
          await acceptCookies(page);
          await simulateHumanBehavior(page);
          await sleep(Math.random() * 2 + 1);
          log.info('Homepage visit complete');
          return;
        }

        // Search page
        log.info(`Processing search page: ${request.url}`);
        await sleep(Math.random() * 3 + 2);

        // Check for blocks — HTTP status or page content
        const statusCode = response?.status();
        const title = await page.title();
        const isBlocked =
          statusCode === 403 ||
          title.toLowerCase().includes('captcha') ||
          title.toLowerCase().includes('blocked') ||
          title.toLowerCase().includes('datadome');
        if (isBlocked) {
          log.warning(`Block detected (status=${statusCode}, title="${title}")`);
          session?.retire();
          throw new Error(`Anti-bot protection detected (status=${statusCode})`);
        }

        // Wait for JavaScript render
        await sleep(5);

        try {
          await page.waitForSelector('[data-qa-id="aditem_container"]', { timeout: 5000 });
        } catch {
          log.warning('Ad containers not found');
        }

        await simulateHumanBehavior(page);

        // Get HTML and parse ads
        const html = await page.content();
        log.info(`Fetched ${(html.length / 1024).toFixed(1)} KB`);

        const rawAds = parseAdsFromHtml(html);
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
          newAds.push(transformRawAd(rawAd));
        }

        if (newAds.length > 0) {
          const savedCount = await saveAds(newAds, logger);
          totalAdsSaved += savedCount;
        }

        retryArray.push(0);
        pagesScraped++;

        // Human delay before next page
        const randomWait = config.waitSuccess + Math.random() * config.waitSuccess;
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
