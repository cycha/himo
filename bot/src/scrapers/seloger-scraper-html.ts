// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'playwright';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult, ScraperResult } from '../types/scraper.types';
import { sleep } from '../utils/utils';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

chromium.use(StealthPlugin());

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5,
  maxRetries: 3,
  waitSuccess: 20,
  waitError: 60,
  baseUrl: 'https://www.seloger.com/classified-search?distributionTypes=Buy&estateTypes=House,Apartment&order=DateDesc',
  provider: 'seloger',
};

export class SeLogerScraperHTML extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private currentUserAgent: string | null = null;
  private cookieStoragePath = path.join(process.cwd(), '.scraper-storage', 'seloger-cookies.json');
  private userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  ];

  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  private getRandomUserAgent(): string {
    if (!this.currentUserAgent) {
      this.currentUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }
    return this.currentUserAgent;
  }

  private async rotateTorIP(): Promise<void> {
    const torControl = process.env.TOR_CONTROL || 'localhost:9051';
    const [host, port] = torControl.split(':');

    return new Promise((resolve) => {
      const socket = net.createConnection(parseInt(port), host, () => {
        this.logger.info('🔄 Rotating Tor IP...');
        socket.write('AUTHENTICATE ""\r\n');

        // Wait a bit before sending NEWNYM
        setTimeout(() => {
          socket.write('SIGNAL NEWNYM\r\n');

          // Wait for response then quit
          setTimeout(() => {
            socket.write('QUIT\r\n');
            socket.end();
            this.logger.info('✅ Tor IP rotation signal sent');
            resolve();
          }, 500);
        }, 500);
      });

      socket.on('error', (error) => {
        this.logger.warn('⚠️ Tor rotation warning:', error.message);
        resolve(); // Don't fail the scraper if rotation fails
      });

      socket.on('timeout', () => {
        socket.end();
        resolve();
      });

      socket.setTimeout(5000);
    });
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

    this.logger.info('🥷 Initializing ULTRA-STEALTH browser for SeLoger...');

    const launchOptions: any = {
      headless: process.env.HEADLESS !== 'false',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--lang=fr-FR',
      ],
    };

    // Add Tor proxy if available
    if (process.env.TOR_PROXY) {
      launchOptions.proxy = {
        server: process.env.TOR_PROXY,
      };
      this.logger.info(`🧅 Using Tor proxy: ${process.env.TOR_PROXY}`);
    }

    this.browser = await chromium.launch(launchOptions);

    const userAgent = this.getRandomUserAgent();
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent,
      locale: 'fr-FR',
      timezoneId: 'Europe/Paris',
      geolocation: { latitude: 48.8566, longitude: 2.3522 },
      permissions: ['geolocation'],
    });

    await this.page.setExtraHTTPHeaders({
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    });

    // Anti-detection scripts
    const antiDetectionScript = () => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      (window as any).chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', {
        get: () => [{ name: 'Chrome PDF Plugin' }],
      });
    };
    await this.page.addInitScript(antiDetectionScript);

    this.logger.info('✅ Browser initialized');
    await this.loadCookies();
  }

  async fetchPage(url: string, _userAgent: string): Promise<string> {
    await this.initBrowser();

    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // Rotate Tor IP before each request
      if (process.env.TOR_PROXY) {
        await this.rotateTorIP();
        await sleep(10); // Wait for new circuit to establish
      }

      this.logger.info(`📄 Fetching: ${url}`);
      await sleep(Math.random() * 3 + 2);

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

      // Wait for page to render
      await sleep(5);

      // Check for CAPTCHA
      const pageContent = await this.page.content();
      if (pageContent.includes('captcha-delivery') || pageContent.includes('Please enable JS')) {
        this.logger.warn('⚠️ CAPTCHA detected!');
        fs.writeFileSync('seloger-blocked.html', pageContent);
        throw new Error('CAPTCHA protection detected');
      }

      // Wait for ads to load - SeLoger uses React
      try {
        await this.page.waitForSelector('[data-testid="sl.card"]', { timeout: 10000 });
        this.logger.info('✅ Ad cards detected');
      } catch {
        this.logger.warn('⚠️ No ad cards found, getting HTML anyway...');
      }

      // Human simulation
      await this.page.mouse.move(500 + Math.random() * 500, 300 + Math.random() * 300);
      await this.page.evaluate(() => window.scrollBy(0, Math.random() * 300 + 100));
      await sleep(1);

      const html = await this.page.content();
      this.logger.info(`✅ Fetched ${(html.length / 1024).toFixed(1)} KB`);

      return html;
    } catch (error) {
      this.logger.error('❌ Error fetching page:', error);
      throw error;
    }
  }

  async parseAds(html: string, latestDate: Date, latestTitle: string): Promise<ParseResult> {
    const ads: Partial<BotAdData>[] = [];
    let isUpToDate = false;

    try {
      // Save HTML for debugging
      if (html.length < 50000) {
        fs.writeFileSync('seloger-debug.html', html);
        this.logger.warn('⚠️ Small HTML detected, saved for debugging');
        return { ads: [], isUpToDate: true };
      }

      // SeLoger embeds data in JSON-LD or window.__INITIAL_STATE__
      // Try to extract JSON data from script tags
      const jsonMatch = html.match(/<script[^>]*>window\.__INITIAL_STATE__\s*=\s*({.*?})<\/script>/s);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        this.logger.info('✅ Found embedded JSON data');

        // Parse listings from the data structure
        const listings = data?.search?.listings || [];
        this.logger.info(`Found ${listings.length} listings`);

        for (const listing of listings) {
          const releaseDate = listing.publicationDate
            ? new Date(listing.publicationDate)
            : new Date();

          const title = listing.title || '';

          if (
            releaseDate < latestDate ||
            (releaseDate.getTime() === latestDate.getTime() && title === latestTitle)
          ) {
            this.logger.info('🛑 Reached latest ad in DB');
            isUpToDate = true;
            break;
          }

          const ad: Partial<BotAdData> = {
            title: title,
            description: listing.description || '',
            thumb_urls: listing.photos?.map((p: any) => p.url) || [],
            url: `https://www.seloger.com/${listing.permalink || ''}`,
            price: listing.price || 0,
            provider: 'seloger',
            release_date: releaseDate,
            rooms: listing.roomCount,
            surface: listing.livingArea,
            real_estate_type: this.mapPropertyType(listing.estateType),
            location: {
              city: listing.city,
              zipcode: listing.zipCode || 'unknown',
              coordinates: listing.coordinates
                ? [listing.coordinates.longitude, listing.coordinates.latitude]
                : undefined,
            },
          };

          ads.push(ad);
        }
      } else {
        this.logger.warn('⚠️ No embedded JSON found in HTML');
      }
    } catch (error) {
      this.logger.error('❌ Error parsing ads:', error);
    }

    return { ads, isUpToDate };
  }

  private mapPropertyType(type: string): string {
    const typeMap: Record<string, string> = {
      'house': 'maison',
      'apartment': 'appartement',
      'parking': 'parking',
      'land': 'terrain',
    };
    return typeMap[type?.toLowerCase()] || type?.toLowerCase();
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

export const selogerScraperHTML = new SeLogerScraperHTML();
