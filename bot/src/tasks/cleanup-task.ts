import { connect, close, Ad } from '@himo/commons';
import { Logger } from '../utils/logger';

const logger = new Logger('CleanupTask');

export async function cleanupTask(): Promise<void> {
  logger.info('🧹 Starting database cleanup...');

  try {
    await connect();

    // Delete ads older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await Ad.deleteMany({
      release_date: { $lt: oneYearAgo },
    });

    logger.info(`✅ Cleanup completed: ${result.deletedCount} old ads removed`);

    await close();
  } catch (error) {
    logger.error('Cleanup task failed', error);
    throw error;
  }
}
