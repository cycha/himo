import { prisma, connect, disconnect } from '../lib/prisma';
import { Logger } from '../utils/logger';

const logger = new Logger('FixStuckRunsTask');

export async function fixStuckRunsTask(): Promise<void> {
  logger.info('🔧 Starting stuck runs cleanup...');

  try {
    await connect();

    // Find all running bot runs that started more than 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const stuckRuns = await prisma.botRun.findMany({
      where: {
        status: 'running',
        startTime: {
          lt: thirtyMinutesAgo,
        },
      },
      select: {
        id: true,
        startTime: true,
      },
    });

    if (stuckRuns.length > 0) {
      logger.info(`Found ${stuckRuns.length} stuck runs to fix`);

      // Update all stuck runs to failed status
      const result = await prisma.botRun.updateMany({
        where: {
          status: 'running',
          startTime: {
            lt: thirtyMinutesAgo,
          },
        },
        data: {
          status: 'failed',
          endTime: new Date(),
          errorMessage: 'Run did not complete - marked as failed by automated cleanup',
        },
      });

      logger.info(`✅ Fixed ${result.count} stuck bot runs`);
    } else {
      logger.info('✅ No stuck runs found');
    }

    await disconnect();
  } catch (error) {
    logger.error('Fix stuck runs task failed', error);
    throw error;
  }
}
