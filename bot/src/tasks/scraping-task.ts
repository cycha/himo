import { connect, disconnect, prisma } from '../lib/prisma';
import { leboncoinScraper } from '../scrapers/leboncoin-scraper-stealth';
import { papScraper } from '../scrapers/pap-scraper';
import { Logger } from '../utils/logger';

const logger = new Logger('ScrappingTask');

interface ScraperResult {
  adsSaved: number;
  pagesScraped: number;
  failurePercentage: number;
  averageRetriesPerRequest: number;
}

interface Scraper {
  scrape(): Promise<ScraperResult>;
}

async function runScraper(name: string, scraper: Scraper): Promise<ScraperResult> {
  logger.info('========================================');
  logger.info(`Starting ${name} scraper...`);
  logger.info('========================================');
  const results = await scraper.scrape();
  logger.info(`✅ ${name} scraping completed`);
  logger.info(`   Ads saved: ${results.adsSaved}`);
  logger.info(`   Pages scraped: ${results.pagesScraped}`);
  logger.info('');
  return results;
}

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

    // Run scrapers with individual error handling
    logger.info('');
    const scrapers = [
      { name: 'LeBonCoin', scraper: leboncoinScraper },
      { name: 'PAP', scraper: papScraper },
    ];

    const results = await Promise.all(
      scrapers.map(async ({ name, scraper }) => {
        try {
          return await runScraper(name, scraper);
        } catch (error) {
          logger.error(`${name} scraper failed:`, error);
          // Return empty result on failure so other scrapers can continue
          return {
            adsSaved: 0,
            pagesScraped: 0,
            failurePercentage: 100,
            averageRetriesPerRequest: 0,
          };
        }
      })
    );

    // Aggregate results
    const totalAdsSaved = results.reduce((sum, r) => sum + r.adsSaved, 0);
    const totalPagesScraped = results.reduce((sum, r) => sum + r.pagesScraped, 0);
    const avgFailureRate = results.reduce((sum, r) => sum + r.failurePercentage, 0) / results.length;
    const avgRetries = results.reduce((sum, r) => sum + r.averageRetriesPerRequest, 0) / results.length;

    logger.info('##################################################################');
    logger.info('## SCRAPING TASK COMPLETED');
    logger.info(`## Total ads saved: ${totalAdsSaved}`);
    results.forEach((result, index) => {
      logger.info(
        `##   - ${scrapers[index].name}: ${result.adsSaved} ads, ${result.pagesScraped} pages`
      );
    });
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
        logger.info(`Updated bot run ${botRunId} with error status`);
      } catch (updateError) {
        logger.error('Failed to update bot run with error status', updateError);
      }
    }

    throw error;
  } finally {
    // Always close database connection, even if there were errors
    try {
      await disconnect();
    } catch (disconnectError) {
      logger.error('Failed to disconnect from database', disconnectError);
    }
  }
}
