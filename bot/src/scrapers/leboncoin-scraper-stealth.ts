import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'playwright';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult, RawAdData } from '../types/scraper.types';
import { sleep } from '../utils/utils';

// Add stealth plugin to playwright
chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 30,
  maxRetries: 1,  // Only 1 retry - if blocked once, stop to avoid detection
  waitSuccess: 5, // Longer wait between pages
  waitError: 10,  // Much longer wait on errors
  baseUrl: 'https://www.leboncoin.fr/recherche?category=9',
  provider: 'leboncoin',
};

/**
 * ULTRA-STEALTH LeBonCoin Scraper
 * 
 * Advanced anti-detection techniques:
 * - playwright-extra with stealth plugin (best-in-class)
 * - Real browser fingerprinting
 * - Human behavior simulation
 * - Random delays and patterns
 * - WebGL, Canvas, Audio fingerprint evasion
 * - Chrome DevTools Protocol evasion
 * - Timezone, locale, and language consistency
 * - Proxy support (optional)
 */
export class LeBonCoinScraperStealth extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * Get random user agent
   */
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Initialize browser with MAXIMUM stealth
   */
  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.logger.info('🥷 Initializing ULTRA-STEALTH browser...');

    const launchOptions: any = {
      headless: process.env.HEADLESS === 'false' ? false : true,
      args: [
        // Essential stealth args
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        
        // Additional stealth
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-translate',
        '--disable-extensions',
        
        // Language and locale
        '--lang=fr-FR',
        '--accept-lang=fr-FR,fr',
      ],
    };

    // Add proxy if configured (from environment)
    if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
      const proxyUrl = `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
      this.logger.info(`🔒 Using proxy: ${proxyUrl}`);
      launchOptions.proxy = {
        server: proxyUrl,
        username: process.env.PROXY_USERNAME,
        password: process.env.PROXY_PASSWORD,
      };
    }

    // Launch browser with stealth plugin
    this.browser = await chromium.launch(launchOptions);

    // Create stealth page
    const userAgent = this.getRandomUserAgent();
    this.page = await this.browser.newPage({
      viewport: { 
        width: 1920 + Math.floor(Math.random() * 100), 
        height: 1080 + Math.floor(Math.random() * 100) 
      },
      userAgent,
      locale: 'fr-FR',
      timezoneId: 'Europe/Paris',
      geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Paris
      permissions: ['geolocation'],
      colorScheme: 'light',
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      javaScriptEnabled: true,
    });

    // Set extra HTTP headers
    await this.page.setExtraHTTPHeaders({
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

    // Advanced anti-detection scripts
    await this.page.addInitScript(() => {
      // 1. Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // 2. Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters);

      // 3. Add chrome object
      (window as any).chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {},
      };

      // 4. Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', description: '', filename: 'internal-nacl-plugin' },
        ],
      });

      // 5. Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['fr-FR', 'fr', 'en-US', 'en'],
      });

      // 6. Override platform
      Object.defineProperty(navigator, 'platform', {
        get: () => 'MacIntel',
      });

      // 7. Override vendor
      Object.defineProperty(navigator, 'vendor', {
        get: () => 'Google Inc.',
      });

      // 8. Mock battery API
      (navigator as any).getBattery = () => Promise.resolve({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 1,
        onchargingchange: null,
        onchargingtimechange: null,
        ondischargingtimechange: null,
        onlevelchange: null,
      });

      // 9. Add realistic connection
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          rtt: 50,
          downlink: 10,
          saveData: false,
        }),
      });

      // 10. Override hardwareConcurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
      });

      // 11. Override deviceMemory
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
      });

      // 12. Override maxTouchPoints
      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 0,
      });
    });

    this.logger.info('✅ Ultra-stealth browser initialized');
    this.logger.info(`   User-Agent: ${userAgent.substring(0, 50)}...`);
  }

  /**
   * Fetch page with advanced human simulation
   */
  async fetchPage(url: string, userAgent: string): Promise<string> {
    await this.initBrowser();

    if (!this.page) {
      throw new Error('Browser page not initialized');
    }

    try {
      this.logger.info(`📄 Fetching: ${url}`);

      // Random human-like delay
      await sleep(Math.random() * 3 + 2);

      // Navigate with realistic timeout
      const response = await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      if (!response) {
        throw new Error('No response from page');
      }

      // Check response status
      const status = response.status();
      this.logger.info(`   HTTP Status: ${status}`);
      
      if (status !== 200) {
        this.logger.warn(`⚠️ HTTP ${status} response - BLOCKED!`);
        const responseText = await response.text();
        this.logger.warn(`   Response preview: ${responseText.substring(0, 200)}...`);
        if (status === 403) {
          throw new Error(`HTTP 403 Forbidden - Anti-bot protection detected`);
        }
      }

      // Wait for initial render
      await sleep(2);

      // Check title
      const title = await this.page.title();
      this.logger.info(`   Title: ${title.substring(0, 60)}...`);

      if (title.toLowerCase().includes('captcha') || title.toLowerCase().includes('blocked')) {
        this.logger.warn('⚠️ CAPTCHA or blocking detected!');
        throw new Error('CAPTCHA detected');
      }

      // Simulate human reading time
      this.logger.info('👀 Simulating human behavior...');

      // Random mouse movements (like a real user)
      for (let i = 0; i < 3; i++) {
        const x = Math.floor(Math.random() * 1500 + 100);
        const y = Math.floor(Math.random() * 800 + 100);
        await this.page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 20) });
        await sleep(Math.random() * 0.5 + 0.2);
      }

      // Scroll like a human (multiple small scrolls)
      for (let i = 0; i < 3; i++) {
        await this.page.evaluate((scroll) => {
          window.scrollBy({
            top: scroll,
            left: 0,
            behavior: 'smooth'
          });
        }, Math.floor(Math.random() * 300 + 100));
        await sleep(Math.random() * 1 + 0.5);
      }

      // Wait for React/Vue to fully render (LeBonCoin is SPA)
      this.logger.info('⏳ Waiting for JavaScript to execute...');
      await sleep(5); // Wait 5 seconds for full render

      // Try to wait for ad containers
      try {
        await this.page.waitForSelector('[data-qa-id="aditem_container"]', { timeout: 5000 });
        this.logger.info('✅ Ad containers detected');
      } catch (e) {
        this.logger.warn('⚠️ Ad containers not found, getting HTML anyway...');
      }

      // Random final action
      await this.page.mouse.move(
        Math.floor(Math.random() * 1000 + 200),
        Math.floor(Math.random() * 600 + 100)
      );

      // Get final HTML
      const html = await this.page.content();
      this.logger.info(`✅ Fetched ${(html.length / 1024).toFixed(1)} KB`);

      // Debug: Check if we got the full page
      if (html.length < 100000) {
        this.logger.warn(`⚠️ Small HTML size detected: ${html.length} bytes`);
      }

      return html;
    } catch (error) {
      this.logger.error('❌ Error fetching page:', error);
      throw error;
    }
  }

  /**
   * Parse ads from HTML
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
        const altRegex = /"ads":(\[[\s\S]+?\])(?=,"ads_alu"|,"parameters"|$)/;
        const altMatch = html.match(altRegex);
        
        if (!altMatch || !altMatch[1]) {
          this.logger.warn('⚠️ No ads found with alternative method either');
          
          // Debug: Save HTML for inspection
          if (html.length < 100000) {
            const fs = require('fs');
            fs.writeFileSync('failed-scrape.html', html);
            this.logger.warn('💾 Saved failed HTML to failed-scrape.html for debugging');
          }
          
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
   * Transform raw ad data
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
          case 'immo_sell_type':
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

    return ad;
  }

  /**
   * Close browser
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
   * Override scrape to ensure cleanup
   */
  async scrape(customUrl?: string): Promise<any> {
    try {
      return await super.scrape(customUrl);
    } finally {
      await this.close();
    }
  }
}

// Export singleton
export const leboncoinScraperStealth = new LeBonCoinScraperStealth();

// Default export
export const leboncoinScraper = leboncoinScraperStealth;
