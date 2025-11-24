import cron from 'node-cron';
import dotenv from 'dotenv';
import { scrapingTask } from './tasks/scraping-task';
import { cleanupTask } from './tasks/cleanup-task';
import { startServer, setJobs } from './server';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Bot');

// Start HTTP server for manual triggers and bot control
startServer();

// Scraping task - Free VPS Strategy: Every 2 hours from 5 AM to 10 PM
// Conservative approach for free VPS without proxies (~400 ads/day)
const scrapingSchedule = process.env.SCRAPING_INTERVAL || '0 */2 5-22 * * *';
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

// Start jobs immediately (auto-start on boot)
scrapingJob.start();
cleanupJob.start();

// Set jobs in server so they can be controlled via HTTP
setJobs(scrapingJob, cleanupJob);

logger.info('========================================');
logger.info('🤖 Himo Bot v2.0.0');
logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`📅 Scraping schedule: ${scrapingSchedule}`);
logger.info(`🗑️  Cleanup schedule: 0 0 1 * *`);
logger.info(`✅ Bot service started (cron jobs enabled by default)`);
logger.info('========================================');

// Handle exit events
const exitEvents = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
exitEvents.forEach((eventType) => {
  process.on(eventType, async (error) => {
    logger.error(`Bot terminating with ${eventType}`, error);

    scrapingJob.stop();
    cleanupJob.stop();

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
export { scrapingTask, cleanupTask };
