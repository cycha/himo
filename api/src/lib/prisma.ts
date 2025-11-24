import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Create PostgreSQL connection pool with appropriate limits
const pool = globalForPrisma.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'test' ? 5 : 20, // Limit connections in test environment
  // Ensure password is treated as string
  ssl: false,
});

// Create PostgreSQL adapter for Prisma v7
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

// Connection test
export async function connect() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL successfully');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

// Graceful shutdown
export async function disconnect() {
  await prisma.$disconnect();
  console.log('Database connection closed');
}
