# Manual Deployment Guide

Deploy to VPS from your local machine (alternative to GitHub Actions).

This script replicates exactly what the GitHub Actions CD workflow does.

## Prerequisites

### On Your Local Machine
- Docker installed
- SSH access to VPS
- GitHub Personal Access Token

### On Your VPS
- Docker installed
- User with docker permissions

## VPS Setup (One-time)

### 1. Prepare VPS

```bash
# SSH to your VPS
ssh deploy@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker deploy

# Create deployment directory
mkdir -p ~/himo
```

### 2. Create GitHub Token

- Visit: https://github.com/settings/tokens
- Create token with scope: `write:packages`
- Copy the token

### 3. Setup SSH Key

The script uses SSH private key authentication (like GitHub Actions).

**Option A: Use existing SSH key**
```bash
# If you already have ~/.ssh/id_rsa, you're good to go
# Just set it in .env.deploy:
export VPS_SSH_PRIVATE_KEY="$HOME/.ssh/id_rsa"
```

**Option B: Create new SSH key**
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/himo_deploy_key

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/himo_deploy_key.pub root@your-vps-ip

# Use in .env.deploy:
export VPS_SSH_PRIVATE_KEY="$HOME/.ssh/himo_deploy_key"
```

**Option C: Use IntelliJ's SSH connection**

If IntelliJ already has SSH access to your VPS:

1. Find which SSH key IntelliJ uses:
   - **Settings** → **Tools** → **SSH Configurations**
   - Note the private key file path

2. Set that path in `.env.deploy`:
   ```bash
   export VPS_SSH_PRIVATE_KEY="/path/from/intellij/settings"
   ```

**Troubleshooting SSH Access:**

If you get "Permission denied" or password prompts:

1. Authorize your public key on VPS (requires VPS access first):
   ```bash
   # Copy your public key
   cat ~/.ssh/id_rsa.pub

   # SSH to VPS (using password or web console)
   ssh root@your-vps-ip

   # Add public key to authorized_keys
   mkdir -p ~/.ssh
   echo "your-public-key-here" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

2. Or use VPS web console to add your key to `/root/.ssh/authorized_keys`

### 4. Configure Production Environment

Create a local `.env.production` file (copy from `.env.production.example`):

```bash
cp .env.production.example .env.production
```

**Update with production values:**
- `DB_PASSWORD` → Secure password (e.g., `openssl rand -base64 24`)
- `JWT_SECRET` → Random 32 chars (e.g., `openssl rand -base64 32`)
- `VITE_API_URL` → Your VPS address (e.g., `http://107.172.75.235:3000`)
- `GITHUB_TOKEN` → Your GitHub token (for pulling images on VPS)

This file is git-ignored and will be copied to VPS as `.env` during deployment.

## Deploy from Your Computer

### Setup Environment (One-time)

Create a `.env.deploy` file (copy from `.env.deploy.example`):

```bash
export VPS_HOST="107.172.75.235"
export VPS_USER="root"
export VPS_SSH_PRIVATE_KEY="$HOME/.ssh/id_rsa"  # or your SSH key path
export GITHUB_TOKEN="your_github_token"
```

### Deploy

Open IntelliJ Terminal (Alt+F12) and run:

```bash
# Load environment
source .env.deploy

# Login to registry (first time only)
echo $GITHUB_TOKEN | docker login ghcr.io -u cycha --password-stdin

# Deploy
./scripts/deploy-manual.sh
```

## What It Does

The manual deployment:
1. Builds Docker images locally
2. Pushes to GitHub Container Registry (`ghcr.io/cycha/himo-*`)
3. Copies `docker-compose.prod.yml` to VPS
4. Pulls latest images on VPS
5. Restarts containers
6. Runs database migrations

**Same as GitHub Actions** - just triggered manually!

## Troubleshooting

**"Cannot connect to VPS"**
- Check VPS_HOST is correct
- Verify SSH access: `ssh deploy@your-vps-ip`

**"Login failed"**
- Check GITHUB_TOKEN is valid
- Ensure token has `write:packages` scope

**"Permission denied"**
- Ensure Docker is installed on VPS
- Check user has docker group access: `docker ps`

## What the Script Does

The deployment process matches GitHub Actions CD workflow exactly:

1. **Build images** (using production Dockerfiles)
   - `api/Dockerfile.prod` → `ghcr.io/cycha/himo-api:latest`
   - `client/Dockerfile.prod` → `ghcr.io/cycha/himo-client:latest`
   - `bot/Dockerfile.prod` → `ghcr.io/cycha/himo-bot:latest`

2. **Push to GitHub Container Registry**
   - All three images pushed to GHCR

3. **Copy files to VPS**
   - `docker-compose.prod.yml` → `/home/deploy/himo/`
   - `.env.example` → `/home/deploy/himo/`

4. **Deploy on VPS**
   - Login to GHCR
   - Pull latest images
   - Restart containers
   - Run database migrations

## Files Reference

**Local files (your machine):**
- `.env.deploy` - Deployment credentials (VPS_HOST, SSH key, GitHub token for script) - git-ignored
- `.env.deploy.example` - Template for .env.deploy
- `.env.production` - Production app config (DB password, JWT secret, etc.) - git-ignored, copied to VPS
- `.env.production.example` - Template for .env.production
- `scripts/deploy-manual.sh` - Manual deployment script

**VPS files:**
- `.env` - Production app configuration (copied from your local `.env.production`)
- `docker-compose.prod.yml` - Production Docker Compose config

**Documentation:**
- `docs/MANUAL_DEPLOYMENT.md` - This guide

**Two separate .env files:**
1. `.env.deploy` (local only) - For the deployment script itself (VPS connection info)
2. `.env.production` (local, copied to VPS) - For your application (database, API keys, etc.)