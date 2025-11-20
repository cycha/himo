// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This file uses browser APIs (navigator, window) which are not available in Node context
import { chromium, Browser, Page } from 'playwright';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult, RawAdData } from '../types/scraper.types';
import { sleep } from '../utils/utils';

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 30,
  maxRetries: 10,
  waitSuccess: 3,
  waitError: 6,
  baseUrl: 'https://www.leboncoin.fr/recherche?category=9',
  provider: 'leboncoin',
};

/**
 * Top-notch LeBonCoin scraper using Playwright
 * Features:
 * - Headless browser (looks like real user)
 * - Stealth mode (anti-detection)
 * - Handles JavaScript rendering
 * - Bypasses most anti-bot measures
 * - FREE and open-source
 */
export class LeBonCoinScraperPlaywright extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * Initialize browser with stealth settings
   */
  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.logger.info('🚀 Initializing Playwright browser...');

    this.browser = await chromium.launch({
      headless: true, // Set to false for debugging
      args: [
        '--disable-blink-features=AutomationControlled', // Hide automation
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--lang=fr-FR,fr',
      ],
    });

    // Create new page with stealth settings
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'fr-FR',
      timezoneId: 'Europe/Paris',
    });

    // Set extra HTTP headers
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    // Override navigator properties to hide automation
    const antiDetectionScript = () => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Override the navigator.plugins to add fake plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override the navigator.languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['fr-FR', 'fr', 'en-US', 'en'],
      });

      // Add fake chrome object
      (window as any).chrome = {
        runtime: {},
      };

      // Override permissions
      const originalQuery = (window as any).navigator.permissions.query;
      (window as any).navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as any)
          : originalQuery(parameters);
    };
    await this.page.addInitScript(antiDetectionScript);

    this.logger.info('✅ Browser initialized with stealth mode');
  }

  /**
   * Fetch page using Playwright (headless browser)
   */
  async fetchPage(url: string, _userAgent: string): Promise<string> {
    await this.initBrowser();

    if (!this.page) {
      throw new Error('Browser page not initialized');
    }

    try {
      this.logger.info(`📄 Fetching: ${url}`);

      // Random delay to appear more human
      await sleep(Math.random() * 2 + 1);

      // Navigate to page
      const response = await this.page.goto(url, {
        waitUntil: 'domcontentloaded', // Don't wait for networkidle, it's too strict
        timeout: 60000,
      });

      if (!response) {
        throw new Error('No response from page');
      }

      // Check for CAPTCHA or blocking
      const title = await this.page.title();
      if (title.toLowerCase().includes('captcha') || title.toLowerCase().includes('blocked')) {
        this.logger.warn('⚠️ CAPTCHA or blocking detected!');
        throw new Error('CAPTCHA detected');
      }

      // Wait for React to render (LeBonCoin is a SPA)
      this.logger.info('⏳ Waiting for page to fully render...');
      await this.page.waitForTimeout(5000); // Wait 5 seconds for JavaScript to execute

      // Try to wait for ads to load
      try {
        await this.page.waitForSelector('[data-qa-id="aditem_container"]', { timeout: 5000 });
        this.logger.info('✅ Ads loaded successfully');
      } catch {
        this.logger.warn('⚠️ Ad containers not found after wait, checking HTML anyway...');
      }

      // Random mouse movement to appear human
      await this.page.mouse.move(
        Math.floor(Math.random() * 1000),
        Math.floor(Math.random() * 800)
      );

      // Scroll page slightly (human behavior)
      await this.page.evaluate(() => {
        window.scrollBy(0, Math.floor(Math.random() * 300 + 100));
      });

      // Small delay
      await sleep(0.5 + Math.random());

      // Get page content
      const html = await this.page.content();

      this.logger.info(`✅ Fetched ${html.length} bytes`);

      return html;
    } catch (error) {
      this.logger.error('❌ Error fetching page with Playwright:', error);
      throw error;
    }
  }

  /**
   * Parse ads from HTML (same as before)
   */
  async parseAds(html: string, latestDate: Date, latestTitle: string): Promise<ParseResult> {
    const ads: Partial<BotAdData>[] = [];
    let isUpToDate = false;

    try {
      // Method 1: Extract ads array from embedded JSON
      const regex = /"ads":(\[.+?\]),"ads_alu"/;
      const match = html.match(regex);

      if (!match || !match[1]) {
        this.logger.warn('⚠️ No ads found in embedded JSON (primary method)');
        
        // Method 2: Try alternative extraction
        const altRegex = /"ads":(\[.+?\])(?:,"|$)/;
        const altMatch = html.match(altRegex);
        
        if (!altMatch || !altMatch[1]) {
          this.logger.warn('⚠️ No ads found with alternative method either');
          return { ads: [], isUpToDate: true };
        }
        
        const rawAds: RawAdData[] = JSON.parse(altMatch[1]);
        this.logger.info(`✅ Found ${rawAds.length} raw ads (alternative method)`);
        
        for (const rawAd of rawAds) {
          const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());
          
          if (releaseDate < latestDate || (releaseDate.getTime() === latestDate.getTime() && rawAd.subject === latestTitle)) {
            this.logger.info('🛑 Reached latest ad in DB, stopping...');
            isUpToDate = true;
            break;
          }
          
          const parsedAd = this.transformRawAd(rawAd, releaseDate);
          ads.push(parsedAd);
        }
        
        return { ads, isUpToDate };
      }

      const rawAds: RawAdData[] = JSON.parse(match[1]);
      this.logger.info(`✅ Found ${rawAds.length} raw ads`);

      for (const rawAd of rawAds) {
        const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());

        // Check if we've reached ads we already have
        if (releaseDate < latestDate || (releaseDate.getTime() === latestDate.getTime() && rawAd.subject === latestTitle)) {
          this.logger.info('🛑 Reached latest ad in DB, stopping...');
          isUpToDate = true;
          break;
        }

        const parsedAd = this.transformRawAd(rawAd, releaseDate);
        ads.push(parsedAd);
      }
    } catch (error) {
      this.logger.error('❌ Error parsing ads from HTML:', error);
      throw error;
    }

    return { ads, isUpToDate };
  }

  /**
   * Transform raw ad data to our format
   */
  private transformRawAd(rawAd: RawAdData, releaseDate: Date): Partial<BotAdData> {
    const ad: Partial<BotAdData> = {
      title: rawAd.subject,
      description: rawAd.body || '',
      thumb_urls: rawAd.images?.urls || [],
      url: rawAd.url.startsWith('http') ? rawAd.url : `https://www.leboncoin.fr/${rawAd.url}`,
      price: typeof rawAd.price === 'string' ? parseInt(rawAd.price) : rawAd.price,
      provider: 'leboncoin',
      location: {
        region_name: rawAd.location?.region_name,
        department_id: rawAd.location?.department_id,
        department_name: rawAd.location?.department_name,
        city: rawAd.location?.city,
        zipcode: rawAd.location?.zipcode || 'unknown',
        coordinates: rawAd.location?.coordinates,
      },
      release_date: releaseDate,
    };

    // Parse attributes
    if (rawAd.attributes) {
      for (const attr of rawAd.attributes) {
        switch (attr.key) {
          case 'real_estate_type':
            ad.real_estate_type = attr.value_label?.toLowerCase();
            break;
          case 'rooms':
            ad.rooms = parseInt(attr.value);
            break;
          case 'square':
            ad.surface = parseInt(attr.value);
            break;
          case 'immo_sell_type': {
            // Map English labels to French enum values
            const sellTypeMap: Record<string, string> = {
              'old': 'ancien',
              'new': 'neuf',
              'ancien': 'ancien',
              'neuf': 'neuf',
            };
            const sellTypeLabel = attr.value_label?.toLowerCase();
            ad.immo_sell_type = sellTypeLabel ? sellTypeMap[sellTypeLabel] : undefined;
            break;
          }
        }
      }
    }

    return ad;
  }

  /**
   * Close browser when done
   */
  async close(): Promise<void> {
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

  /**
   * Override scrape to ensure browser cleanup
   */
  async scrape(customUrl?: string): Promise<any> {
    try {
      return await super.scrape(customUrl);
    } finally {
      await this.close();
    }
  }
}

// Export singleton instance
export const leboncoinScraperPlaywright = new LeBonCoinScraperPlaywright();

// For backward compatibility
export const leboncoinScraper = leboncoinScraperPlaywright;
