import { connect, close } from '@himo/commons';
import { leboncoinScraper } from '../scrappers/leboncoin-scraper';
import { Logger } from '../utils/logger';

const logger = new Logger('ScrappingTask');

export async function scrapingTask(): Promise<void> {
  const startTime = Date.now();
  
  logger.info('##################################################################');
  logger.info('## SCRAPING TASK STARTING...');
  logger.info('##################################################################');

  try {
    // Ensure database connection
    await connect();

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

    // Close database connection
    await close();
  } catch (error) {
    logger.error('Scraping task failed', error);
    throw error;
  }
}
