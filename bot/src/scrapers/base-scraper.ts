// Shared types for bot ad data — used by all scrapers
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
