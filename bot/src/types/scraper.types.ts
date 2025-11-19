import { IAd } from '@himo/commons';

export interface ScraperConfig {
  maxPages: number;
  maxRetries: number;
  waitSuccess: number;
  waitError: number;
  baseUrl: string;
  provider: string;
}

export interface ScraperResult {
  adsSaved: number;
  failurePercentage: number;
  averageRetriesPerRequest: number;
  pagesScraped: number;
}

export interface ParseResult {
  ads: Partial<IAd>[];
  isUpToDate: boolean;
}

export interface RawAdData {
  list_id: string;
  subject: string;
  body: string;
  price: number | string;
  images: {
    urls: string[];
  };
  url: string;
  location: {
    region_name?: string;
    department_id?: string;
    department_name?: string;
    city?: string;
    zipcode?: string;
    lng?: number;
    lat?: number;
    coordinates?: [number, number];
  };
  attributes: Array<{
    key: string;
    value: string;
    value_label?: string;
  }>;
  first_publication_date?: string;
  index_date?: string;
}
