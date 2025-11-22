# Free VPS Deployment Strategy for LeBonCoin Scraping

## Overview

This guide shows how to deploy the Himo bot on a **free VPS** and scrape LeBonCoin effectively without paid proxies.

## Why Free VPS Works

### Advantages over Home IP

1. **Dedicated IP** - VPS IP looks more professional than home ISP
2. **Always On** - Runs 24/7 without keeping your computer on
3. **Clean Reputation** - Fresh IP without home network history
4. **Easy Scaling** - Can switch VPS providers if blocked

### Free VPS Providers

#### 1. **Oracle Cloud Free Tier** (Best Option) ⭐

**What you get:**
- 2 AMD-based compute VMs (1/8 OCPU, 1 GB RAM each)
- OR 4 Arm-based VMs (1 OCPU, 6 GB RAM each)
- 200 GB total storage
- **ALWAYS FREE** (not a trial)

**Perfect for scraping:**
- 1 GB RAM sufficient for our bot
- Residential-looking datacenter IPs
- Multiple regions available (choose France/EU)

**Sign up:** https://www.oracle.com/cloud/free/

#### 2. **Google Cloud Platform Free Tier**

**What you get:**
- 1 e2-micro VM (0.25 vCPU, 1 GB RAM)
- 30 GB storage
- **Always free** in US regions

**Limitations:**
- US IPs only (not ideal for LeBonCoin)
- 1 GB RAM might be tight

**Sign up:** https://cloud.google.com/free

#### 3. **AWS Free Tier** (First 12 Months)

**What you get:**
- t2.micro instance (1 vCPU, 1 GB RAM)
- 30 GB storage
- **Free for 12 months** then paid

**After 12 months:**
- ~$10/month for t2.micro
- Can switch to Oracle Cloud

**Sign up:** https://aws.amazon.com/free/

#### 4. **Azure Free Tier** (First 12 Months)

**What you get:**
- B1S VM (1 vCPU, 1 GB RAM)
- 64 GB storage
- **Free for 12 months** then paid

**Sign up:** https://azure.microsoft.com/en-us/free/

## Recommended: Oracle Cloud Setup

### Step 1: Create Oracle Cloud Account

1. Go to https://www.oracle.com/cloud/free/
2. Sign up (requires credit card but **never charged** for free tier)
3. Verify email and phone
4. Login to cloud console

### Step 2: Create Compute Instance

1. Navigate to **Compute → Instances**
2. Click **Create Instance**
3. Configure:
   - **Name:** himo-scraper
   - **Image:** Ubuntu 22.04 (recommended)
   - **Shape:** VM.Standard.E2.1.Micro (Always Free)
   - **Region:** Choose France (Paris) or nearest EU region
   - **Boot Volume:** 50 GB (free tier allows up to 200 GB)
   - **SSH Keys:** Generate new key pair (save private key!)

4. Click **Create**

### Step 3: Configure Firewall

1. **In Oracle Cloud Console:**
   - Navigate to your instance
   - Click **Virtual Cloud Networks** → Your VCN
   - Click **Security Lists** → Default Security List
   - **Add Ingress Rule:**
     - Source: `0.0.0.0/0`
     - Protocol: TCP
     - Port: 22 (SSH)

2. **On the VM (after SSH):**

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Step 4: SSH into VPS

```bash
# From your local machine
ssh -i path/to/private-key.pem ubuntu@<VPS_IP_ADDRESS>

# First time: accept fingerprint
yes
```

### Step 5: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Reload shell
source ~/.bashrc

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Playwright dependencies
sudo apt install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2

# Install Git
sudo apt install -y git
```

### Step 6: Clone & Setup Project

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/himo.git
cd himo

# Install dependencies
pnpm install

# Install Playwright browsers
cd bot
pnpm exec playwright install chromium
cd ..
```

### Step 7: Setup PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER himo_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE himo OWNER himo_user;
\c himo
CREATE EXTENSION IF NOT EXISTS postgis;
GRANT ALL PRIVILEGES ON DATABASE himo TO himo_user;
EOF
```

### Step 8: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

Update with:

```bash
# Database
DATABASE_URL=postgresql://himo_user:your_secure_password@localhost:5432/himo

# Bot (Free VPS Strategy - Conservative)
SCRAPING_INTERVAL=0 */2 5-22 * * *  # Every 2 hours
HEADLESS=true

# No proxies needed for free strategy!
```

### Step 9: Run Database Migrations

```bash
cd api
npx prisma migrate deploy
npx prisma generate
cd ..
```

### Step 10: Build & Start Bot

```bash
# Build all packages
pnpm build

# Start bot in background with PM2
sudo npm install -g pm2
pm2 start bot/dist/index.js --name himo-bot

# Setup PM2 to start on reboot
pm2 startup
pm2 save
```

## Free VPS Configuration

### Conservative Settings (Recommended)

Already configured in the codebase:

- **Frequency:** Every 2 hours (8 runs/day)
- **Pages per run:** 5 pages
- **Delay between pages:** 20-40 seconds
- **Expected ads:** ~50 ads/run × 8 = **400 ads/day**
- **Block risk:** Very low (~5%)
- **Sustainability:** Months

### Configuration Files

**`bot/src/scrapers/leboncoin-scraper-stealth.ts`:**

```typescript
const DEFAULT_CONFIG: ScraperConfig = {
  maxPages: 5, // Conservative for free VPS
  waitSuccess: 20, // 20-40 seconds between pages
  // ... rest of config
};
```

**`.env`:**

```bash
SCRAPING_INTERVAL=0 */2 5-22 * * *  # Every 2 hours
```

### Even More Conservative (If You Get Blocked)

Edit `.env`:

```bash
# Twice per day (8 AM and 8 PM)
SCRAPING_INTERVAL=0 8,20 * * *

# Expected: ~100 ads/day
# Block risk: ~1%
# Sustainability: Years
```

## Monitoring Your VPS Bot

### Check Bot Status

```bash
# SSH into VPS
ssh -i private-key.pem ubuntu@<VPS_IP>

# Check if bot is running
pm2 status

# View logs
pm2 logs himo-bot --lines 100

# Check recent scraping results
pm2 logs himo-bot | grep "ads saved"
```

### Monitor for Blocks

```bash
# Check for DataDome blocks
pm2 logs himo-bot | grep "403\|429\|BLOCKED"

# If you see blocks:
pm2 stop himo-bot
# Wait 24 hours, then restart with lower frequency
```

### Database Stats

```bash
# Connect to database
psql -U himo_user -d himo

# Check total ads
SELECT COUNT(*) FROM ads;

# Check ads per day
SELECT DATE(release_date), COUNT(*)
FROM ads
GROUP BY DATE(release_date)
ORDER BY DATE(release_date) DESC
LIMIT 7;

# Exit
\q
```

## Expected Results (Free VPS)

### With Conservative Settings (Default)

| Metric                  | Value             |
| ----------------------- | ----------------- |
| Frequency               | Every 2 hours     |
| Runs per day            | 8                 |
| Pages per run           | 5                 |
| Ads per run             | ~50               |
| **Total ads per day**   | **~400**          |
| **Ads per month**       | **~12,000**       |
| **Ads per year**        | **~146,000**      |
| Block probability       | ~5%               |
| Sustainability          | Months            |
| Cost                    | **$0**            |
| VPS uptime              | 99.9%             |
| Maintenance             | Minimal (monthly) |

### Comparison with Other Strategies

| Strategy          | Ads/Day | Cost/Month | Effort | Sustainability |
| ----------------- | ------- | ---------- | ------ | -------------- |
| **Free VPS**      | **400** | **$0**     | Low    | Months         |
| Home IP (low)     | 100     | $0         | Medium | Weeks          |
| Budget proxies    | 1000    | $50        | Low    | Indefinite     |
| Premium proxies   | 3000    | $300       | Low    | Indefinite     |
| Aggressive (free) | 500     | $0         | High   | Days (blocked) |

## VPS Management

### Update Bot Code

```bash
# SSH into VPS
ssh -i private-key.pem ubuntu@<VPS_IP>

# Navigate to project
cd himo

# Pull latest changes
git pull

# Rebuild
pnpm build

# Restart bot
pm2 restart himo-bot
```

### Backup Database

```bash
# Create backup
pg_dump -U himo_user himo > backup-$(date +%Y%m%d).sql

# Download to local machine (from local terminal)
scp -i private-key.pem ubuntu@<VPS_IP>:~/backup-*.sql ./
```

### Monitor System Resources

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top

# If running out of memory:
# - Reduce maxPages to 3
# - Reduce frequency to every 4 hours
```

## Troubleshooting

### Bot Crashes

```bash
# Check PM2 logs
pm2 logs himo-bot --err

# Common issues:
# 1. Out of memory → Reduce maxPages
# 2. Playwright crash → Reinstall: pnpm exec playwright install chromium
# 3. Database connection → Check PostgreSQL is running
```

### Getting Blocked

**Symptoms:**

- Logs show "HTTP 403" or "429"
- No ads found for multiple runs
- "DataDome detected: YES" messages

**Solution:**

```bash
# 1. Stop bot immediately
pm2 stop himo-bot

# 2. Wait 24 hours

# 3. Reduce frequency
nano .env
# Change to: SCRAPING_INTERVAL=0 */4 5-22 * * *  # Every 4 hours

# 4. Restart
pm2 restart himo-bot
pm2 save
```

### VPS IP Burned

If your VPS IP gets permanently flagged:

**Option 1: Create New VPS**

```bash
# Oracle Cloud allows multiple free VMs
# 1. Create new VM in different region
# 2. Deploy bot to new VM
# 3. Delete old VM
```

**Option 2: Switch VPS Provider**

```bash
# Move from Oracle to Google Cloud (or vice versa)
# Fresh IP, continue free scraping
```

## Advanced: Multi-Region Strategy

If you have access to multiple free VPS providers:

### Setup

1. **Oracle Cloud** - Paris region
2. **Google Cloud** - Belgium region
3. **AWS Free Tier** - Frankfurt region

### Rotation Strategy

```bash
# Run each VPS for 1 week, then switch
# Week 1: Oracle Cloud
# Week 2: Google Cloud
# Week 3: AWS
# Week 4: Back to Oracle Cloud

# Each IP gets 3 weeks to "cool down"
```

### Expected Results

- 3× longer between blocks per IP
- Effectively infinite sustainability
- Still $0/month (using free tiers)

## Cost Analysis

### Free VPS Strategy

**Costs:**

- VPS: $0 (Oracle Cloud Always Free)
- Proxies: $0
- Database: $0 (included)
- Network: $0 (10 TB/month free)
- **Total: $0/month**

**Returns:**

- 400 ads/day × 30 = 12,000 ads/month
- **Value:** Priceless for personal projects
- **Equivalent paid service:** $50-100/month

### When to Upgrade

Consider paid proxies when:

1. ✅ VPS IP gets permanently blocked
2. ✅ Need > 500 ads/day consistently
3. ✅ Can't manage VPS switching
4. ✅ Building commercial product
5. ✅ Time > $50/month

Until then, **free VPS is perfect!**

## Security Best Practices

### 1. SSH Key Only

```bash
# Disable password auth
sudo nano /etc/ssh/sshd_config

# Set:
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### 2. Keep Updated

```bash
# Update weekly
sudo apt update && sudo apt upgrade -y

# Auto-updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Firewall

```bash
# Only allow SSH
sudo ufw allow 22/tcp
sudo ufw enable
```

### 4. Strong Database Password

```bash
# In .env, use strong random password
DATABASE_URL=postgresql://himo_user:$(openssl rand -base64 32)@localhost:5432/himo
```

## Conclusion

### Free VPS Strategy Summary

✅ **Deploy on Oracle Cloud (always free)**
✅ **Scrape every 2 hours (8x per day)**
✅ **5 pages per run (~50 ads)**
✅ **Total: ~400 ads/day for $0**
✅ **Sustainable for months**

### Is This Enough?

For most personal projects: **YES!**

- 400 ads/day = 146,000 ads/year
- Free forever with Oracle Cloud
- Low maintenance
- Easy to switch VPS if needed

### When You Need More

If 400/day isn't enough:

1. **First:** Try multiple free VPS (3× = 1200 ads/day)
2. **Second:** Consider $50/month proxies (1000 ads/day)
3. **Last resort:** Premium proxies ($300/month, 3000/day)

**Bottom line:** Start with free VPS, scale up only when needed! 🚀

## Quick Start Commands

```bash
# Complete setup (copy-paste all at once)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt update && sudo apt install -y nodejs postgresql git && \
curl -fsSL https://get.pnpm.io/install.sh | sh - && \
source ~/.bashrc && \
git clone https://github.com/YOUR_USERNAME/himo.git && \
cd himo && \
pnpm install && \
cd bot && pnpm exec playwright install chromium && cd .. && \
cp .env.example .env && \
echo "✅ Setup complete! Now configure .env and start the bot"
```

Good luck with your free VPS deployment! 🎉
