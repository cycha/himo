import { selogerScraper } from '../scrapers/seloger-scraper';
import * as fs from 'fs';

async function main() {
  console.log('🧪 Testing SeLoger scraper...\n');

  try {
    // Test fetching the first page
    const url = 'http://ws.seloger.com/search.xml?idtt=2&idtypebien=1,2&tri=d_dt_crea';
    console.log(`📡 Fetching URL: ${url}`);

    const xml = await selogerScraper['fetchPage'](url, 'Mozilla/5.0');

    // Save raw XML for inspection
    fs.writeFileSync('seloger-response.xml', xml);
    console.log(`💾 Saved raw XML to seloger-response.xml (${xml.length} bytes)\n`);

    // Show first 500 characters
    console.log('📄 XML Preview:');
    console.log(xml.substring(0, 500));
    console.log('...\n');

    // Try parsing
    console.log('🔍 Attempting to parse ads...');
    const result = await selogerScraper.parseAds(xml, new Date(0), '');

    console.log(`\n✅ Parse complete!`);
    console.log(`   - Found ${result.ads.length} ads`);
    console.log(`   - Up to date: ${result.isUpToDate}`);

    if (result.ads.length > 0) {
      console.log('\n📋 First ad:');
      console.log(JSON.stringify(result.ads[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

main();
