// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This file uses browser APIs (navigator, window) which are not available in Node context
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'playwright';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult, RawAdData, ScraperResult } from '../types/scraper.types';
import { sleep } from '../utils/utils';
import * as fs from 'fs';
import * as path from 'path';

// Add stealth plugin to playwright
chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5, // REDUCED: Conservative scraping for VPS/free strategy (5 pages per session)
  maxRetries: 0, // No retries - if blocked, stop immediately to avoid detection
  waitSuccess: 20, // INCREASED: Longer wait between pages (20-40 seconds) for free VPS
  waitError: 60, // INCREASED: Much longer wait on errors (60+ seconds)
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
  private currentUserAgent: string | null = null; // Persist UA across scraping session
  private hasVisitedHomepage = false; // Track if we've done initial homepage visit
  private cookieStoragePath = path.join(process.cwd(), '.scraper-storage', 'cookies.json');
  private userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  ];

  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * Get random user agent (persistent across session for consistency)
   */
  private getRandomUserAgent(): string {
    if (!this.currentUserAgent) {
      this.currentUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }
    return this.currentUserAgent;
  }

  /**
   * Get random referer to simulate traffic from various sources
   */
  private getRandomReferer(): string {
    const referers = [
      'https://www.google.com/search?q=appartement+vente',
      'https://www.google.fr/search?q=immobilier',
      'https://www.bing.com/search?q=leboncoin+immobilier',
      'https://www.leboncoin.fr/', // Direct navigation
      '', // No referer (direct URL entry)
    ];
    return referers[Math.floor(Math.random() * referers.length)];
  }

  /**
   * Load saved cookies from disk
   */
  private async loadCookies(): Promise<void> {
    if (!this.page) return;

    try {
      if (fs.existsSync(this.cookieStoragePath)) {
        const cookiesData = fs.readFileSync(this.cookieStoragePath, 'utf-8');
        const cookies = JSON.parse(cookiesData);
        await this.page.context().addCookies(cookies);
        this.logger.info(`🍪 Loaded ${cookies.length} saved cookies (returning user)`);
      } else {
        this.logger.info('ℹ️ No saved cookies found (new user)');
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to load cookies:', error);
    }
  }

  /**
   * Save cookies to disk for next session
   */
  private async saveCookies(): Promise<void> {
    if (!this.page) return;

    try {
      const cookies = await this.page.context().cookies();

      // Create directory if it doesn't exist
      const dir = path.dirname(this.cookieStoragePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.cookieStoragePath, JSON.stringify(cookies, null, 2));
      this.logger.info(`💾 Saved ${cookies.length} cookies for next session`);
    } catch (error) {
      this.logger.warn('⚠️ Failed to save cookies:', error);
    }
  }

  /**
   * Initialize browser with MAXIMUM stealth
   */
  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.logger.info('🥷 Initializing ULTRA-STEALTH browser...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const launchOptions: any = {
      headless: process.env.HEADLESS !== 'false',
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

    // Launch browser with stealth plugin and persistent context for cookies
    this.browser = await chromium.launch(launchOptions);

    // Common viewport sizes (more realistic than random)
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 },
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];

    // Create stealth page with persistent storage
    const userAgent = this.getRandomUserAgent();
    this.page = await this.browser.newPage({
      viewport,
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

    // Set extra HTTP headers with random referer
    const referer = this.getRandomReferer();
    const headers: Record<string, string> = {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': referer ? 'cross-site' : 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    };

    // Add referer if present (simulates coming from search engines)
    if (referer) {
      headers.Referer = referer;
      this.logger.info(`   Using referer: ${referer.substring(0, 50)}...`);
    }

    await this.page.setExtraHTTPHeaders(headers);

    // Advanced anti-detection scripts
    const antiDetectionScript = () => {
      // 1. Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // 2. Override permissions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalQuery = (window as any).navigator.permissions.query;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Promise.resolve({ state: 'denied' } as any)
          : originalQuery(parameters);

      // 3. Add chrome object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).chrome = {
        runtime: {},
        loadTimes: function () {},
        csi: function () {},
        app: {},
      };

      // 4. Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            name: 'Chrome PDF Plugin',
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
          },
          {
            name: 'Chrome PDF Viewer',
            description: '',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
          },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    };
    await this.page.addInitScript(antiDetectionScript);

    this.logger.info('✅ Ultra-stealth browser initialized');
    this.logger.info(`   User-Agent: ${userAgent.substring(0, 50)}...`);

    // Load saved cookies to appear as returning user
    await this.loadCookies();
  }

  /**
   * Handle blocked response with detailed analysis
   */
  private async handleBlockedResponse(status: number, response: any): Promise<void> {
    this.logger.warn(`⚠️ HTTP ${status} response - LIKELY BLOCKED!`);

    const responseText = await response.text();
    const isDataDomeBlock =
      responseText.includes('DataDome') ||
      responseText.includes('captcha') ||
      responseText.includes('geo.captcha-delivery.com');

    // Save blocked response for debugging
    if (responseText.length < 50000) {
      fs.writeFileSync('blocked-response.html', responseText);
      this.logger.warn(`💾 Saved blocked response to blocked-response.html`);
    }

    this.logger.warn(`   Response size: ${responseText.length} bytes`);
    this.logger.warn(`   DataDome detected: ${isDataDomeBlock ? 'YES' : 'NO'}`);
    this.logger.warn(`   Preview: ${responseText.substring(0, 150)}...`);

    if (status === 403 || status === 429) {
      this.logger.error('═══════════════════════════════════════════════════');
      this.logger.error('🚫 ANTI-BOT PROTECTION DETECTED (DataDome)');
      this.logger.error('═══════════════════════════════════════════════════');
      this.logger.error('');
      this.logger.error("Your scraping has been blocked. Here's what to do:");
      this.logger.error('');
      this.logger.error('1. STOP SCRAPING IMMEDIATELY');
      this.logger.error('   → Continuing will make the block worse');
      this.logger.error('');
      this.logger.error('2. WAIT 6-24 HOURS');
      this.logger.error('   → Let your IP reputation recover');
      this.logger.error('');
      this.logger.error('3. USE RESIDENTIAL PROXIES');
      this.logger.error('   → Your current IP is flagged');
      this.logger.error('   → See docs/DATADOME_BYPASS.md for proxy providers');
      this.logger.error('');
      this.logger.error('4. REDUCE FREQUENCY');
      this.logger.error('   → Increase SCRAPING_INTERVAL in .env');
      this.logger.error('   → Increase waitSuccess in config (current: 15s)');
      this.logger.error('');
      this.logger.error('5. CHECK blocked-response.html');
      this.logger.error('   → Review the blocked page to understand the block type');
      this.logger.error('');
      this.logger.error('═══════════════════════════════════════════════════');

      throw new Error(`HTTP ${status} - Anti-bot protection detected. Scraping stopped.`);
    }
  }

  /**
   * Accept cookie consent banner (DataDome tracks this)
   */
  private async acceptCookies(): Promise<void> {
    if (!this.page) return;

    try {
      this.logger.info('🍪 Looking for cookie consent banner...');

      // LeBonCoin uses Didomi for cookie consent
      const cookieSelectors = [
        'button[id*="didomi-notice-agree"]',
        'button[class*="didomi-agree"]',
        'button:has-text("Accepter")',
        'button:has-text("Tout accepter")',
        '#didomi-notice-agree-button',
      ];

      for (const selector of cookieSelectors) {
        try {
          const button = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (button) {
            await sleep(Math.random() * 0.5 + 0.5); // Human delay before clicking
            await button.click();
            this.logger.info('✅ Cookie consent accepted');
            await sleep(1); // Wait for banner to disappear
            return;
          }
        } catch {
          // Try next selector
          continue;
        }
      }

      this.logger.info('ℹ️ No cookie banner found (might already be accepted)');
    } catch (error) {
      this.logger.warn('⚠️ Cookie acceptance failed, continuing anyway:', error);
    }
  }

  /**
   * Visit homepage first to establish session (looks more human)
   */
  private async visitHomepage(): Promise<void> {
    if (!this.page) return;

    try {
      this.logger.info('🏠 Visiting homepage first (human behavior)...');
      await this.page.goto('https://www.leboncoin.fr', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await sleep(Math.random() * 3 + 2);

      // Accept cookies (important for DataDome)
      await this.acceptCookies();

      // Simulate browsing - scroll and move mouse
      await this.page.mouse.move(500 + Math.random() * 500, 300 + Math.random() * 300);
      await this.page.evaluate(() => window.scrollBy(0, Math.random() * 200 + 100));
      await sleep(Math.random() * 2 + 1);

      this.logger.info('✅ Homepage visit complete');
    } catch (error) {
      this.logger.warn('⚠️ Homepage visit failed, continuing anyway:', error);
    }
  }

  /**
   * Fetch page with advanced human simulation
   */
  async fetchPage(url: string, _userAgent: string): Promise<string> {
    await this.initBrowser();

    if (!this.page) {
      throw new Error('Browser page not initialized');
    }

    // Visit homepage on first request to establish cookies/session
    if (!this.hasVisitedHomepage) {
      await this.visitHomepage();
      this.hasVisitedHomepage = true;
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

      // Check response status and analyze for DataDome
      const status = response.status();
      this.logger.info(`   HTTP Status: ${status}`);

      if (status !== 200) {
        await this.handleBlockedResponse(status, response);
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
        await this.page.evaluate(
          (scroll) => {
            window.scrollBy({
              top: scroll,
              left: 0,
              behavior: 'smooth',
            });
          },
          Math.floor(Math.random() * 300 + 100)
        );
        await sleep(Math.random() * 1 + 0.5);
      }

      // Wait for React/Vue to fully render (LeBonCoin is SPA)
      this.logger.info('⏳ Waiting for JavaScript to execute...');
      await sleep(5); // Wait 5 seconds for full render

      // Try to wait for ad containers
      try {
        await this.page.waitForSelector('[data-qa-id="aditem_container"]', { timeout: 5000 });
        this.logger.info('✅ Ad containers detected');
      } catch {
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
    try {
      // Method 1: Extract ads array from embedded JSON
      const regex = /"ads":(\[.+?\]),"ads_alu"/;
      const match = html.match(regex);

      if (!match || !match[1]) {
        return this.parseAdsAlternativeMethod(html, latestDate, latestTitle);
      }

      const rawAds: RawAdData[] = JSON.parse(match[1]);
      return this.processRawAds(rawAds, latestDate, latestTitle);
    } catch (error) {
      this.logger.error('❌ Error parsing ads from HTML:', error);
      throw error;
    }
  }

  /**
   * Alternative method to extract ads from HTML
   */
  private parseAdsAlternativeMethod(
    html: string,
    latestDate: Date,
    latestTitle: string
  ): ParseResult {
    this.logger.warn('⚠️ No ads found in embedded JSON (primary method)');

    const altRegex = /"ads":(\[[\s\S]+?\])(?=,"ads_alu"|,"parameters"|$)/;
    const altMatch = html.match(altRegex);

    if (!altMatch || !altMatch[1]) {
      this.logger.warn('⚠️ No ads found with alternative method either');
      this.saveFailedHtml(html);
      return { ads: [], isUpToDate: true };
    }

    const rawAds: RawAdData[] = JSON.parse(altMatch[1]);
    this.logger.info(`✅ Found ${rawAds.length} raw ads (alternative method)`);
    return this.processRawAds(rawAds, latestDate, latestTitle);
  }

  /**
   * Save failed HTML for debugging
   */
  private saveFailedHtml(html: string): void {
    if (html.length < 100000) {
      fs.writeFileSync('failed-scrape.html', html);
      this.logger.warn('💾 Saved failed HTML to failed-scrape.html for debugging');
    }
  }

  /**
   * Process raw ads and check for up-to-date status
   */
  private processRawAds(rawAds: RawAdData[], latestDate: Date, latestTitle: string): ParseResult {
    const ads: Partial<BotAdData>[] = [];
    let isUpToDate = false;

    this.logger.info(`✅ Found ${rawAds.length} raw ads`);

    for (const rawAd of rawAds) {
      const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());

      if (
        releaseDate < latestDate ||
        (releaseDate.getTime() === latestDate.getTime() && rawAd.subject === latestTitle)
      ) {
        this.logger.info('🛑 Reached latest ad in DB, stopping...');
        isUpToDate = true;
        break;
      }

      const parsedAd = this.transformRawAd(rawAd, releaseDate);
      ads.push(parsedAd);
    }

    return { ads, isUpToDate };
  }

  /**
   * Transform raw ad data
   */
  private transformRawAd(rawAd: RawAdData, releaseDate: Date): Partial<BotAdData> {
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

  /**
   * Build ad URL with validation
   */
  private buildAdUrl(url?: string): string {
    if (!url) return '';
    const fullUrl = url.startsWith('http') ? url : `https://www.leboncoin.fr/${url}`;
    return fullUrl.substring(0, 500);
  }

  /**
   * Parse price safely
   */
  private parsePrice(price?: string | number): number {
    if (typeof price === 'string') {
      return parseInt(price.replace(/\D/g, '')) || 0;
    }
    return typeof price === 'number' ? price : 0;
  }

  /**
   * Build location object with field length limits
   */
  private buildLocation(location?: RawAdData['location']) {
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
   * Extract coordinates from location data
   */
  private extractCoordinates(location?: RawAdData['location']): [number, number] {
    const lng = location?.lng || location?.coordinates?.[0] || null;
    const lat = location?.lat || location?.coordinates?.[1] || null;
    return [lng, lat] as [number, number];
  }

  /**
   * Parse attributes and add them to the ad
   */
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

  /**
   * Map real estate type to Prisma enum
   */
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
    const typeLabel = label?.toLowerCase() || '';
    return typeMap[typeLabel] || undefined;
  }

  /**
   * Map immo sell type to Prisma enum
   */
  private mapImmoSellType(label?: string): string | undefined {
    const sellTypeMap: Record<string, string> = {
      old: 'ancien',
      new: 'neuf',
      ancien: 'ancien',
      neuf: 'neuf',
    };
    const sellTypeLabel = label?.toLowerCase() || '';
    return sellTypeMap[sellTypeLabel] || undefined;
  }

  /**
   * Parse integer attribute with validation
   */
  private parseIntegerAttribute(value: string): number | undefined {
    const parsed = parseInt(value);
    return !isNaN(parsed) && parsed > 0 && parsed < 32767 ? parsed : undefined;
  }

  /**
   * Close browser and save cookies
   */
  async close(): Promise<void> {
    // Save cookies before closing (important for session persistence)
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

  /**
   * Override scrape to ensure cleanup
   */
  async scrape(customUrl?: string): Promise<ScraperResult> {
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
