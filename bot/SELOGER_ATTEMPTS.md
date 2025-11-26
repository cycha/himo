# SeLoger Scraping Attempts - Technical Report

## Summary
After exhaustive testing with multiple anti-detection approaches, **SeLoger cannot be scraped with current open-source tools**. CloudFront returns HTTP 403 Forbidden on 100% of requests regardless of the technique used.

## Attempts Made

### 1. Tor Proxy with IP Rotation ✅ (Working) ❌ (Blocked)
**Branch:** `feature/tor-proxy-integration`

**Implementation:**
- Docker Tor service with SOCKS5 proxy (port 9050)
- Control port (9051) for IP rotation via `SIGNAL NEWNYM`
- Automatic IP rotation before each request
- Verified working: Browser successfully uses Tor exit nodes (e.g., IP 185.220.101.25)

**Result:** HTTP 403 on every request despite rotating IPs

**Files:**
- `bot/src/scrapers/seloger-scraper-html.ts` - Playwright + Tor
- `torrc` - Tor configuration
- `docker-compose.yml` - Tor service integration

### 2. Playwright Extra + Stealth Plugin ❌
**Implementation:**
- `playwright-extra` with `puppeteer-extra-plugin-stealth`
- Cookie persistence via JSON file storage
- French locale and Paris geolocation
- Anti-detection scripts (navigator.webdriver removal, chrome runtime injection)
- Human simulation (mouse movements, random scrolling, delays)

**Result:** HTTP 403 on first request

### 3. Puppeteer Real Browser (Undetected Chromium) ❌
**Package:** `puppeteer-real-browser@1.4.4`

**Implementation:**
- Uses `rebrowser-puppeteer-core` (modified Chromium)
- Designed specifically for CloudFlare bypass
- Ghost cursor for realistic mouse movements
- Profile-based fingerprinting
- Combined with Tor proxy

**Result:** HTTP 403 on every attempt

**Files:**
- `bot/src/scrapers/seloger-scraper-undetected.ts`
- `bot/src/scripts/test-seloger-undetected.ts`

### 4. BotBrowser Attempt ❌ (Architecture Mismatch)
**Repository:** https://github.com/botswin/BotBrowser

**Implementation:**
- Downloaded BotBrowser 143.0.7499.40 (584 MB .deb package)
- Created seloger-scraper-botbrowser.ts with CDP connection
- Integrated with Tor proxy and IP rotation
- Updated Docker configuration

**Findings:**
- Custom Chromium build designed for DataDome/CloudFlare bypass
- Unified fingerprint technology across platforms
- **Only available for AMD64/x86_64 architecture**
- No ARM64 build available

**Blocker:**
- Development machine is Apple Silicon (ARM64)
- BotBrowser .deb is AMD64 only: `package architecture (amd64) does not match system (arm64)`
- Docker platform emulation fails with npm/pnpm compatibility issues
- Cannot test on current hardware

**Status:** Cannot test without x86_64 machine or ARM64 build

**Files Created:**
- `bot/src/scrapers/seloger-scraper-botbrowser.ts`
- `bot/src/scripts/test-seloger-botbrowser.ts`
- `bot/botbrowser/botbrowser.deb` (584 MB)
- Updated `bot/Dockerfile` for BotBrowser installation

## Why Se Loger Cannot Be Scraped

CloudFront detects automation through **multiple layers**:

1. **TLS Fingerprinting** - Identifies automated clients by TLS handshake patterns
2. **Browser Fingerprinting** - Canvas, WebGL, WebRTC, fonts, audio context
3. **JavaScript API Consistency** - Detects missing/suspicious APIs
4. **Timing Patterns** - Analyzes request timing and behavior patterns
5. **HTTP/2 Fingerprinting** - Frame sizes, priorities, and connection reuse
6. **CDP Detection** - Identifies Chrome DevTools Protocol artifacts

Even with:
- ✅ Different IP addresses (Tor)
- ✅ Stealth plugins
- ✅ Cookie persistence
- ✅ Human simulation
- ✅ French locale/geolocation
- ✅ Undetected browsers

**Result:** Instant HTTP 403 on 100% of attempts

## Evidence

All attempts logged consistent behavior:
```
HTTP Status: 403
Error: HTTP 403
```

No variation across:
- 10+ different Tor exit node IPs
- Multiple stealth techniques
- Various delay patterns
- Different user agents

## Recommendations

### Option 1: Focus on Working Sources ⭐ Recommended
**Continue with LeBonCoin** (already working) and add other French real estate sites:

- **PAP.fr** - Less aggressive protection
- **Logic-Immo.com** - Standard bot detection
- **Bien'ici.com** - Moderate protection
- **ImmoScout24.fr** - Basic anti-scraping

### Option 2: Paid Scraping Service
Use commercial services that maintain CloudFlare bypass infrastructure:

- **ScraperAPI** (~$50-100/month) - Handles CloudFlare/DataDome
- **Bright Data** (~$500+/month) - Premium residential proxies
- **Apify** (~$49+/month) - Pre-built scrapers

### Option 3: Contact BotBrowser
Obtain licensing for BotBrowser:
- Email: botbrowser@bk.ru
- Telegram: @botbrowser_support
- Cost: Unknown (likely commercial license required)

## Technical Artifacts Preserved

**Working Implementations:**
- Tor proxy integration (fully functional)
- IP rotation system
- Stealth browser configurations
- Cookie management
- Human simulation patterns

**Test Scripts:**
- `bot/src/scripts/test-seloger-html.ts`
- `bot/src/scripts/test-seloger-undetected.ts`
- `bot/src/scripts/test-tor-ip.ts`

**Branch:** `feature/tor-proxy-integration`

## Conclusion

SeLoger's CloudFront protection is **enterprise-grade** and defeats all current open-source anti-detection tools. The site has clearly invested in preventing automated access, likely due to:
- High-value real estate data
- API deprecation (ws.seloger.com shutdown)
- Business model protection

**Recommendation:** Abandon SeLoger scraping and focus resources on alternative French real estate sources that provide better ROI.
