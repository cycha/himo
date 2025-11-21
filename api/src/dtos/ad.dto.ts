export interface SearchAdDto {
  title?: string;
  type?: string;
  sellType?: string;
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  city?: string; // Direct city filter
  zipcode?: string; // Direct zipcode filter
  location?: {
    address_components?: Array<{
      types: string[];
      short_name: string;
    }>;
    coordinates?: [number, number];
  };
  page?: number;
}

export interface AdResponseDto {
  _id: string;
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
  location: {
    region_name?: string;
    department_id?: string;
    department_name?: string;
    city?: string;
    zipcode: string;
    coordinates?: [number, number];
  };
  release_date: Date;
  created_at?: Date;
}

export interface SearchResultDto {
  success: boolean;
  data: AdResponseDto[];
  page: number;
  count: number;
  totalPages?: number;
}

export interface CreateAdDto {
  title: string;
  description: string;
  url: string;
  price: number;
  provider: string;
  location: {
    zipcode: string;
    city?: string;
    coordinates?: [number, number];
  };
  release_date: Date;
  real_estate_type?: string;
  rooms?: number;
  surface?: number;
  immo_sell_type?: string;
  thumb_urls?: string[];
}
