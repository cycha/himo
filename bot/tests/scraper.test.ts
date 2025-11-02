import dotenv from 'dotenv';
import { connect, disconnect } from '../src/lib/prisma';
import { leboncoinScraper } from '../src/scrapers/leboncoin-scraper-playwright';
import { Logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Test');

async function testScraper() {
  try {
    logger.info('🧪 Testing Playwright scraper...');
    logger.info('=====================================');

    // Connect to database
    await connect();

    // Run scraper (limit to 2 pages for testing)
    const customConfig = {
      maxPages: 2, // Only 2 pages for testing
      maxRetries: 3,
    };

    // Create test scraper with limited pages
    const { LeBonCoinScraperStealth } = await import('../src/scrapers/leboncoin-scraper-stealth');
    const testScraper = new LeBonCoinScraperStealth(customConfig);

    const startTime = Date.now();
    const results = await testScraper.scrape();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.info('=====================================');
    logger.info('✅ TEST RESULTS:');
    logger.info(`   - Pages scraped: ${results.pagesScraped}`);
    logger.info(`   - Ads saved: ${results.adsSaved}`);
    logger.info(`   - Failure rate: ${results.failurePercentage}%`);
    logger.info(`   - Duration: ${duration}s`);
    logger.info('=====================================');

    // Disconnect
    await disconnect();

    logger.info('✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testScraper();
