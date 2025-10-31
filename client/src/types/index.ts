// User types
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    token: string;
  };
}

// Ad types
export interface Location {
  region_name?: string;
  department_id?: string;
  department_name?: string;
  city?: string;
  zipcode: string;
  coordinates?: [number, number];
}

export interface Ad {
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
  location: Location;
  release_date: string;
  created_at?: string;
}

export interface SearchFilters {
  title?: string;
  type?: string;
  sellType?: string;
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  location?: {
    address_components?: Array<{
      types: string[];
      short_name: string;
    }>;
    coordinates?: [number, number];
  };
  page?: number;
}

export interface SearchResponse {
  success: boolean;
  data: Ad[];
  page: number;
  count: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword?: string;
}
