import { Document } from 'mongoose';

export interface ILocation {
  region_name?: string;
  department_id?: string;
  department_name?: string;
  city?: string;
  zipcode: string;
  coordinates?: [number, number]; // [lng, lat]
}

export interface IAd extends Document {
  title: string;
  description: string;
  thumb_urls?: string[];
  url: string;
  real_estate_type?: string; // Appartement, Maison, etc.
  rooms?: number;
  surface?: number;
  immo_sell_type?: string; // Neuf ou ancien
  price: number;
  provider: string;
  location: ILocation;
  release_date: Date;
  created_at?: Date;
}

export type AdProvider = 'leboncoin' | 'seloger' | 'pap' | 'bienici';

export type RealEstateType = 'appartement' | 'maison' | 'terrain' | 'parking' | 'local-commercial';

export type ImmoSellType = 'neuf' | 'ancien';
