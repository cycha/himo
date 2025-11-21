# Bot Testing Guide

## 🧪 Test Scraper Without Calling LeBonCoin

To avoid hitting DataDome protection while developing, use the mock test system.

### Quick Start

```bash
# Test with mock data (no network calls)
npm run test:mock

# Test with real LeBonCoin (use sparingly - may trigger DataDome)
npm run test:scraper
```

## 📊 Mock Test System

The mock test system allows you to test:

- ✅ HTML parsing logic
- ✅ Data transformation
- ✅ Prisma validation
- ✅ Database insertion
- ❌ No network calls (won't trigger DataDome)

### Files

- **`mock-leboncoin-data.ts`** - Contains realistic mock ad data
- **`scraper-mock.test.ts`** - Test runner that uses mock data
- **`scraper.test.ts`** - Real scraper test (network calls)

### How It Works

```typescript
// 1. Mock data simulates real LeBonCoin ads
export const mockLeBonCoinAds = [
  {
    subject: 'Appartement T3 - 65m²',
    price: 285000,
    location: { city: 'Paris', zipcode: '75013' },
    // ... full ad structure
  },
];

// 2. Generate HTML page with embedded JSON
const html = generateMockLeBonCoinHTML(mockLeBonCoinAds);

// 3. Scraper parses HTML as if from real LeBonCoin
const scraper = new MockLeBonCoinScraper(mockLeBonCoinAds);
const results = await scraper.scrape();
```

## 🐛 Debugging Prisma Validation Errors

If you encounter Prisma validation errors:

### 1. Run Mock Test

```bash
npm run test:mock
```

### 2. Check Error Details

The test will show detailed validation errors:

```
🔍 PRISMA VALIDATION ERROR DETAILS:
{
  "message": "Invalid value for field 'realEstateType'...",
  "field": "realEstateType",
  "value": "Appartement"
}
```

### 3. Fix Transformation Logic

Edit `bot/src/scrapers/leboncoin-scraper-stealth.ts`:

```typescript
private transformRawAd(rawAd: RawAdData, releaseDate: Date) {
  // Add validation/transformation here
}
```

### 4. Re-run Test

```bash
npm run test:mock
```

## 📋 Common Validation Issues

### Issue: Title too long

**Error:** `Value too long for column 'title' (max 200)`  
**Fix:** Title is now automatically truncated to 200 characters

### Issue: Invalid enum value

**Error:** `Invalid value for realEstateType: 'Apartment'`  
**Fix:** Type mapping now handles both French and English labels

### Issue: Invalid number

**Error:** `Expected Int, got String`  
**Fix:** Price parsing now handles both string and number formats

### Issue: Missing required field

**Error:** `Field 'zipcode' is required`  
**Fix:** Defaults to 'unknown' if missing

## 🎯 Adding New Test Data

Edit `mock-leboncoin-data.ts`:

```typescript
export const mockLeBonCoinAds = [
  // Add your test case here
  {
    subject: 'Your test ad title',
    price: 150000,
    // ... copy structure from existing ads
  },
];
```

## 🚀 Production Testing

Before deploying:

1. ✅ Run mock tests: `npm run test:mock`
2. ✅ Verify all Prisma validations pass
3. ⚠️ Run ONE real test: `npm run test:scraper` (carefully!)
4. ✅ Check database has correct data
5. 🚀 Deploy with confidence

## ⏱️ Scraping Schedule

**Current:** Every 6 hours (4 times/day)  
**Why:** Avoid DataDome detection

To change:

```bash
# Edit docker-compose.yml
SCRAPING_INTERVAL: "0 0 */6 * * *"  # Every 6 hours
```

## 📊 Expected Results

### Mock Test

```
✅ TEST RESULTS:
   - Pages scraped: 1
   - Ads saved: 5
   - Failure rate: 0%
   - Duration: 0.5s
```

### Real Test (when it works)

```
✅ TEST RESULTS:
   - Pages scraped: 2
   - Ads saved: 70
   - Failure rate: 0%
   - Duration: 45.2s
```

### Real Test (DataDome blocks)

```
❌ HTTP 403 - Anti-bot protection detected
🚫 DataDome anti-bot detected!
💡 Suggestion: Wait 6-12 hours before next attempt
```

## 💡 Best Practices

1. **Use mock tests** for development and debugging
2. **Test transformations** with various ad types
3. **Validate Prisma schema** matches ad structure
4. **Limit real tests** to avoid DataDome blocks
5. **Wait 6+ hours** between real scraping attempts

## 🔧 Troubleshooting

### Test fails with "Cannot connect to database"

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
cd api && npx prisma migrate deploy
```

### Mock data doesn't match real ads

```bash
# Update mock-leboncoin-data.ts with real ad structure
# Check failed-scrape.html for actual HTML structure
```

### Prisma client not found

```bash
# Generate Prisma client
npm run prisma:generate
```
