/**
 * Test scraper with mock data (no network calls)
 * This allows testing the parser and Prisma integration without hitting LeBonCoin
 */

import dotenv from 'dotenv';
import { connect, disconnect } from '../src/lib/prisma';
import { Logger } from '../src/utils/logger';
import { mockLeBonCoinAds, generateMockLeBonCoinHTML } from './mock-leboncoin-data';
import { LeBonCoinScraperStealth } from '../src/scrapers/leboncoin-scraper-stealth';

dotenv.config();

const logger = new Logger('MockTest');

/**
 * Mock scraper that uses test data instead of network calls
 */
class MockLeBonCoinScraper extends LeBonCoinScraperStealth {
  private mockHTML: string;

  constructor(mockAds: any[]) {
    super({ maxPages: 1, maxRetries: 0 });
    this.mockHTML = generateMockLeBonCoinHTML(mockAds);
  }

  /**
   * Override fetchPage to return mock HTML
   */
  async fetchPage(url: string, userAgent: string): Promise<string> {
    logger.info(`📦 Using mock data instead of fetching: ${url}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.mockHTML;
  }
}

async function testWithMockData() {
  try {
    logger.info('🧪 Testing scraper with MOCK data...');
    logger.info('=====================================');

    // Connect to database
    await connect();
    logger.info('✅ Connected to database');

    // Create mock scraper
    const mockScraper = new MockLeBonCoinScraper(mockLeBonCoinAds);

    logger.info(`📊 Mock data contains ${mockLeBonCoinAds.length} ads`);
    logger.info('🔧 Testing parser and Prisma validation...');

    const startTime = Date.now();
    const results = await mockScraper.scrape();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.info('=====================================');
    logger.info('✅ TEST RESULTS:');
    logger.info(`   - Pages scraped: ${results.pagesScraped}`);
    logger.info(`   - Ads saved: ${results.adsSaved}`);
    logger.info(`   - Failure rate: ${results.failurePercentage}%`);
    logger.info(`   - Duration: ${duration}s`);

    if (results.adsSaved > 0) {
      logger.info('✅ Parser working correctly!');
      logger.info('✅ Prisma validation passed!');
      logger.info('✅ Database insertion successful!');
    } else {
      logger.warn('⚠️ No ads were saved - check validation logic');
    }

    logger.info('=====================================');

    // Verify in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const count = await prisma.ad.count();
    logger.info(`📊 Total ads in database: ${count}`);

    const latestAds = await prisma.ad.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    logger.info('📋 Latest ads in database:');
    latestAds.forEach((ad, i) => {
      logger.info(`   ${i + 1}. ${ad.title} - ${ad.price}€ - ${ad.city}`);
    });

    await prisma.$disconnect();
    await disconnect();

    logger.info('✅ Mock test completed successfully!');
    logger.info('💡 You can now test the scraper without hitting LeBonCoin');
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Test failed:', error);

    // Show detailed error for Prisma validation errors
    if (error.message?.includes('Prisma') || error.message?.includes('validation')) {
      logger.error('🔍 PRISMA VALIDATION ERROR DETAILS:');
      logger.error(JSON.stringify(error, null, 2));
    }

    process.exit(1);
  }
}

// Run test
testWithMockData();
