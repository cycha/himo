/**
 * Enum exports for Prisma types
 * These are re-exported from Prisma generated types
 */

export const RealEstateType = {
  appartement: 'appartement',
  maison: 'maison',
  terrain: 'terrain',
  parking: 'parking',
  local_commercial: 'local_commercial',
} as const;

export type RealEstateType = (typeof RealEstateType)[keyof typeof RealEstateType];

export const ImmoSellType = {
  neuf: 'neuf',
  ancien: 'ancien',
} as const;

export type ImmoSellType = (typeof ImmoSellType)[keyof typeof ImmoSellType];

export const Provider = {
  leboncoin: 'leboncoin',
  seloger: 'seloger',
  pap: 'pap',
  bienici: 'bienici',
} as const;

export type Provider = (typeof Provider)[keyof typeof Provider];
