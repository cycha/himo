# Environment Configuration

This document explains the environment variables used in the Himo application.

## Overview

Himo uses three separate environment files for different purposes:

| File | Purpose | Committed to Git | Used For |
|------|---------|------------------|----------|
| `.env.example` | Local development template | ✅ Yes | Copy to `.env` for local dev |
| `.env.production.example` | Production template | ✅ Yes | Copy to `.env.production` |
| `.env.deploy.example` | Deployment credentials template | ✅ Yes | Copy to `.env.deploy` |
| `.env` | Local development config | ❌ No (git-ignored) | Running app locally |
| `.env.production` | Production config | ❌ No (git-ignored) | Deployed to VPS |
| `.env.deploy` | Deployment credentials | ❌ No (git-ignored) | Manual deployment script |

## Local Development Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

3. **The defaults work out of the box** for local development

## Production Deployment Setup

1. **Copy the example file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Update production values:**
   ```bash
   # Generate secure database password
   openssl rand -base64 24

   # Generate secure JWT secret
   openssl rand -base64 32
   ```

3. **Edit `.env.production`:**
   - Set `DB_PASSWORD` to generated password
   - Set `JWT_SECRET` to generated secret
   - Set `VITE_API_URL` to your VPS IP or domain
   - Set `CORS_ORIGIN` to your VPS IP or domain
   - Set `GITHUB_TOKEN` to your GitHub personal access token

## Deployment Credentials Setup

1. **Copy the example file:**
   ```bash
   cp .env.deploy.example .env.deploy
   ```

2. **Edit `.env.deploy`:**
   - Set `VPS_HOST` to your VPS IP address
   - Set `VPS_USER` (usually `root`)
   - Set `VPS_SSH_PRIVATE_KEY` path (default: `$HOME/.ssh/id_rsa`)
   - Set `GITHUB_TOKEN` for pushing images to GHCR

## Environment Variables Reference

### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DB_USER` | Database user | `himo_user` |
| `DB_PASSWORD` | Database password | `secure_random_password` |
| `DB_NAME` | Database name | `himo` |

### API Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | API server port | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens | 32+ character random string |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` (7 days) |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3001` |

### Client Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API URL accessible from browser | `http://localhost:3000` |

### Bot Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_API_BASE_URL` | API URL for bot (internal) | `http://api:3000` |

### GitHub Container Registry

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub personal access token | `ghp_xxxxxxxxxxxxx` |

**Required scope:** `write:packages`
**Create token at:** https://github.com/settings/tokens

## Security Best Practices

### ✅ DO:
- Use strong, randomly generated passwords
- Generate JWT secrets with `openssl rand -base64 32`
- Keep `.env`, `.env.production`, and `.env.deploy` git-ignored
- Rotate secrets regularly
- Use different secrets for development and production

### ❌ DON'T:
- Commit `.env` files with real credentials to git
- Use default/example passwords in production
- Share credentials in Slack, email, or other channels
- Reuse passwords across environments
- Use short or predictable secrets

## Troubleshooting

### Database Connection Fails

**Development:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string in .env matches docker-compose.yml
```

**Production:**
```bash
# SSH to VPS and check
ssh root@your-vps
cd /home/deploy/himo
cat .env | grep DATABASE_URL
docker-compose -f docker-compose.prod.yml logs db
```

### JWT Token Issues

Ensure `JWT_SECRET` is:
- At least 32 characters long
- Randomly generated (not the example value)
- Same across all instances (API and Bot)

### CORS Errors

Ensure `CORS_ORIGIN` matches the URL where your frontend is accessed:
- **Development:** `http://localhost:3001`
- **Production:** `http://your-vps-ip` or `https://your-domain.com`

### VITE_API_URL Not Working

Remember that `VITE_*` variables are:
- Embedded at build time (not runtime)
- Must be public (sent to browser)
- Require rebuild after changing

```bash
# After changing VITE_API_URL, rebuild:
pnpm --filter client run build
```

## Need Help?

- Check example files: `.env.example`, `.env.production.example`, `.env.deploy.example`
- See deployment guide: `docs/MANUAL_DEPLOYMENT.md`
- See getting started: `docs/guides/GETTING_STARTED.md`
