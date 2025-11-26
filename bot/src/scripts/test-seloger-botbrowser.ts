import { selogerScraperBotBrowser } from '../scrapers/seloger-scraper-botbrowser';

async function main() {
  console.log('🧪 Testing SeLoger BotBrowser scraper...\n');

  try {
    console.log('🔍 Starting scrape...');
    const result = await selogerScraperBotBrowser.scrape();

    console.log('\n✅ Scrape complete!');
    console.log(`   - Ads saved: ${result.adsSaved}`);
    console.log(`   - Pages scraped: ${result.pagesScraped}`);
    console.log(`   - Failure rate: ${result.failurePercentage.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

main();
