import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Ensure environment variables are loaded (idempotent - safe to call multiple times)
import 'dotenv/config';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

// Parse DATABASE_URL to ensure password is properly handled as string
function parseConnectionConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Parse the connection URL
  const url = new URL(connectionString);

  return {
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1), // Remove leading slash
    user: url.username,
    password: url.password, // Explicitly extract password as string
    max: process.env.NODE_ENV === 'test' ? 5 : 20,
    ssl: false,
  };
}

// Create PostgreSQL connection pool with appropriate limits
const pool = globalForPrisma.pool || new Pool(parseConnectionConfig());

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
