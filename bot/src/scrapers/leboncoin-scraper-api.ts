import { BotAdData } from './base-scraper';
import { ScraperConfig, ScraperResult, RawAdData } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep } from '../utils/utils';
import { LatestAd, getReleaseDate, takeNewAds } from './latest-ad';

type SaveAds = typeof import('./scraper-utils').saveAds;

interface PageOutcome {
  saved: number;
  /** No more new ads to fetch: last page, or the latest stored ad was reached. */
  done: boolean;
}

const API_URL = 'https://api.leboncoin.fr/finder/search';
const API_KEY = 'ba0c2dad52b3ec';

const API_HEADERS: Record<string, string> = {
  Host: 'api.leboncoin.fr',
  Connection: 'keep-alive',
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'User-Agent':
    'LBC;iOS;16.4.1;iPhone;phone;AFACB532-200B-476A-98B3-B2346A97EA54;wifi;6.102.0;24.32.1930',
  api_key: API_KEY,
};

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5,
  maxRetries: 2,
  waitSuccess: 3, // API requests need less delay than browser
  waitError: 10,
  baseUrl: API_URL,
  provider: 'leboncoin',
};

const ADS_PER_PAGE = 30;

export class LeBonCoinCrawleeScraper {
  private config: ScraperConfig;
  private logger: Logger;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.provider);
  }

  private buildRequestBody(offset: number): object {
    return {
      filters: {
        category: { id: '9' }, // ventes immobilieres
        enums: {
          ad_type: ['offer'],
        },
      },
      limit: ADS_PER_PAGE,
      offset,
      sort_by: 'date',
      sort_order: 'desc',
    };
  }

  private buildAdUrl(url?: string): string {
    if (!url) return '';
    const fullUrl = url.startsWith('http') ? url : `https://www.leboncoin.fr/${url}`;
    return fullUrl.substring(0, 500);
  }

  private parsePrice(price?: unknown): number {
    if (!price) return 0;
    if (Array.isArray(price) && price.length > 0) return this.parsePrice(price[0]);
    if (typeof price === 'object' && (price as { value?: number }).value !== undefined)
      return this.parsePrice((price as { value: number }).value);
    if (typeof price === 'string') return parseInt(price.replace(/\D/g, '')) || 0;
    if (typeof price === 'number') return price;
    return 0;
  }

  private parseIntegerAttribute(value: string): number | undefined {
    const parsed = parseInt(value);
    return !isNaN(parsed) && parsed > 0 && parsed < 32767 ? parsed : undefined;
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

  private buildLocation(location: RawAdData['location'] = {}): BotAdData['location'] {
    return {
      region_name: location.region_name?.substring(0, 100),
      department_id: location.department_id?.substring(0, 10),
      department_name: location.department_name?.substring(0, 100),
      city: location.city?.substring(0, 100),
      zipcode: location.zipcode?.substring(0, 10) || 'unknown',
      coordinates: [location.lng || null, location.lat || null] as unknown as number[],
    };
  }

  private applyAttribute(ad: Partial<BotAdData>, attr: RawAdData['attributes'][number]): void {
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

  private transformRawAd(rawAd: RawAdData): Partial<BotAdData> {
    const ad: Partial<BotAdData> = {
      title: rawAd.subject?.substring(0, 200) || 'Sans titre',
      description: rawAd.body?.substring(0, 10000) || '',
      thumb_urls: rawAd.images?.urls?.slice(0, 10) || [],
      url: this.buildAdUrl(rawAd.url),
      price: this.parsePrice(rawAd.price),
      provider: 'leboncoin',
      location: this.buildLocation(rawAd.location),
      release_date: getReleaseDate(rawAd),
    };

    for (const attr of rawAd.attributes ?? []) {
      this.applyAttribute(ad, attr);
    }

    return ad;
  }

  private async fetchAds(offset: number): Promise<RawAdData[]> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(this.buildRequestBody(offset)),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawAds: RawAdData[] = data.ads || [];
    this.logger.info(`  Got ${rawAds.length} ads (total available: ${data.total})`);
    return rawAds;
  }

  private async scrapePage(page: number, latest: LatestAd, saveAds: SaveAds): Promise<PageOutcome> {
    const rawAds = await this.fetchAds(page * ADS_PER_PAGE);
    if (rawAds.length === 0) {
      this.logger.info('  No more ads, stopping');
      return { saved: 0, done: true };
    }

    const { newAds, reachedLatest } = takeNewAds(rawAds, latest);
    if (reachedLatest) {
      this.logger.info('  Reached latest ad in DB, stopping...');
    }

    const saved =
      newAds.length > 0
        ? await saveAds(
            newAds.map((rawAd) => this.transformRawAd(rawAd)),
            this.logger
          )
        : 0;

    return { saved, done: reachedLatest || rawAds.length < ADS_PER_PAGE };
  }

  /** Returns null once every attempt for this page has failed. */
  private async scrapePageWithRetries(
    page: number,
    latest: LatestAd,
    saveAds: SaveAds
  ): Promise<PageOutcome | null> {
    const attempts = this.config.maxRetries + 1;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await this.scrapePage(page, latest, saveAds);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`  Page ${page + 1} attempt ${attempt} failed: ${message}`);

        if (attempt < attempts) {
          const delay = this.config.waitError + Math.random() * this.config.waitError;
          this.logger.info(`  Retrying in ${delay.toFixed(1)}s...`);
          await sleep(delay);
        }
      }
    }

    this.logger.error(`  Giving up on page ${page + 1} after ${attempts} attempts`);
    return null;
  }

  async scrape(): Promise<ScraperResult> {
    this.logger.info('Starting LeBonCoin scraping via API...');

    const { getLatestAdInDb, saveAds } = await import('./scraper-utils');
    const latest = await getLatestAdInDb(this.config.provider);
    this.logger.info(`Latest ad in DB: ${latest.title} (${latest.date.toISOString()})`);

    let totalAdsSaved = 0;
    let pagesScraped = 0;
    let failedPages = 0;

    for (let page = 0; page < this.config.maxPages; page++) {
      this.logger.info(
        `Fetching page ${page + 1}/${this.config.maxPages} (offset=${page * ADS_PER_PAGE})...`
      );

      const outcome = await this.scrapePageWithRetries(page, latest, saveAds);
      if (!outcome) {
        failedPages++;
        continue;
      }

      pagesScraped++;
      totalAdsSaved += outcome.saved;
      if (outcome.done) break;

      const delay = this.config.waitSuccess + Math.random() * this.config.waitSuccess;
      this.logger.info(`  Waiting ${delay.toFixed(1)}s before next page...`);
      await sleep(delay);
    }

    const totalRequests = pagesScraped + failedPages;
    const failurePercentage = totalRequests > 0 ? (failedPages / totalRequests) * 100 : 0;

    this.logger.info(
      `LeBonCoin API scraping completed: ${totalAdsSaved} ads saved, ${pagesScraped} pages`
    );

    return {
      adsSaved: totalAdsSaved,
      pagesScraped,
      failurePercentage,
      averageRetriesPerRequest: 0,
    };
  }
}

export const leboncoinScraper = new LeBonCoinCrawleeScraper();
