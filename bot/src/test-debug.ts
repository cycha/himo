import { chromium } from 'playwright';

async function debugScrape() {
  console.log('🔍 Debugging LeBonCoin page structure...');
  
  const browser = await chromium.launch({
    headless: false, // Show browser window to see what's happening
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'fr-FR',
  });

  console.log('📄 Navigating to LeBonCoin...');
  await page.goto('https://www.leboncoin.fr/recherche/?category=9', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'leboncoin-debug.png', fullPage: true });

  console.log('📊 Checking page content...');
  const title = await page.title();
  console.log(`   Title: ${title}`);

  const html = await page.content();
  console.log(`   HTML length: ${html.length} bytes`);

  // Check for ads
  const hasAds = html.includes('"ads":');
  const hasListID = html.includes('"listID"');
  const hasAdItems = html.includes('data-qa-id');
  
  console.log(`   Contains "ads": ${hasAds}`);
  console.log(`   Contains "listID": ${hasListID}`);
  console.log(`   Contains ad items: ${hasAdItems}`);

  // Save HTML for inspection
  const fs = require('fs');
  fs.writeFileSync('leboncoin-debug.html', html);
  console.log('💾 Saved HTML to leboncoin-debug.html');
  console.log('💾 Saved screenshot to leboncoin-debug.png');

  console.log('\n⏸️  Browser window will stay open for 30 seconds...');
  console.log('   Check the browser to see if there are CAPTCHA or other issues');
  
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Done!');
}

debugScrape().catch(console.error);
