import { prisma } from '../lib/prisma';
import { Provider, Prisma, RealEstateType, ImmoSellType } from '@prisma/client';
import { ScraperConfig, ScraperResult, ParseResult } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep, calculateStatistics } from '../utils/utils';

// Types for bot ad data
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

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected logger: Logger;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.logger = new Logger(config.provider);
  }

  abstract fetchPage(url: string, userAgent: string): Promise<string>;
  abstract parseAds(html: string, latestDate: Date, latestTitle: string): Promise<ParseResult>;

  async getLatestAdInDb(): Promise<{ date: Date; title: string }> {
    const latestAd = await prisma.ad.findFirst({
      where: { provider: this.config.provider as Provider },
      orderBy: { releaseDate: 'desc' },
    });

    return {
      date: latestAd?.releaseDate || new Date(0),
      title: latestAd?.title || '',
    };
  }

  async saveAds(ads: Partial<BotAdData>[]): Promise<number> {
    if (ads.length === 0) {
      this.logger.info('No ads to save');
      return 0;
    }

    try {
      this.logger.info(`Saving ${ads.length} ads...`);

      // Transform ads to Prisma format
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
        skipDuplicates: true, // Skip ads with duplicate URLs
      });

      this.logger.info(`✅ ${result.count} ads saved successfully`);
      return result.count;
    } catch (error: unknown) {
      this.logger.error('Error saving ads:', error);
      throw error;
    }
  }

  async scrape(customUrl?: string): Promise<ScraperResult> {
    this.logger.info('🚀 Starting scraping process...');

    let isDbUpToDate = false;
    let pageNumber = 1;
    let totalAdsSaved = 0;
    const retryArray: number[] = [];

    const { date: latestDate, title: latestTitle } = await this.getLatestAdInDb();
    this.logger.info(`Latest ad in DB: ${latestTitle} (${latestDate.toISOString()})`);

    while (!isDbUpToDate && pageNumber <= this.config.maxPages) {
      try {
        const url = this.buildPageUrl(customUrl || this.config.baseUrl, pageNumber);
        const html = await this.fetchWithRetry(url, retryArray);

        const { ads, isUpToDate } = await this.parseAds(html, latestDate, latestTitle);
        isDbUpToDate = isUpToDate;

        if (ads.length > 0) {
          const savedCount = await this.saveAds(ads);
          totalAdsSaved += savedCount;
        }

        pageNumber++;

        // Wait before next page with random variation (more human-like)
        if (!isDbUpToDate && pageNumber <= this.config.maxPages) {
          const randomWait = this.config.waitSuccess + Math.random() * this.config.waitSuccess;
          this.logger.info(`⏳ Waiting ${randomWait.toFixed(1)}s before next page...`);
          await sleep(randomWait);
        }
      } catch (error) {
        this.logger.error(`Failed to scrape page ${pageNumber}`, error);
        break;
      }
    }

    const stats = calculateStatistics(retryArray);
    this.logger.info('✅ Scraping completed');
    this.logger.info(
      `📊 Stats: ${totalAdsSaved} ads saved, ${stats.failurePercentage}% failure rate`
    );

    return {
      adsSaved: totalAdsSaved,
      pagesScraped: pageNumber - 1,
      ...stats,
    };
  }

  protected async fetchWithRetry(url: string, retryArray: number[]): Promise<string> {
    let retry = 0;

    while (retry <= this.config.maxRetries) {
      try {
        this.logger.info(`→ Requesting ${url} (attempt ${retry + 1})`);
        const html = await this.fetchPage(url, this.getUserAgent());
        retryArray.push(retry);
        return html;
      } catch (error: unknown) {
        // Check if it's an anti-bot error - stop immediately
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('Anti-bot') || errorMessage.includes('DataDome')) {
          this.logger.error(
            '🛑 Anti-bot protection detected - stopping scraping to avoid further blocks'
          );
          retryArray.push(retry);
          throw error; // Don't retry on anti-bot errors
        }

        // Exponential backoff for other errors
        const baseWait = this.config.waitError;
        const waitTime = Math.round(baseWait * Math.pow(2, retry) + Math.random() * baseWait);
        this.logger.error(
          `Request failed (retry ${retry}/${this.config.maxRetries}). Waiting ${waitTime}s...`
        );

        if (retry >= this.config.maxRetries) {
          retryArray.push(retry);
          throw new Error(`Max retries (${this.config.maxRetries}) reached for ${url}`);
        }

        retry++;
        await sleep(waitTime);
      }
    }

    throw new Error('Unexpected error in fetchWithRetry');
  }

  protected buildPageUrl(baseUrl: string, pageNumber: number): string {
    return pageNumber === 1 ? baseUrl : `${baseUrl}&page=${pageNumber}`;
  }

  protected getUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
}
