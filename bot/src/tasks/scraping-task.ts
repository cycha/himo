import { connect, disconnect, prisma } from '../lib/prisma';
import { leboncoinScraper } from '../scrapers/leboncoin-scraper-stealth';
import { Logger } from '../utils/logger';

const logger = new Logger('ScrappingTask');

export async function scrapingTask(): Promise<void> {
  const startTime = Date.now();
  let botRunId: string | null = null;

  logger.info('##################################################################');
  logger.info('## SCRAPING TASK STARTING...');
  logger.info('##################################################################');

  try {
    // Ensure database connection
    await connect();

    // Check for existing bot run ID from environment (manual trigger)
    const existingRunId = process.env.BOT_RUN_ID;

    if (existingRunId) {
      botRunId = existingRunId;
      logger.info(`Using existing bot run ID: ${botRunId}`);
    } else {
      // Create a new bot run record for cron-triggered runs
      const botRun = await prisma.botRun.create({
        data: {
          triggeredBy: 'cron',
          status: 'running',
        },
      });
      botRunId = botRun.id;
      logger.info(`Created new bot run: ${botRunId}`);
    }

    // Run LeBonCoin scraper
    const results = await leboncoinScraper.scrape();

    logger.info('##################################################################');
    logger.info('## SCRAPING TASK COMPLETED');
    logger.info(`## Ads saved: ${results.adsSaved}`);
    logger.info(`## Pages scraped: ${results.pagesScraped}`);
    logger.info(`## Failure rate: ${results.failurePercentage}%`);
    logger.info(`## Avg retries per failed request: ${results.averageRetriesPerRequest}`);
    logger.info(`## Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    logger.info('##################################################################');

    // Update bot run with results
    if (botRunId) {
      await prisma.botRun.update({
        where: { id: botRunId },
        data: {
          status: 'completed',
          endTime: new Date(),
          adsSaved: results.adsSaved,
          pagesScraped: results.pagesScraped,
          failurePercentage: results.failurePercentage,
          averageRetriesPerRequest: results.averageRetriesPerRequest,
        },
      });
      logger.info(`Updated bot run ${botRunId} with results`);
    }

    // Close database connection
    await disconnect();
  } catch (error) {
    logger.error('Scraping task failed', error);

    // Update bot run with error status
    if (botRunId) {
      try {
        await prisma.botRun.update({
          where: { id: botRunId },
          data: {
            status: 'failed',
            endTime: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (updateError) {
        logger.error('Failed to update bot run with error status', updateError);
      }
    }

    throw error;
  }
}
