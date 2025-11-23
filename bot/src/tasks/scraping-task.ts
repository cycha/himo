import { connect, disconnect, prisma } from '../lib/prisma';
import { leboncoinScraper } from '../scrapers/leboncoin-scraper-stealth';
import { selogerScraper } from '../scrapers/seloger-scraper';
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
    logger.info('');
    logger.info('========================================');
    logger.info('Starting LeBonCoin scraper...');
    logger.info('========================================');
    const leboncoinResults = await leboncoinScraper.scrape();
    logger.info('✅ LeBonCoin scraping completed');
    logger.info(`   Ads saved: ${leboncoinResults.adsSaved}`);
    logger.info(`   Pages scraped: ${leboncoinResults.pagesScraped}`);
    logger.info('');

    // Run SeLoger scraper
    logger.info('========================================');
    logger.info('Starting SeLoger scraper...');
    logger.info('========================================');
    const selogerResults = await selogerScraper.scrape();
    logger.info('✅ SeLoger scraping completed');
    logger.info(`   Ads saved: ${selogerResults.adsSaved}`);
    logger.info(`   Pages scraped: ${selogerResults.pagesScraped}`);
    logger.info('');

    // Aggregate results
    const totalAdsSaved = leboncoinResults.adsSaved + selogerResults.adsSaved;
    const totalPagesScraped = leboncoinResults.pagesScraped + selogerResults.pagesScraped;
    const avgFailureRate =
      (leboncoinResults.failurePercentage + selogerResults.failurePercentage) / 2;
    const avgRetries =
      (leboncoinResults.averageRetriesPerRequest + selogerResults.averageRetriesPerRequest) / 2;

    logger.info('##################################################################');
    logger.info('## SCRAPING TASK COMPLETED');
    logger.info(`## Total ads saved: ${totalAdsSaved}`);
    logger.info(
      `##   - LeBonCoin: ${leboncoinResults.adsSaved} ads, ${leboncoinResults.pagesScraped} pages`
    );
    logger.info(
      `##   - SeLoger: ${selogerResults.adsSaved} ads, ${selogerResults.pagesScraped} pages`
    );
    logger.info(`## Total pages scraped: ${totalPagesScraped}`);
    logger.info(`## Avg failure rate: ${avgFailureRate.toFixed(2)}%`);
    logger.info(`## Avg retries per failed request: ${avgRetries.toFixed(2)}`);
    logger.info(`## Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    logger.info('##################################################################');

    // Update bot run with results
    if (botRunId) {
      await prisma.botRun.update({
        where: { id: botRunId },
        data: {
          status: 'completed',
          endTime: new Date(),
          adsSaved: totalAdsSaved,
          pagesScraped: totalPagesScraped,
          failurePercentage: avgFailureRate,
          averageRetriesPerRequest: avgRetries,
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
