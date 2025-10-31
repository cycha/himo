import { IAd, Ad } from '@himo/commons';
import { ScraperConfig, ScraperResult, ParseResult } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep, calculateStatistics } from '../utils/utils';

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
    const latestAd = await Ad.findOne({ provider: this.config.provider })
      .sort('-release_date')
      .lean()
      .exec();

    return {
      date: latestAd?.release_date || new Date(0),
      title: latestAd?.title || '',
    };
  }

  async saveAds(ads: Partial<IAd>[]): Promise<number> {
    if (ads.length === 0) {
      this.logger.info('No ads to save');
      return 0;
    }

    try {
      this.logger.info(`Saving ${ads.length} ads...`);
      const result = await Ad.insertMany(ads, { ordered: false });
      this.logger.info(`✅ ${result.length} ads saved successfully`);
      return result.length;
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error - count inserted docs
        const insertedCount = error.insertedDocs?.length || 0;
        this.logger.warn(`⚠️ ${insertedCount} ads saved (some duplicates skipped)`);
        return insertedCount;
      }
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

        if (!isDbUpToDate && pageNumber <= this.config.maxPages) {
          await sleep(this.config.waitSuccess * Math.random());
        }
      } catch (error) {
        this.logger.error(`Failed to scrape page ${pageNumber}`, error);
        break;
      }
    }

    const stats = calculateStatistics(retryArray);
    this.logger.info('✅ Scraping completed');
    this.logger.info(`📊 Stats: ${totalAdsSaved} ads saved, ${stats.failurePercentage}% failure rate`);

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
      } catch (error) {
        const waitTime = Math.round(this.config.waitError * Math.random());
        this.logger.error(`Request failed (retry ${retry}/${this.config.maxRetries}). Waiting ${waitTime}s...`);
        
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
