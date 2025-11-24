import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, BotAdData } from './base-scraper';
import { ScraperConfig, ParseResult } from '../types/scraper.types';

const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 30,
  maxRetries: 10,
  waitSuccess: 3,
  waitError: 6,
  baseUrl: 'http://ws.seloger.com/search.xml?idtt=2&idtypebien=1,2&tri=d_dt_crea',
  provider: 'seloger',
};

interface SeLogerLocation {
  ville?: string;
  cp?: string;
  pays?: string;
  region?: string;
  departement?: string;
  latitude?: string;
  longitude?: string;
}

interface SeLogerPhoto {
  _?: string; // URL
}

interface SeLogerAd {
  idAnnonce?: string[];
  titre?: string[];
  descriptif?: string[];
  prix?: string[];
  prixUnite?: string[];
  nbPieces?: string[];
  nbChambres?: string[];
  surface?: string[];
  surfaceUnite?: string[];
  urlFiche?: string[];
  permaLien?: string[];
  dtCreation?: string[];
  dtFraicheur?: string[];
  photos?: Array<{ photo?: SeLogerPhoto[] }>;
  photo?: SeLogerPhoto[];
  typeBien?: string[];
  resume?: string[];
  proximite?: string[];
  localisation?: SeLogerLocation[];
}

export class SeLogerScraper extends BaseScraper {
  constructor(config: Partial<ScraperConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  async fetchPage(url: string, userAgent: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        Referer: 'https://www.seloger.com/',
      },
      timeout: 30000,
    });

    return response.data;
  }

  async parseAds(xml: string, latestDate: Date, latestTitle: string): Promise<ParseResult> {
    const ads: Partial<BotAdData>[] = [];
    let isUpToDate = false;

    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      const annonces = $('annonce');

      this.logger.info(`Found ${annonces.length} raw ads`);

      if (annonces.length === 0) {
        this.logger.warn('No ads found in XML (possible blocking or API issue)');
        return { ads: [], isUpToDate: true };
      }

      annonces.each((_, element) => {
        const rawAd = this.parseXmlAd($, element);

        // Parse release date
        const dateStr = rawAd.dtCreation?.[0] || rawAd.dtFraicheur?.[0];
        const releaseDate = dateStr ? this.parseSeLogerDate(dateStr) : new Date();

        const title = rawAd.titre?.[0] || '';

        // Check if we've reached ads we already have
        if (
          releaseDate < latestDate ||
          (releaseDate.getTime() === latestDate.getTime() && title === latestTitle)
        ) {
          this.logger.info('Reached latest ad in DB, stopping...');
          isUpToDate = true;
          return false; // Break the loop
        }

        const parsedAd = this.transformSeLogerAd(rawAd, releaseDate);
        if (parsedAd.title && parsedAd.url && parsedAd.price !== undefined) {
          ads.push(parsedAd);
        }
      });
    } catch (error) {
      this.logger.error('Error parsing ads from XML', error);
      throw error;
    }

    return { ads, isUpToDate };
  }

  private parseXmlAd($: cheerio.CheerioAPI, element: any): SeLogerAd {
    const ad: SeLogerAd = {};

    $(element)
      .children()
      .each((_, child) => {
        const tagName = $(child).prop('tagName') as string | undefined;
        const value = $(child).text().trim();

        if (!tagName) return;

        if (tagName === 'photos') {
          ad.photos = [];
          $(child)
            .find('photo')
            .each((_, photoEl) => {
              const photoUrl = $(photoEl).text().trim();
              if (photoUrl) {
                ad.photos!.push({ photo: [{ _: photoUrl }] });
              }
            });
        } else if (tagName === 'localisation') {
          ad.localisation = [this.parseLocation($, child)];
        } else {
          // Store as array for consistency
          if (!ad[tagName as keyof SeLogerAd]) {
            (ad as any)[tagName] = [];
          }
          (ad as any)[tagName].push(value);
        }
      });

    return ad;
  }

  private parseLocation($: cheerio.CheerioAPI, element: any): SeLogerLocation {
    const location: SeLogerLocation = {};

    $(element)
      .children()
      .each((_, child) => {
        const tagName = $(child).prop('tagName') as string | undefined;
        const value = $(child).text().trim();
        if (tagName) {
          (location as any)[tagName] = value;
        }
      });

    return location;
  }

  private transformSeLogerAd(rawAd: SeLogerAd, releaseDate: Date): Partial<BotAdData> {
    const ad: Partial<BotAdData> = {
      title: rawAd.titre?.[0] || 'Sans titre',
      description: this.buildDescription(rawAd),
      thumb_urls: this.extractPhotoUrls(rawAd),
      url: this.buildAdUrl(rawAd),
      price: this.parsePrice(rawAd.prix?.[0]),
      provider: 'seloger',
      release_date: releaseDate,
    };

    // Parse property details
    if (rawAd.nbPieces?.[0]) {
      ad.rooms = parseInt(rawAd.nbPieces[0]);
    }

    if (rawAd.surface?.[0]) {
      ad.surface = parseFloat(rawAd.surface[0]);
    }

    // Map property type
    if (rawAd.typeBien?.[0]) {
      ad.real_estate_type = this.mapPropertyType(rawAd.typeBien[0]);
    }

    // Parse location
    if (rawAd.localisation?.[0]) {
      ad.location = this.buildLocation(rawAd.localisation[0]);
    }

    return ad;
  }

  private buildDescription(rawAd: SeLogerAd): string {
    const parts: string[] = [];

    if (rawAd.descriptif?.[0]) {
      parts.push(rawAd.descriptif[0]);
    }

    if (rawAd.resume?.[0]) {
      parts.push(rawAd.resume[0]);
    }

    if (rawAd.proximite?.[0]) {
      parts.push(`Proximité: ${rawAd.proximite[0]}`);
    }

    return parts.join('\n\n').trim() || 'Pas de description';
  }

  private extractPhotoUrls(rawAd: SeLogerAd): string[] {
    const urls: string[] = [];

    // Try photos array
    if (rawAd.photos) {
      rawAd.photos.forEach((photoGroup) => {
        if (photoGroup.photo) {
          photoGroup.photo.forEach((photo) => {
            if (photo._) {
              urls.push(photo._);
            }
          });
        }
      });
    }

    // Try direct photo array
    if (rawAd.photo) {
      rawAd.photo.forEach((photo) => {
        if (photo._) {
          urls.push(photo._);
        }
      });
    }

    return urls;
  }

  private buildAdUrl(rawAd: SeLogerAd): string {
    // Prefer permaLien, fall back to urlFiche
    const url = rawAd.permaLien?.[0] || rawAd.urlFiche?.[0];

    if (!url) {
      // Construct from ID if available
      const id = rawAd.idAnnonce?.[0];
      return id ? `https://www.seloger.com/annonces/achat/${id}.htm` : '';
    }

    return url.startsWith('http') ? url : `https://www.seloger.com${url}`;
  }

  private parsePrice(priceStr?: string): number {
    if (!priceStr) return 0;

    // Remove any non-numeric characters except decimal point
    const cleaned = priceStr.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private parseSeLogerDate(dateStr: string): Date {
    // SeLoger dates are typically in format: YYYY-MM-DD HH:MM:SS or YYYY/MM/DD
    try {
      // Try ISO format first
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Try slash format (YYYY/MM/DD)
      const parts = dateStr.split(/[\s/:-]+/);
      if (parts.length >= 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parseInt(parts[2]);
        const hour = parts.length > 3 ? parseInt(parts[3]) : 0;
        const minute = parts.length > 4 ? parseInt(parts[4]) : 0;
        const second = parts.length > 5 ? parseInt(parts[5]) : 0;

        return new Date(year, month, day, hour, minute, second);
      }
    } catch {
      this.logger.warn(`Failed to parse date: ${dateStr}`);
    }

    return new Date();
  }

  private mapPropertyType(typeBien: string): string {
    const typeMap: Record<string, string> = {
      '1': 'appartement',
      '2': 'maison',
      '3': 'parking',
      '4': 'terrain',
      '5': 'boutique',
      '6': 'local_commercial',
      '7': 'bureau',
      '8': 'loft',
      '9': 'immeuble',
      '10': 'chateau',
      '11': 'hotel_particulier',
      '12': 'programme_neuf',
      'appartement': 'appartement',
      'maison': 'maison',
      'parking': 'parking',
      'terrain': 'terrain',
    };

    return typeMap[typeBien.toLowerCase()] || typeBien.toLowerCase();
  }

  private buildLocation(loc: SeLogerLocation): {
    region_name?: string;
    department_name?: string;
    city?: string;
    zipcode?: string;
    coordinates?: number[];
  } {
    return {
      region_name: loc.region,
      department_name: loc.departement,
      city: loc.ville,
      zipcode: loc.cp || 'unknown',
      coordinates:
        loc.longitude && loc.latitude
          ? [parseFloat(loc.longitude), parseFloat(loc.latitude)]
          : undefined,
    };
  }

  protected buildPageUrl(baseUrl: string, pageNumber: number): string {
    return pageNumber === 1 ? baseUrl : `${baseUrl}&SEARCHpg=${pageNumber}`;
  }
}

export const selogerScraper = new SeLogerScraper();
