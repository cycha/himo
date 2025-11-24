# DataDome Bypass Guide for LeBonCoin Scraping

## Overview

DataDome is a sophisticated bot protection system used by LeBonCoin. This guide provides strategies to minimize detection and maximize scraping success.

## Understanding DataDome

DataDome uses multiple detection layers:

1. **IP Reputation Tracking** - Flags datacenter IPs and known proxy IPs
2. **Browser Fingerprinting** - Analyzes Canvas, WebGL, Audio, and Font fingerprints
3. **Behavioral Analysis** - Monitors mouse movements, scroll patterns, and timing
4. **TLS Fingerprinting** - Identifies automated tools via TLS handshake
5. **JavaScript Challenges** - Real-time JavaScript execution tests
6. **Machine Learning** - Pattern detection across multiple requests

## Current Implementation

Our stealth scraper (`leboncoin-scraper-stealth.ts`) implements:

- ✅ Playwright with puppeteer-extra-plugin-stealth
- ✅ Navigator property overrides (webdriver, plugins, etc.)
- ✅ Human behavior simulation (mouse movements, scrolling)
- ✅ Random delays between requests (15-30 seconds)
- ✅ Realistic viewport sizes
- ✅ Persistent User-Agent across session
- ✅ Homepage visit before scraping
- ✅ French locale and timezone (Europe/Paris)
- ✅ Proxy support (optional but recommended)

## Configuration Changes Made

### 1. Reduced Scraping Frequency

**Before:** Every 2 minutes
**After:** Every 15 minutes
**Why:** DataDome flags rapid repeated access patterns

### 2. Increased Delays

**Before:** 8-16 seconds between pages
**After:** 15-30 seconds between pages
**Why:** Slower = more human-like

### 3. Updated User Agents

**Before:** Chrome 120
**After:** Chrome 130-131
**Why:** Use current browser versions

### 4. Added Session Warmup

**New:** Visit homepage before scraping
**Why:** Real users don't go directly to search results

## Critical: Use Residential Proxies

**This is the #1 most important factor for success.**

### Why Proxies Matter

DataDome maintains a reputation score for each IP:

- Datacenter IPs: Instantly suspicious
- Residential IPs: Look like real users
- Rotating IPs: Avoid IP-based rate limiting

### Recommended Proxy Providers

1. **Bright Data** (formerly Luminati)
   - Best quality, most expensive (~$500/month for 40GB)
   - 72M+ residential IPs
   - Best DataDome bypass rate
   - https://brightdata.com

2. **Smartproxy**
   - Good balance of price/quality (~$75/month for 8GB)
   - 40M+ residential IPs
   - Dedicated scraping proxies
   - https://smartproxy.com

3. **Oxylabs**
   - Enterprise-grade (~$300/month for 20GB)
   - 100M+ residential IPs
   - Great for DataDome
   - https://oxylabs.io

4. **ProxyMesh** (Budget option)
   - Cheaper but mixed results (~$50/month)
   - Rotating proxies
   - Hit or miss with DataDome
   - https://proxymesh.com

### Proxy Configuration

Add to your `.env` file:

```bash
PROXY_HOST=proxy.smartproxy.com
PROXY_PORT=7000
PROXY_USERNAME=your_username
PROXY_PASSWORD=your_password
```

**Pro tip:** Use **sticky sessions** (same IP for multiple requests) if your provider supports it. This looks more natural.

## Additional Strategies

### 1. Limit Pages Scraped

Don't try to scrape all 30 pages in one session:

```typescript
// In bot/src/scrapers/leboncoin-scraper-stealth.ts
const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 10, // Reduced from 30
  // ...
};
```

### 2. Use Different Search URLs

Rotate between different search queries to avoid pattern detection:

```typescript
const searchUrls = [
  'https://www.leboncoin.fr/recherche?category=9&locations=r_12',
  'https://www.leboncoin.fr/recherche?category=9&locations=r_11',
  'https://www.leboncoin.fr/recherche?category=9&real_estate_type=1',
];
```

### 3. Add Random Referers

Make it look like you came from search engines:

```typescript
await this.page.setExtraHTTPHeaders({
  Referer: 'https://www.google.com/',
  // ... other headers
});
```

### 4. Monitor for Blocks

Check your logs for these signs of blocking:

- HTTP 403 or 429 status codes
- Page titles containing "captcha" or "blocked"
- Small HTML responses (< 100KB)
- Missing ad data in JSON

### 5. Use Headful Mode for Testing

Set `HEADLESS=false` in `.env` to see what DataDome sees:

```bash
HEADLESS=false
```

This opens a real browser window so you can:

- See CAPTCHA challenges
- Verify pages load correctly
- Debug detection issues

### 6. Rotate Browser Contexts

For advanced users, create new browser contexts periodically:

```typescript
// Every 5 pages, create a new context
if (pageNumber % 5 === 0) {
  await this.close();
  await this.initBrowser();
}
```

### 7. Accept Cookies

DataDome checks if you accept cookie banners:

```typescript
// After page load
try {
  const cookieButton = await this.page.waitForSelector('button[id*="cookie"]', {
    timeout: 3000,
  });
  await cookieButton?.click();
} catch {
  // No cookie banner, continue
}
```

## Testing Your Setup

### Test 1: Manual Browser Check

Visit https://www.leboncoin.fr/recherche?category=9 in a normal browser from your server's IP. If you get blocked immediately, your IP is burned.

### Test 2: Check Bot Detection

Use https://bot.sannysoft.com/ to test your browser fingerprint.

### Test 3: DataDome Test Page

Some providers offer test pages to verify DataDome bypass.

### Test 4: Run Scraper with Logging

```bash
cd /home/user/himo
pnpm --filter bot dev
```

Watch for:

- ✅ "Ad containers detected"
- ✅ "Found X raw ads"
- ❌ "CAPTCHA or blocking detected"
- ❌ "HTTP 403/429 response"

## What to Do When Blocked

If you get blocked:

1. **Stop immediately** - More requests = worse reputation
2. **Wait 6-24 hours** - Let the IP cool down
3. **Switch IP** - Use a different proxy
4. **Reduce frequency** - Lower maxPages, increase delays
5. **Check logs** - Look for patterns in failed-scrape.html

## Advanced: CAPTCHA Solving

If you have budget, integrate CAPTCHA solving:

- **2Captcha** - $2.99 per 1000 CAPTCHAs
- **Anti-Captcha** - Similar pricing
- **CapSolver** - Specialized in DataDome

**Not recommended** for regular scraping due to cost and complexity.

## Legal & Ethical Considerations

⚠️ **Important:**

- Respect robots.txt (LeBonCoin blocks bots)
- Don't overload servers (hence the delays)
- Don't sell scraped data commercially
- Use scraped data for personal projects only
- Be prepared to stop if asked by the site

LeBonCoin's ToS prohibit automated scraping. Use at your own risk.

## Success Metrics

With proper setup, you should achieve:

- **Success Rate:** > 80%
- **Blocks/Day:** < 5%
- **CAPTCHAs:** < 1% (with good proxies)

If you're below these metrics, you likely need better proxies.

## Troubleshooting

### "No ads found in HTML"

**Cause:** DataDome blocked the request
**Solution:** Use proxy, increase delays, check IP reputation

### "CAPTCHA detected"

**Cause:** IP flagged by DataDome
**Solution:** Switch proxy, wait longer, reduce frequency

### "HTTP 403 response"

**Cause:** Hard block by DataDome
**Solution:** Stop immediately, wait 24h, use different IP

### "Small HTML size detected: X bytes"

**Cause:** DataDome returned block page instead of real content
**Solution:** Check failed-scrape.html, likely need proxy

## Cost Analysis

### Without Proxies

- **Cost:** $0/month
- **Success Rate:** 10-30%
- **Blocks:** Very frequent
- **Verdict:** Not viable long-term

### With Budget Proxies ($50/month)

- **Cost:** $50/month
- **Success Rate:** 50-70%
- **Blocks:** Occasional
- **Verdict:** OK for small projects

### With Premium Proxies ($300/month)

- **Cost:** $300/month
- **Success Rate:** 85-95%
- **Blocks:** Rare
- **Verdict:** Best for production

## Alternative Approaches

If DataDome is too difficult:

1. **Use LeBonCoin API** (if available for partners)
2. **Scrape less frequently** (once/day instead of every 15min)
3. **Buy commercial data** from aggregators
4. **Focus on other sources** (SeLoger, Logic-Immo, PAP)
5. **Manual curation** for high-value listings

## Summary

**Must Have:**

- ✅ Residential proxies (Bright Data or Smartproxy)
- ✅ 15+ second delays between requests
- ✅ Scraping every 15+ minutes (not every 2 minutes)
- ✅ Stealth browser configuration (already implemented)

**Nice to Have:**

- Cookie acceptance automation
- Multiple search URL rotation
- Browser context rotation
- CAPTCHA solving integration

**Monitor:**

- Success/failure rate
- Block frequency
- HTML size of responses
- DataDome challenge pages

Good luck! 🍀
