// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This file uses browser APIs (window) which are not available in Node context
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
   * Scroll page to load more ads via infinite scroll.
   * Note: page.evaluate with window.scrollBy is required for browser-context scrolling.
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

      // Scroll in browser context - this is Playwright's page.evaluate API, not eval()
      await page.evaluate('window.scrollBy({ top: window.innerHeight * 0.8, left: 0, behavior: "smooth" })');

      await sleep(2 + Math.random() * 2);
      await page.mouse.move(500 + Math.random() * 500, 300 + Math.random() * 300);

      scrollAttempts++;
      this.logger.info(`   Scroll ${scrollAttempts}: ${currentAdCount} ads loaded`);
    }
  }

  /**
   * Extract listings from page using DOM selectors
   */
  private async extractListings(
    page: any
  ): Promise<
    Array<{
      url: string;
      location: string;
      price: string;
      description: string;
      tags: string[];
      images: string[];
    }>
  > {
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

    // Bind methods for use in Crawlee handlers
    const scrollToLoadMoreAds = this.scrollToLoadMoreAds.bind(this);
    const extractListings = this.extractListings.bind(this);
    const buildFullUrl = this.buildFullUrl.bind(this);
    const parsePriceText = this.parsePrice.bind(this);
    const inferTypeFromUrl = this.inferTypeFromUrl.bind(this);
    const logger = this.logger;
    const config = this.config;

    const crawler = new PlaywrightCrawler({
      requestList,
      launchContext: {
        launcher: chromium,
        useIncognitoPages: true,
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
      maxRequestRetries: config.maxRetries,
      requestHandlerTimeoutSecs: 120,
      maxConcurrency: 1,

      preNavigationHooks: [
        async ({ page }) => {
          await page.setViewportSize({ width: 1920, height: 1080 });
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr-FR,fr;q=0.9',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
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
        await scrollToLoadMoreAds(page);

        // Extract listings
        const listings = await extractListings(page);
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
            if (tag.includes('pièce')) rooms = parseInt(tag.replace(/\D/g, ''));
            else if (tag.includes('m²')) surface = parseInt(tag.replace(/\D/g, ''));
          }

          const zipMatch = listing.location.match(/\((\d{5})\)/);
          const zipcode = zipMatch ? zipMatch[1] : 'unknown';
          const city = listing.location.replace(/\s*\(\d{5}\)/, '').trim();

          ads.push({
            title,
            description: listing.description.substring(0, 10000),
            thumb_urls: listing.images.slice(0, 10),
            url: buildFullUrl(listing.url),
            price: parsePriceText(listing.price),
            provider: 'pap',
            release_date: new Date(),
            rooms,
            surface,
            real_estate_type: inferTypeFromUrl(listing.url),
            location: {
              city: city.substring(0, 100),
              zipcode: zipcode.substring(0, 10),
            },
          });
        }

        if (ads.length > 0) {
          const savedCount = await saveAds(ads, logger);
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
