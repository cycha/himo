# Deploy to Your RackNerd VPS 🚀

## Perfect! You Already Have a VPS

RackNerd is an excellent budget VPS provider. Your existing VPS is **perfect** for running the bot!

## Quick Deployment (15 Minutes)

### Step 1: Connect to Your RackNerd VPS

```bash
# SSH into your VPS
ssh root@YOUR_RACKNERD_IP

# Or if you have a specific user:
ssh your_username@YOUR_RACKNERD_IP
```

### Step 2: One-Line Setup

```bash
# Update system and install everything
sudo apt update && sudo apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs postgresql postgresql-contrib git && \
curl -fsSL https://get.pnpm.io/install.sh | sh - && \
source ~/.bashrc && \
sudo apt install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

### Step 3: Clone & Install Project

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/himo.git
cd himo

# Install all dependencies
pnpm install

# Install Playwright browsers
cd bot
pnpm exec playwright install chromium
cd ..
```

### Step 4: Setup PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<'EOF'
CREATE USER himo_user WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE himo OWNER himo_user;
\c himo
CREATE EXTENSION IF NOT EXISTS postgis;
GRANT ALL PRIVILEGES ON DATABASE himo TO himo_user;
\q
EOF
```

### Step 5: Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit configuration
nano .env
```

**Update `.env` with:**

```bash
# Database (change password!)
DATABASE_URL=postgresql://himo_user:your_secure_password_here@localhost:5432/himo

# Already configured for free scraping:
SCRAPING_INTERVAL=0 */2 5-22 * * *  # Every 2 hours
HEADLESS=true

# Bot will use your RackNerd IP (no proxy needed initially)
```

**Press:** `Ctrl+O` to save, `Enter`, then `Ctrl+X` to exit

### Step 6: Run Database Migrations

```bash
# Navigate to API directory
cd api

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Go back to root
cd ..
```

### Step 7: Build Project

```bash
# Build all packages
pnpm build
```

### Step 8: Start Bot with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the bot
pm2 start bot/dist/index.js --name himo-bot

# Configure PM2 to start on system reboot
pm2 startup

# Copy and run the command PM2 outputs (something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your_user --hp /home/your_user

# Save PM2 configuration
pm2 save

# Check bot status
pm2 status
```

## ✅ Done! Bot is Running

Your bot will now scrape **~400 ads per day** automatically!

## Monitor Your Bot

### Check Status

```bash
# Check if bot is running
pm2 status

# View live logs
pm2 logs himo-bot

# View last 50 lines
pm2 logs himo-bot --lines 50

# Filter for successes
pm2 logs himo-bot | grep "ads saved"

# Filter for blocks (should be none!)
pm2 logs himo-bot | grep "403\|429\|BLOCKED"
```

### Expected Success Logs

```
🥷 Initializing ULTRA-STEALTH browser...
✅ Ultra-stealth browser initialized
🏠 Visiting homepage first (human behavior)...
🍪 Looking for cookie consent banner...
✅ Cookie consent accepted
✅ Homepage visit complete
📄 Fetching: https://www.leboncoin.fr/recherche?category=9
   HTTP Status: 200
   Title: Vente immobilier | leboncoin...
✅ Ad containers detected
✅ Found 48 raw ads
✅ 48 ads saved successfully
💾 Saved 15 cookies for next session
🔒 Browser closed
```

### Check Database

```bash
# Connect to database
psql -U himo_user -d himo

# Check total ads
SELECT COUNT(*) FROM ads;

# Check ads scraped today
SELECT COUNT(*) FROM ads WHERE DATE(release_date) = CURRENT_DATE;

# View recent ads
SELECT title, price, city, release_date
FROM ads
ORDER BY release_date DESC
LIMIT 10;

# Exit
\q
```

## RackNerd-Specific Tips

### Check Your VPS Resources

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top
# Press 'q' to quit
```

### Typical RackNerd Plans

| Plan     | RAM    | Disk  | CPU     | Price  | Himo Bot?  |
| -------- | ------ | ----- | ------- | ------ | ---------- |
| Basic    | 512 MB | 10 GB | 1 Core  | $10/yr | ⚠️ Tight   |
| Standard | 1 GB   | 20 GB | 1 Core  | $15/yr | ✅ Perfect |
| Plus     | 2 GB   | 35 GB | 2 Cores | $25/yr | ✅ Great   |

**Minimum recommended:** 1 GB RAM

### If You Have 512 MB RAM

If your RackNerd plan has only 512 MB RAM, optimize:

```bash
# Edit scraper config
nano ~/himo/bot/src/scrapers/leboncoin-scraper-stealth.ts

# Change maxPages from 5 to 3
# Line 16: maxPages: 3,

# Save and rebuild
cd ~/himo
pnpm build
pm2 restart himo-bot
```

### Add Swap Space (If Low Memory)

```bash
# Create 1 GB swap file
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

## Update Bot Code

When you make changes to the code:

```bash
# SSH into RackNerd VPS
ssh root@YOUR_RACKNERD_IP

# Navigate to project
cd ~/himo

# Pull latest changes
git pull origin main

# Rebuild
pnpm build

# Restart bot
pm2 restart himo-bot

# Check logs
pm2 logs himo-bot --lines 20
```

## Expected Results

### With Your RackNerd VPS

| Metric            | Value             |
| ----------------- | ----------------- |
| Runs per day      | 8 (every 2 hours) |
| Pages per run     | 5                 |
| Ads per run       | ~50               |
| **Ads per day**   | **~400**          |
| **Ads per month** | **~12,000**       |
| Block probability | ~5%               |
| Sustainability    | Months            |

### RackNerd IP Advantage

RackNerd IPs are often clean (not flagged) because:

- Less commonly used than major cloud providers
- Good IP reputation in their datacenters
- Not as heavily associated with bots

**Translation:** You might have **better success** than AWS/Google Cloud! ✅

## What If You Get Blocked?

Very unlikely with conservative settings, but if it happens:

### Option 1: Reduce Frequency

```bash
# Edit .env
nano ~/himo/.env

# Change to every 4 hours:
SCRAPING_INTERVAL=0 */4 5-22 * * *

# Or twice per day (safest):
SCRAPING_INTERVAL=0 8,20 * * *

# Save and restart
pm2 restart himo-bot
```

### Option 2: Add Proxies

If your RackNerd IP gets flagged:

```bash
# Edit .env
nano ~/himo/.env

# Add proxy config:
PROXY_HOST=proxy.provider.com
PROXY_PORT=8080
PROXY_USERNAME=your_username
PROXY_PASSWORD=your_password

# Save and restart
pm2 restart himo-bot
```

See `docs/DATADOME_BYPASS.md` for proxy provider recommendations.

### Option 3: New RackNerd IP

RackNerd allows you to:

1. Create new VPS instance (different IP)
2. Migrate to new server
3. Request IP change (contact support)

## Backup Your Data

### Automated Backup Script

```bash
# Create backup script
cat > ~/backup-himo.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/himo-backups

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U himo_user himo > $BACKUP_DIR/himo-$DATE.sql

# Backup cookies
cp -r ~/himo/.scraper-storage $BACKUP_DIR/.scraper-storage-$DATE

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t himo-*.sql | tail -n +8 | xargs rm -f

echo "Backup completed: himo-$DATE.sql"
EOF

# Make executable
chmod +x ~/backup-himo.sh

# Run backup
~/backup-himo.sh

# Schedule daily backups (3 AM)
crontab -e
# Add this line:
# 0 3 * * * /root/backup-himo.sh
```

### Download Backup to Local Machine

```bash
# From your local computer:
scp root@YOUR_RACKNERD_IP:~/himo-backups/himo-*.sql ./
```

## Security

### Firewall Setup

```bash
# Install UFW (if not installed)
sudo apt install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Update SSH Port (Optional but Recommended)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change line:
# Port 22
# To:
Port 2222

# Also set:
PermitRootLogin no
PasswordAuthentication no

# Save and restart SSH
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp

# Now connect with:
# ssh -p 2222 user@YOUR_RACKNERD_IP
```

### Auto-Updates

```bash
# Install unattended upgrades
sudo apt install unattended-upgrades

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades

# Select "Yes"
```

## Performance Optimization

### Check Bot Memory Usage

```bash
# While bot is running
pm2 monit

# Look at memory column for himo-bot
# Should be < 300 MB
```

### If Memory is High

```bash
# Reduce maxPages
nano ~/himo/bot/src/scrapers/leboncoin-scraper-stealth.ts
# Change maxPages to 3

# Rebuild
cd ~/himo && pnpm build && pm2 restart himo-bot
```

## Troubleshooting

### Bot Won't Start

```bash
# Check PM2 errors
pm2 logs himo-bot --err

# Common issues:
# 1. Database not running
sudo systemctl status postgresql
sudo systemctl start postgresql

# 2. Build failed
cd ~/himo && pnpm build

# 3. Node version wrong
node --version  # Should be v20.x
```

### Playwright Crashes

```bash
# Reinstall Playwright
cd ~/himo/bot
pnpm exec playwright install chromium --with-deps

# Restart bot
pm2 restart himo-bot
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up
sudo apt autoremove
sudo apt autoclean

# Delete old logs
pm2 flush

# Delete node_modules and reinstall
cd ~/himo
rm -rf node_modules
pnpm install
pnpm build
pm2 restart himo-bot
```

## Cost Analysis

### RackNerd vs Other Options

| Option           | Cost/Year  | Ads/Day | Maintenance  |
| ---------------- | ---------- | ------- | ------------ |
| **RackNerd VPS** | **$15-25** | **400** | **Very Low** |
| Oracle Free Tier | $0         | 400     | Low          |
| AWS t2.micro     | $120       | 400     | Low          |
| Budget Proxies   | $600       | 1000    | Very Low     |
| Premium Proxies  | $3600      | 3000    | Very Low     |

**Your RackNerd VPS:** Best value! ✅

- Already paid for
- Great performance
- Clean IP reputation
- 400 ads/day included

## Summary

✅ **RackNerd VPS is perfect for this!**

**What you get:**

- 400 ads/day for free (already paying for VPS)
- Clean IP (good reputation)
- 24/7 automated scraping
- Low maintenance
- Months of sustainability

**Setup time:** 15 minutes
**Monthly cost:** Already covered by your RackNerd plan!
**Result:** ~12,000 ads/month with your existing infrastructure

## Quick Commands Reference

```bash
# Start bot
pm2 start bot/dist/index.js --name himo-bot

# Stop bot
pm2 stop himo-bot

# Restart bot
pm2 restart himo-bot

# View logs
pm2 logs himo-bot

# View status
pm2 status

# Update code
cd ~/himo && git pull && pnpm build && pm2 restart himo-bot

# Check database
psql -U himo_user -d himo -c "SELECT COUNT(*) FROM ads;"

# Backup
~/backup-himo.sh
```

## Next Steps

1. ✅ Follow the deployment steps above
2. ✅ Monitor logs for first few runs
3. ✅ Check database after 24 hours
4. ✅ Set up daily backups
5. ✅ Enjoy 400 free ads/day!

**Your RackNerd VPS is ready to become a scraping machine! 🚀**

---

**Questions?**

- Check logs: `pm2 logs himo-bot`
- Read troubleshooting section above
- Review docs/VPS_FREE_STRATEGY.md for details
