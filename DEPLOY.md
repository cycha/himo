# Deploy Bot to RackNerd VPS (15 min)

## 1. Install Dependencies

```bash
ssh root@YOUR_RACKNERD_IP

# Install everything
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && \
sudo apt install -y nodejs postgresql git && \
curl -fsSL https://get.pnpm.io/install.sh | sh - && \
source ~/.bashrc && \
sudo apt install -y libnss3 libatk1.0-0 libcups2 libdrm2 libgbm1
```

## 2. Setup Project

```bash
# Clone & install
git clone https://github.com/YOUR_USERNAME/himo.git && cd himo
pnpm install
cd bot && pnpm exec playwright install chromium && cd ..

# Setup database
sudo systemctl start postgresql && sudo systemctl enable postgresql
sudo -u postgres psql <<'EOF'
CREATE USER himo_user WITH PASSWORD 'change_me';
CREATE DATABASE himo OWNER himo_user;
\c himo
CREATE EXTENSION postgis;
EOF

# Configure
cp .env.example .env
nano .env  # Update DATABASE_URL password

# Migrate & build
cd api && npx prisma migrate deploy && npx prisma generate && cd ..
pnpm build
```

## 3. Start Bot

```bash
sudo npm install -g pm2
pm2 start bot/dist/index.js --name himo-bot
pm2 startup && pm2 save
pm2 logs himo-bot
```

## Expected Results

- **Runs:** Every 2 hours (8× per day)
- **Ads per day:** ~400
- **Cost:** $0 (using your existing VPS)

## Monitor

```bash
pm2 logs himo-bot              # View logs
pm2 logs himo-bot | grep "ads saved"  # Check successes
pm2 status                     # Check status
```

## Update

```bash
cd ~/himo && git pull && pnpm build && pm2 restart himo-bot
```

Done! Bot scrapes 400 ads/day automatically. 🚀
