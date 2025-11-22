# Free LeBonCoin Scraping Strategy (No Proxies)

## Overview

How to scrape LeBonCoin without paying for proxies, maximizing success rate with free methods.

## The Strategy

### 1. Use Your Home IP (Free)
- Most residential IPs aren't blocked initially
- Our anti-detection features help a lot
- Monitor for blocks, stop when detected

### 2. Scrape MUCH Less Frequently

Update `.env`:
```bash
# Scrape twice per day instead of every 15 minutes
SCRAPING_INTERVAL=0 8,20 * * *  # 8 AM and 8 PM
```

Or once per hour:
```bash
SCRAPING_INTERVAL=0 * 5-22 * * *  # Every hour from 5 AM to 10 PM
```

### 3. Reduce Pages Per Session

Edit `bot/src/scrapers/leboncoin-scraper-stealth.ts`:
```typescript
const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5,  // Changed from 30 to 5
  maxRetries: 0,
  waitSuccess: 20,  // Increased from 15 to 20
  waitError: 60,
  baseUrl: 'https://www.leboncoin.fr/recherche?category=9',
  provider: 'leboncoin',
};
```

### 4. Target Specific Searches

Instead of scraping all listings, focus on what you need:

```typescript
// Create specific search URLs
const targetSearches = [
  'https://www.leboncoin.fr/recherche?category=9&locations=r_12&real_estate_type=1', // Apartments in Île-de-France
  'https://www.leboncoin.fr/recherche?category=9&locations=r_11&real_estate_type=2', // Houses in Provence
];
```

### 5. Monitor Your Success Rate

Keep logs and watch for patterns:
```bash
# Check how many ads you're getting
tail -f logs/bot.log | grep "ads saved"

# If you see blocks, stop immediately
tail -f logs/bot.log | grep "403\|429\|BLOCKED"
```

## Expected Results (Free Setup)

### Conservative Approach (Recommended)
- **Frequency:** Twice per day (8 AM, 8 PM)
- **Pages:** 5 pages per session
- **Ads per run:** ~50 ads
- **Total per day:** ~100 new ads
- **Block risk:** Very low (~5%)
- **Sustainability:** Months without blocks

### Moderate Approach
- **Frequency:** Every 2 hours (8 times/day)
- **Pages:** 3 pages per session
- **Ads per run:** ~30 ads
- **Total per day:** ~240 new ads
- **Block risk:** Low-Medium (~15%)
- **Sustainability:** Weeks without blocks

### Aggressive Approach (Not Recommended)
- **Frequency:** Every 30 minutes
- **Pages:** 10 pages per session
- **Ads per run:** ~100 ads
- **Total per day:** ~3000 ads
- **Block risk:** High (~50%)
- **Sustainability:** Days until blocked

## When You Get Blocked

If your home IP gets blocked:

### Option 1: Wait It Out
```bash
# Stop the bot
docker-compose down

# Wait 24-48 hours
# Your IP reputation may recover

# Try again with even lower frequency
SCRAPING_INTERVAL=0 12 * * *  # Once per day at noon
```

### Option 2: Mobile Hotspot Rotation
```bash
# 1. Stop bot
# 2. Enable mobile hotspot on phone
# 3. Connect computer to phone WiFi
# 4. Restart bot (now using mobile IP)
# 5. When blocked, airplane mode to get new mobile IP
```

### Option 3: VPN Rotation (Partially Free)
Some VPNs offer free tiers or trials:
- **ProtonVPN** - Free tier (limited servers)
- **Windscribe** - 10GB/month free
- **TunnelBear** - 500MB/month free

**Warning:** VPN IPs are still not residential, success rate only marginally better than datacenter proxies.

### Option 4: Accept Limits
```bash
# Scrape once per day
# Accept you'll get ~50 ads/day instead of 3000
# It's free, and it works
```

## Long-Term Free Strategy

### Month 1: Home IP
- Scrape conservatively (twice per day)
- Build database of ads
- Monitor for blocks

### Month 2: Mobile Hotspot
- If home IP blocked, switch to mobile
- Rotate mobile IP when needed (airplane mode)
- Continue conservative scraping

### Month 3: Multiple Locations
- If you have access to multiple locations (friend's house, work, coffee shop)
- Run bot from different IPs occasionally
- Never scrape from same location too frequently

### Month 4+: Consider Proxies
- By now you have good data
- If you need more, proxies become worth it
- Start with cheapest tier (~$50/month)

## Cost-Benefit Analysis

### Free Scraping (This Strategy)
- **Cost:** $0
- **Ads per day:** 50-200
- **Effort:** Medium (monitoring, IP rotation)
- **Sustainability:** Weeks to months
- **Risk:** May need to stop/rotate IPs

### Budget Proxies ($50/month)
- **Cost:** $50/month ($600/year)
- **Ads per day:** 500-1000
- **Effort:** Low (set and forget)
- **Sustainability:** Indefinite
- **Risk:** Very low

### Premium Proxies ($300/month)
- **Cost:** $300/month ($3600/year)
- **Ads per day:** 3000+
- **Effort:** Very low
- **Sustainability:** Indefinite
- **Risk:** Minimal

## Realistic Expectations

**Truth:** Free scraping works, but with limits.

If you can get **50-100 new ads per day for free**, that's actually pretty good!

- 50 ads/day = 1500 ads/month = 18,000 ads/year
- Enough for many use cases
- Zero cost

**Ask yourself:**
- Do I really need 3000 ads/day?
- Or is 50-100 ads/day sufficient?
- Is saving $600/year worth the limitations?

## When to Give Up on Free

Upgrade to paid proxies when:

1. ✅ Home IP gets permanently blocked
2. ✅ Need more than 200 ads/day consistently
3. ✅ Can't manage IP rotation manually
4. ✅ Building a commercial product
5. ✅ Time is more valuable than $50/month

## Sample Cron Schedule (Free Strategy)

```bash
# Ultra-conservative (once per day)
SCRAPING_INTERVAL=0 10 * * *

# Conservative (twice per day)
SCRAPING_INTERVAL=0 8,20 * * *

# Moderate (every 4 hours)
SCRAPING_INTERVAL=0 */4 * * *

# Aggressive (every hour) - Not recommended without proxies
SCRAPING_INTERVAL=0 * * * *
```

## Monitoring Script

Create a simple monitoring script:

```bash
#!/bin/bash
# monitor-scraping.sh

# Check if blocked
if grep -q "403\|429\|BLOCKED" logs/bot.log; then
  echo "⚠️ BLOCKED! Stopping bot..."
  docker-compose down
  exit 1
fi

# Count ads today
TODAY=$(date +%Y-%m-%d)
ADS_TODAY=$(grep "$TODAY" logs/bot.log | grep "ads saved" | awk '{sum+=$NF} END {print sum}')

echo "✅ Ads scraped today: $ADS_TODAY"
```

## Summary

Free scraping is possible with:
1. ✅ Home or mobile IP
2. ✅ Low frequency (2-8x per day)
3. ✅ Few pages per session (3-5)
4. ✅ Patient monitoring
5. ✅ Willingness to rotate IPs manually

**Expected outcome:** 50-200 ads/day for free, for weeks/months.

**When it stops working:** Upgrade to $50/month proxies.

Good luck! 🍀
