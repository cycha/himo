import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'playwright';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult, ScraperResult } from '../types/scraper.types';
import { sleep } from '../utils/utils';
import * as fs from 'fs';
import * as path from 'path';

// Add stealth plugin
chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 1, // Only scrape first page (15 ads) - pagination format needs investigation
  maxRetries: 3,
  waitSuccess: 20,
  waitError: 60,
  baseUrl: 'https://www.pap.fr/annonce/vente-immobilier-france-g25-2',
  provider: 'pap',
};

export class PAPScraper extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private cookieStoragePath = path.join(process.cwd(), '.scraper-storage', 'pap-cookies.json');

  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  private async loadCookies(): Promise<void> {
    if (!this.page) return;

    try {
      if (fs.existsSync(this.cookieStoragePath)) {
        const cookiesData = fs.readFileSync(this.cookieStoragePath, 'utf-8');
        const cookies = JSON.parse(cookiesData);
        await this.page.context().addCookies(cookies);
        this.logger.info(`🍪 Loaded ${cookies.length} saved cookies`);
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to load cookies:', error);
    }
  }

  private async saveCookies(): Promise<void> {
    if (!this.page) return;

    try {
      const cookies = await this.page.context().cookies();
      const dir = path.dirname(this.cookieStoragePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.cookieStoragePath, JSON.stringify(cookies, null, 2));
      this.logger.info(`💾 Saved ${cookies.length} cookies`);
    } catch (error) {
      this.logger.warn('⚠️ Failed to save cookies:', error);
    }
  }

  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.logger.info('🥷 Initializing stealth browser for PAP.fr...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const launchOptions: any = {
      headless: process.env.HEADLESS !== 'false',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--lang=fr-FR',
        '--accept-lang=fr-FR,fr',
      ],
    };

    this.browser = await chromium.launch(launchOptions);

    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      locale: 'fr-FR',
      timezoneId: 'Europe/Paris',
    });

    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    });

    this.logger.info('✅ Browser initialized');
    await this.loadCookies();
  }

  async fetchPage(url: string, _userAgent: string): Promise<string> {
    await this.initBrowser();

    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      this.logger.info(`📄 Fetching: ${url}`);
      await sleep(Math.random() * 2 + 1);

      const response = await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      if (!response) {
        throw new Error('No response from page');
      }

      const status = response.status();
      this.logger.info(`   HTTP Status: ${status}`);

      if (status !== 200) {
        throw new Error(`HTTP ${status}`);
      }

      // Wait for content to load
      await sleep(3);

      // Try to wait for listings
      try {
        await this.page.waitForSelector('.search-list-item-alt', { timeout: 5000 });
        this.logger.info('✅ Listings detected');
      } catch {
        this.logger.warn('⚠️ Listings not found with selectors');
      }

      // PAP uses infinite scroll - scroll to load more ads
      await this.scrollToLoadMoreAds();

      const html = await this.page.content();
      this.logger.info(`✅ Fetched ${(html.length / 1024).toFixed(1)} KB`);

      return html;
    } catch (error) {
      this.logger.error('❌ Error fetching page:', error);
      throw error;
    }
  }

  private async scrollToLoadMoreAds(): Promise<void> {
    if (!this.page) return;

    this.logger.info('📜 Scrolling to load more ads (infinite scroll)...');

    let previousAdCount = 0;
    let scrollAttempts = 0;
    const maxScrolls = 10; // Limit scrolling to avoid infinite loops
    const maxAds = 50; // Stop after 50 ads

    while (scrollAttempts < maxScrolls) {
      // Count current ads
      const currentAdCount = await this.page.$$eval(
        '.search-list-item-alt',
        (elements) => elements.length
      );

      if (currentAdCount >= maxAds) {
        this.logger.info(`   Reached ${currentAdCount} ads, stopping scroll`);
        break;
      }

      if (currentAdCount === previousAdCount && scrollAttempts > 2) {
        this.logger.info(`   No new ads loaded after scroll, stopping (${currentAdCount} total)`);
        break;
      }

      previousAdCount = currentAdCount;

      // Scroll down smoothly
      await this.page.evaluate(() => {
        // @ts-expect-error - window is available in browser context
        window.scrollBy({
          // @ts-expect-error - window is available in browser context
          top: window.innerHeight * 0.8,
          left: 0,
          behavior: 'smooth',
        });
      });

      // Wait for new content to load
      await sleep(2 + Math.random() * 2);

      // Move mouse to simulate human behavior
      await this.page.mouse.move(500 + Math.random() * 500, 300 + Math.random() * 300);

      scrollAttempts++;
      this.logger.info(`   Scroll ${scrollAttempts}: ${currentAdCount} ads loaded`);
    }

    const finalCount = await this.page.$$eval(
      '.search-list-item-alt',
      (elements) => elements.length
    );
    this.logger.info(`✅ Finished scrolling: ${finalCount} total ads`);
  }

  async parseAds(html: string, latestDate: Date, latestTitle: string): Promise<ParseResult> {
    const ads: Partial<BotAdData>[] = [];
    let isUpToDate = false;

    if (!this.page) {
      this.logger.error('❌ Page not available for parsing');
      return { ads, isUpToDate };
    }

    try {
      // PAP uses server-rendered HTML - extract data using selectors
      const listings = await this.page.$$eval('.search-list-item-alt', (elements) => {
        return elements.map((el) => {
          const titleEl = el.querySelector('.item-title');
          const priceEl = el.querySelector('.item-price');
          const descEl = el.querySelector('.item-description');
          const tagsEls = el.querySelectorAll('.item-tags li');
          const imgEls = el.querySelectorAll('.owl-item img');

          // Extract location from title h1
          const locationText = el.querySelector('.item-title .h1')?.textContent?.trim() || '';

          // Extract tags (rooms, surface, etc)
          // @ts-expect-error - tag is HTMLElement in browser context
          const tags = Array.from(tagsEls).map((tag) => tag.textContent?.trim() || '');

          // Extract images
          const images = Array.from(imgEls)
            // @ts-expect-error - img is HTMLImageElement in browser context
            .map((img) => img.getAttribute('src'))
            .filter((src) => src && src.startsWith('http'));

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

      this.logger.info(`✅ Found ${listings.length} listings`);

      for (const listing of listings) {
        // For now, use current date (PAP doesn't show publish dates in list view)
        const releaseDate = new Date();

        const title = `${listing.location}`.substring(0, 200);

        if (title === latestTitle) {
          this.logger.info('🛑 Reached latest ad in DB (same title)');
          isUpToDate = true;
          break;
        }

        // Parse price
        const price = this.parsePrice(listing.price);

        // Parse rooms and surface from tags
        let rooms: number | undefined;
        let surface: number | undefined;

        for (const tag of listing.tags) {
          if (tag.includes('pièce')) {
            rooms = parseInt(tag.replace(/\D/g, ''));
          } else if (tag.includes('m²')) {
            surface = parseInt(tag.replace(/\D/g, ''));
          }
        }

        // Extract city and zipcode from location string (e.g., "Paris 18E (75018)")
        const zipMatch = listing.location.match(/\((\d{5})\)/);
        const zipcode = zipMatch ? zipMatch[1] : 'unknown';
        const city = listing.location.replace(/\s*\(\d{5}\)/, '').trim();

        ads.push({
          title,
          description: listing.description.substring(0, 10000),
          thumb_urls: listing.images.slice(0, 10),
          url: this.buildFullUrl(listing.url),
          price,
          provider: 'pap',
          release_date: releaseDate,
          rooms,
          surface,
          real_estate_type: this.inferTypeFromUrl(listing.url),
          location: {
            city: city.substring(0, 100),
            zipcode: zipcode.substring(0, 10),
          },
        });
      }
    } catch (error) {
      this.logger.error('❌ Error parsing ads:', error);
    }

    return { ads, isUpToDate };
  }

  private buildFullUrl(relativeUrl: string): string {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl.substring(0, 500);
    }
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
    // Parse "480.000 €" format
    const cleaned = priceText.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  }

  private mapRealEstateType(type?: string): string | undefined {
    if (!type) return undefined;
    const typeMap: Record<string, string> = {
      appartement: 'appartement',
      apartment: 'appartement',
      maison: 'maison',
      house: 'maison',
      terrain: 'terrain',
      parking: 'parking',
    };
    return typeMap[type.toLowerCase()] || undefined;
  }

  async close(): Promise<void> {
    await this.saveCookies();
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.info('🔒 Browser closed');
    }
  }

  async scrape(customUrl?: string): Promise<ScraperResult> {
    try {
      return await super.scrape(customUrl);
    } finally {
      await this.close();
    }
  }
}

export const papScraper = new PAPScraper();
