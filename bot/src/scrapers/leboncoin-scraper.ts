import axios from 'axios';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult, RawAdData } from '../types/scraper.types';

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 30,
  maxRetries: 10,
  waitSuccess: 3,
  waitError: 6,
  baseUrl: 'https://www.leboncoin.fr/recherche?category=9',
  provider: 'leboncoin',
};

export class LeBonCoinScraper extends BaseScraper {
  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  async fetchPage(url: string, userAgent: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      timeout: 30000,
    });

    return response.data;
  }

  async parseAds(html: string, latestDate: Date, latestTitle: string): Promise<ParseResult> {
    const ads: Partial<BotAdData>[] = [];
    let isUpToDate = false;

    try {
      // Extract JSON data from HTML
      const regex = /(?<="ads":).*\[.*].+?(?=,"ads_alu")/g;
      const match = html.match(regex);

      if (!match || match.length === 0) {
        this.logger.warn('No ads found in HTML (possible CAPTCHA or blocked)');
        return { ads: [], isUpToDate: true };
      }

      const rawAds: RawAdData[] = JSON.parse('[' + match[0] + ']');
      this.logger.info(`Found ${rawAds.length} raw ads`);

      for (const rawAd of rawAds) {
        const releaseDate = new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());

        // Check if we've reached ads we already have
        if (releaseDate < latestDate || (releaseDate.getTime() === latestDate.getTime() && rawAd.subject === latestTitle)) {
          this.logger.info('Reached latest ad in DB, stopping...');
          isUpToDate = true;
          break;
        }

        const parsedAd = this.transformRawAd(rawAd, releaseDate);
        ads.push(parsedAd);
      }
    } catch (error) {
      this.logger.error('Error parsing ads from HTML', error);
      throw error;
    }

    return { ads, isUpToDate };
  }

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
}

export const leboncoinScraper = new LeBonCoinScraper();
