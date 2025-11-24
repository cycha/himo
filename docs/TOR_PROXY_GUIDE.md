# Using Tor as a Free Proxy (Not Recommended for DataDome)

## Overview

Tor is a free anonymity network that can be used as a proxy. However, it has significant limitations for web scraping, especially against DataDome.

## Tor Setup

### Installation

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install tor

# macOS
brew install tor

# Start Tor
tor
```

### Configuration for Bot

Add to `.env`:

```bash
PROXY_HOST=127.0.0.1
PROXY_PORT=9050
# No username/password needed for Tor
```

### Tor SOCKS5 Proxy

Tor runs on `socks5://127.0.0.1:9050` by default.

For Playwright, you need HTTP proxy, so use `polipo` or `privoxy`:

```bash
# Install privoxy (HTTP proxy for Tor)
sudo apt-get install privoxy

# Configure privoxy to use Tor
echo "forward-socks5 / 127.0.0.1:9050 ." | sudo tee -a /etc/privoxy/config

# Restart privoxy
sudo service privoxy restart

# Now use HTTP proxy
PROXY_HOST=127.0.0.1
PROXY_PORT=8118
```

## ❌ Why Tor Doesn't Work for DataDome

### 1. Exit Nodes are Known

- All Tor exit node IPs are publicly listed
- DataDome blocks them automatically
- Success rate: **~0%**

### 2. Slow Speed

- Traffic routes through 3+ relays
- Page loads take 10-30 seconds
- Scraping becomes impractical

### 3. Exit Node Consistency

- IP changes between requests
- Looks extremely suspicious to DataDome
- Session cookies don't work across IP changes

### 4. Many Sites Block Tor

- LeBonCoin likely blocks Tor exit nodes
- You'll get instant 403 errors

## ⚠️ Verdict: Don't Use Tor for LeBonCoin Scraping

Tor is excellent for anonymity, terrible for scraping protected sites.

## Better Free/Cheap Alternatives

See main document for realistic options.
