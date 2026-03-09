# Bot Crawlee Migration Design

## Problem

The himo bot container runs Xvfb + Chromium via Playwright, consuming 800MB-1.5GB RAM. On a ~4GB VPS, this causes OOM kills and container restart loops that affect the entire stack.

## Solution

Migrate from raw Playwright to **Crawlee PlaywrightCrawler** with managed browser pool, drop Xvfb, run scrapers sequentially, and add Docker memory limits. Target: **200-350MB** bot RAM (down from 800-1500MB).

## Architecture

### Current

```
Bot Container (node:22-bullseye, ~800MB-1.5GB RAM)
├── Xvfb (virtual display)
├── Chromium instance #1 (LeBonCoin) ─┐
├── Chromium instance #2 (PAP)        ├─ parallel
└── Node.js process                   ┘
```

### New

```
Bot Container (node:22-slim, ~200-350MB RAM)
├── Crawlee PlaywrightCrawler
│   ├── Managed BrowserPool (1 instance)
│   ├── AutoscaledPool (memory-aware throttling)
│   └── Stealth fingerprinting (playwright-extra)
└── Node.js process
```

### Key Changes

- **Drop Xvfb** — Crawlee runs headless natively
- **Single managed browser** — BrowserPool reuses one browser, opens/closes pages per request
- **Sequential scraping** — LeBonCoin then PAP (not parallel), halves peak memory
- **Memory-aware auto-scaling** — AutoscaledPool monitors free RAM
- **Smaller Docker image** — node:22-slim, no X11/Xvfb packages

## Scraper Migration

### LeBonCoin Scraper

- Keep regex-based JSON extraction (`/"ads":(\[.+?\]),"ads_alu"/`)
- Keep anti-DataDome strategy (cookie persistence, human delays, 5-page max)
- Replace manual browser management with Crawlee PlaywrightCrawler
- Use `launchContext` with stealth plugin + same browser args
- Use `sessionPool` for cookie persistence (replaces manual cookie save/load)

### PAP Scraper

- Keep infinite scroll + DOM parsing approach
- Migrate scroll logic into Crawlee requestHandler
- Keep single-page behavior (max 50 ads)

### Base Scraper

Simplified — Crawlee handles retry and fetch logic:

| Current (BaseScraper)   | New (Crawlee)                           |
|-------------------------|-----------------------------------------|
| `fetchWithRetry()`      | Built-in `maxRequestRetries`            |
| `humanDelay()`          | Manual delays in requestHandler         |
| Page loop               | `RequestList` with page URLs            |
| `saveAds()`             | Keep as-is (Prisma createMany)          |
| `getLatestAdInDb()`     | Keep as-is                              |
| Error detection         | `failedRequestHandler`                  |

## Unchanged Components

- `scraping-task.ts` — orchestrator (minor: run scrapers sequentially)
- `server.ts` — HTTP endpoints
- `index.ts` — cron scheduling
- `lib/prisma.ts` — DB connection
- All types, utils, cleanup tasks
- API, Client, Commons packages

## Docker Changes

### Dockerfile.prod (bot)

- Base image: `node:22-bullseye` -> `node:22-slim`
- Remove: Xvfb, all X11 packages (~15 apt deps)
- Remove: `DISPLAY=:99`, `HEADLESS=false`
- Remove: `Xvfb :99 -screen 0 ...` startup command
- Add: `npx playwright install --with-deps chromium`

### docker-compose.prod.yml

Add memory limits to all services:

| Service  | mem_limit | shm_size |
|----------|-----------|----------|
| api      | 256m      | -        |
| client   | 128m      | -        |
| bot      | 512m      | 256m     |
| db       | 512m      | 256m     |

Total hard cap: ~1.4GB (leaves ~2.6GB for OS + Docker + buffer on 4GB VPS).

## Dependencies

```diff
+ "crawlee": "^3.x"
+ "@crawlee/playwright": "^3.x"
  "playwright": "^1.40.1"                    # kept (Crawlee wraps it)
  "playwright-extra": "^4.3.6"               # kept (stealth plugin)
  "puppeteer-extra-plugin-stealth": "^2.11.2" # kept
```

## Error Handling

- `failedRequestHandler` — catches failed requests with full context
- `maxRequestRetries` — 0 for LeBonCoin (DataDome = stop), 3 for PAP
- `sessionPool` — automatic session rotation on blocks
- BotRun DB tracking — unchanged, stays in scraping-task.ts
- DataDome detection — moved into failedRequestHandler

## RAM Budget (4GB VPS)

| Service              | Current        | New            |
|----------------------|----------------|----------------|
| PostgreSQL + PostGIS | 300-500MB      | 300-500MB      |
| API (Express)        | 100-200MB      | 100-200MB      |
| Client (Nginx)       | 30-50MB        | 30-50MB        |
| Bot                  | **800-1500MB** | **200-350MB**  |
| OS + Docker          | ~500MB         | ~500MB         |
| **Total**            | 1.7-2.7GB+     | **1.1-1.6GB**  |
