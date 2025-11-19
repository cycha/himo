import { prisma } from '../../lib/prisma';
import { RealEstateType, ImmoSellType, Provider } from '@prisma/client';

/**
 * Creates a test user in the database
 */
export async function createTestUser(overrides: {
  email?: string;
  password?: string;
} = {}) {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYVGWVyYmW2', // "password123"
  };

  return prisma.user.create({
    data: { ...defaultUser, ...overrides },
  });
}

/**
 * Creates a test ad in the database
 */
export async function createTestAd(overrides: Partial<{
  title: string;
  description: string;
  url: string;
  realEstateType: RealEstateType;
  price: number;
  surface: number;
  rooms: number;
  city: string;
  zipcode: string;
  departmentId: string;
  departmentName: string;
  regionName: string;
  latitude: number;
  longitude: number;
  provider: Provider;
  immoSellType: ImmoSellType;
}> = {}) {
  const defaultAd = {
    title: 'Test Property',
    description: 'A nice test property',
    url: `https://example.com/ad-${Date.now()}`,
    realEstateType: RealEstateType.appartement,
    price: 200000,
    surface: 75,
    rooms: 3,
    city: 'Paris',
    zipcode: '75001',
    departmentId: '75',
    departmentName: 'Paris',
    regionName: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    provider: Provider.leboncoin,
    releaseDate: new Date(),
    immoSellType: ImmoSellType.ancien,
  };

  return prisma.ad.create({
    data: { ...defaultAd, ...overrides },
  });
}

/**
 * Cleans all test data from the database
 */
export async function cleanDatabase() {
  await prisma.ad.deleteMany({});
  await prisma.user.deleteMany({});
}

/**
 * Gets the total count of users in the database
 */
export async function getUserCount() {
  return prisma.user.count();
}

/**
 * Gets the total count of ads in the database
 */
export async function getAdCount() {
  return prisma.ad.count();
}
