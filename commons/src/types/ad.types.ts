export interface ILocation {
  region_name?: string;
  department_id?: string;
  department_name?: string;
  city?: string;
  zipcode: string;
  coordinates?: [number, number]; // [lng, lat]
}

export interface IAd {
  id: string;
  title: string;
  description: string;
  thumbUrls?: string[];
  url: string;
  realEstateType?: string;
  rooms?: number;
  surface?: number;
  immoSellType?: string;
  price: number;
  provider: string;
  regionName?: string;
  departmentId?: string;
  departmentName?: string;
  city?: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  releaseDate: Date;
  createdAt?: Date;
}

export type AdProvider = 'leboncoin' | 'seloger' | 'pap' | 'bienici';

export type RealEstateType = 'appartement' | 'maison' | 'terrain' | 'parking' | 'local-commercial';

export type ImmoSellType = 'neuf' | 'ancien';
