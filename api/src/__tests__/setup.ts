// Set test environment BEFORE importing prisma
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/himo_test';

import { prisma } from '../lib/prisma';

// Global test timeout
jest.setTimeout(10000);

// Clean up database before all tests
beforeAll(async () => {
  // Connect to database
  await prisma.$connect();
});

// Clean up database after each test
afterEach(async () => {
  // Delete all records in reverse order of dependencies
  await prisma.ad.deleteMany({});
  await prisma.user.deleteMany({});
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
