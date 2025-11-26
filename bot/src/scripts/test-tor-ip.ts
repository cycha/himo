import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

async function main() {
  console.log('Testing Tor IP...\n');

  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: process.env.TOR_PROXY || 'socks5://localhost:9050',
    },
  });

  const page = await browser.newPage();

  // Check IP
  await page.goto('https://api.ipify.org?format=json');
  const content = await page.content();
  console.log('IP seen by browser:', content);

  await browser.close();
}

main();
