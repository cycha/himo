import cron from 'node-cron';
import dotenv from 'dotenv';
import { scrapingTask } from './tasks/scraping-task';
import { cleanupTask } from './tasks/cleanup-task';
import { fixStuckRunsTask } from './tasks/fix-stuck-runs-task';
import { startServer, setJobs } from './server';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Bot');

// Start HTTP server for manual triggers and bot control
startServer();

// Scraping task - Bot-friendly: Every 6 hours at 6 AM, 12 PM, 6 PM, 12 AM
// Very conservative to avoid detection (~60-100 ads/day, 4 runs/day)
const scrapingSchedule = process.env.SCRAPING_INTERVAL || '0 0 */6 * * *';
const scrapingJob = cron.schedule(
  scrapingSchedule,
  async () => {
    try {
      await scrapingTask();
    } catch (error) {
      logger.error('Scraping job failed', error);
    }
  },
  {
    timezone: 'Europe/Paris',
  }
);

// Cleanup task - runs on the 1st of every month at midnight
const cleanupJob = cron.schedule(
  '0 0 1 * *',
  async () => {
    try {
      await cleanupTask();
    } catch (error) {
      logger.error('Cleanup job failed', error);
    }
  },
  {
    timezone: 'Europe/Paris',
  }
);

// Fix stuck runs task - runs daily at 3 AM
const fixStuckRunsJob = cron.schedule(
  '0 3 * * *',
  async () => {
    try {
      await fixStuckRunsTask();
    } catch (error) {
      logger.error('Fix stuck runs job failed', error);
    }
  },
  {
    timezone: 'Europe/Paris',
  }
);

// Start jobs immediately (auto-start on boot)
scrapingJob.start();
cleanupJob.start();
fixStuckRunsJob.start();

// Set jobs in server so they can be controlled via HTTP
setJobs(scrapingJob, cleanupJob);

logger.info('========================================');
logger.info('🤖 Himo Bot v2.0.0');
logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`📅 Scraping schedule: ${scrapingSchedule}`);
logger.info(`🗑️  Cleanup schedule: 0 0 1 * *`);
logger.info(`🔧 Fix stuck runs: 0 3 * * *`);
logger.info(`✅ Bot service started (cron jobs enabled by default)`);
logger.info('========================================');

// Handle exit events
const exitEvents = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
exitEvents.forEach((eventType) => {
  process.on(eventType, async (error) => {
    logger.error(`Bot terminating with ${eventType}`, error);

    scrapingJob.stop();
    cleanupJob.stop();
    fixStuckRunsJob.stop();

    try {
      const { disconnect } = await import('./lib/prisma');
      await disconnect();
    } catch (err) {
      logger.error('Error closing database connection', err);
    }

    process.exit(error ? 1 : 0);
  });
});

// Export for testing or manual execution
export { scrapingTask, cleanupTask, fixStuckRunsTask };
