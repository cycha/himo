import { BotAdData } from './base-scraper';
import { ScraperConfig, ScraperResult, RawAdData } from '../types/scraper.types';
import { Logger } from '../utils/logger';
import { sleep } from '../utils/utils';

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

  private transformRawAd(rawAd: RawAdData): Partial<BotAdData> {
    const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());
    const ad: Partial<BotAdData> = {
      title: rawAd.subject?.substring(0, 200) || 'Sans titre',
      description: rawAd.body?.substring(0, 10000) || '',
      thumb_urls: rawAd.images?.urls?.slice(0, 10) || [],
      url: this.buildAdUrl(rawAd.url),
      price: this.parsePrice(rawAd.price),
      provider: 'leboncoin',
      location: {
        region_name: rawAd.location?.region_name?.substring(0, 100),
        department_id: rawAd.location?.department_id?.substring(0, 10),
        department_name: rawAd.location?.department_name?.substring(0, 100),
        city: rawAd.location?.city?.substring(0, 100),
        zipcode: rawAd.location?.zipcode?.substring(0, 10) || 'unknown',
        coordinates: [
          rawAd.location?.lng || null,
          rawAd.location?.lat || null,
        ] as unknown as number[],
      },
      release_date: releaseDate,
    };

    if (rawAd.attributes) {
      for (const attr of rawAd.attributes) {
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

    return ad;
  }

  async scrape(): Promise<ScraperResult> {
    this.logger.info('Starting LeBonCoin scraping via API...');

    const { getLatestAdInDb, saveAds } = await import('./scraper-utils');
    const { date: latestDate, title: latestTitle } = await getLatestAdInDb(this.config.provider);
    this.logger.info(`Latest ad in DB: ${latestTitle} (${latestDate.toISOString()})`);

    let totalAdsSaved = 0;
    let pagesScraped = 0;
    let failedPages = 0;

    for (let page = 0; page < this.config.maxPages; page++) {
      const offset = page * ADS_PER_PAGE;
      this.logger.info(`Fetching page ${page + 1}/${this.config.maxPages} (offset=${offset})...`);

      let retries = 0;
      let success = false;

      while (retries <= this.config.maxRetries && !success) {
        try {
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

          if (rawAds.length === 0) {
            this.logger.info('  No more ads, stopping');
            success = true;
            pagesScraped++;
            break;
          }

          // Transform and filter new ads
          const newAds: Partial<BotAdData>[] = [];
          let reachedLatest = false;

          for (const rawAd of rawAds) {
            const releaseDate = new Date(
              rawAd.first_publication_date || rawAd.index_date || Date.now()
            );
            if (
              releaseDate < latestDate ||
              (releaseDate.getTime() === latestDate.getTime() && rawAd.subject === latestTitle)
            ) {
              this.logger.info('  Reached latest ad in DB, stopping...');
              reachedLatest = true;
              break;
            }
            newAds.push(this.transformRawAd(rawAd));
          }

          if (newAds.length > 0) {
            const savedCount = await saveAds(newAds, this.logger);
            totalAdsSaved += savedCount;
          }

          pagesScraped++;
          success = true;

          if (reachedLatest || rawAds.length < ADS_PER_PAGE) {
            break;
          }

          // Delay between pages
          const delay = this.config.waitSuccess + Math.random() * this.config.waitSuccess;
          this.logger.info(`  Waiting ${delay.toFixed(1)}s before next page...`);
          await sleep(delay);
        } catch (error) {
          retries++;
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`  Page ${page + 1} attempt ${retries} failed: ${message}`);

          if (retries > this.config.maxRetries) {
            failedPages++;
            this.logger.error(`  Giving up on page ${page + 1} after ${retries} attempts`);
          } else {
            const delay = this.config.waitError + Math.random() * this.config.waitError;
            this.logger.info(`  Retrying in ${delay.toFixed(1)}s...`);
            await sleep(delay);
          }
        }
      }
    }

    const totalRequests = pagesScraped + failedPages;
    const failurePercentage = totalRequests > 0 ? (failedPages / totalRequests) * 100 : 0;

    this.logger.info(`LeBonCoin API scraping completed: ${totalAdsSaved} ads saved, ${pagesScraped} pages`);

    return {
      adsSaved: totalAdsSaved,
      pagesScraped,
      failurePercentage,
      averageRetriesPerRequest: 0,
    };
  }
}

export const leboncoinScraper = new LeBonCoinCrawleeScraper();
