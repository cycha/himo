import cron, { ScheduleOptions } from 'node-cron';
import dotenv from 'dotenv';
import { scrapingTask } from './tasks/scraping-task';
import { cleanupTask } from './tasks/cleanup-task';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Bot');

// Scraping task - runs every 2 minutes from 5 AM to 10 PM
const scrapingSchedule = process.env.SCRAPING_INTERVAL || '*/2 5-22 * * *';
const scrapingJob = cron.schedule(scrapingSchedule, async () => {
  try {
    await scrapingTask();
  } catch (error) {
    logger.error('Scraping job failed', error);
  }
}, {
  timezone: 'Europe/Paris',
} as ScheduleOptions);

// Cleanup task - runs on the 1st of every month at midnight
const cleanupJob = cron.schedule('0 0 1 * *', async () => {
  try {
    await cleanupTask();
  } catch (error) {
    logger.error('Cleanup job failed', error);
  }
}, {
  timezone: 'Europe/Paris',
} as ScheduleOptions);

logger.info('========================================');
logger.info('🤖 Himo Bot v2.0.0');
logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`📅 Scraping schedule: ${scrapingSchedule}`);
logger.info(`🗑️  Cleanup schedule: 0 0 1 * *`);
logger.info(`✅ Bot started successfully`);
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
