export interface LocationFilter {
  address_components?: Array<{
    types: string[];
    short_name: string;
  }>;
  coordinates?: [number, number]; // [lng, lat]
}

export interface SearchAdDto {
  title?: string;
  type?: string; // real_estate_type
  sellType?: string; // immo_sell_type
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  location?: LocationFilter;
  page?: number;
}

export interface SignupDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
