import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection helpers
export async function connect() {
  try {
    await prisma.$connect();
    console.log('✅ Bot connected to PostgreSQL');
  } catch (error) {
    console.error('❌ Bot failed to connect to PostgreSQL:', error);
    throw error;
  }
}

export async function disconnect() {
  await prisma.$disconnect();
  console.log('Bot database connection closed');
}
