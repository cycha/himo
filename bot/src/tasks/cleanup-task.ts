import { prisma, connect, disconnect } from '../lib/prisma';
import { Logger } from '../utils/logger';

const logger = new Logger('CleanupTask');

export async function cleanupTask(): Promise<void> {
  logger.info('🧹 Starting database cleanup...');

  try {
    await connect();

    // Delete ads older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await prisma.ad.deleteMany({
      where: {
        releaseDate: {
          lt: oneYearAgo,
        },
      },
    });

    logger.info(`✅ Cleanup completed: ${result.count} old ads removed`);

    await disconnect();
  } catch (error) {
    logger.error('Cleanup task failed', error);
    throw error;
  }
}
