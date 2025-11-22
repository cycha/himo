# Docker Container Testing Guide

**IMPORTANT**: These Dockerfiles have been refactored but **NOT TESTED** in a live Docker environment.

## What Changed

### Fixed Issues
1. **Bot working directory**: Changed from `/app` to `/app/bot` before running `pnpm start`
2. **API dependencies**: Added `--filter api...` (with ellipsis) to include `commons` workspace

### Simplified
- Removed complex entrypoint shell scripts
- Removed migration workaround for specific migration `20251101124956_init`
- Simplified CMD to direct `sh -c` commands
- Removed error suppression (`|| true`, `2>&1`) for better debugging

## Testing Steps

### 1. Test Individual Services

```bash
# Test PostgreSQL only
docker compose up postgres

# In another terminal, verify it's healthy
docker compose ps
# postgres should show "healthy" status

# Test API
docker compose up api

# Expected behavior:
# - Should run migrations successfully
# - Should start dev server on port 3000
# - Look for "Migrations complete, starting API dev server..." (removed - now just runs)

# Test Bot
docker compose up bot

# Expected behavior:
# - Xvfb should start
# - Migrations should run
# - Bot should start with tsx
# - Look for scraper initialization logs
```

### 2. Test Full Stack

```bash
# Start all services
docker compose up

# Or in detached mode
docker compose up -d

# Check logs
docker compose logs -f api
docker compose logs -f bot
docker compose logs postgres
```

### 3. Verify Migrations

```bash
# Enter API container
docker compose exec api sh

# Inside container, check migrations
cd /app/api
npx prisma migrate status

# Should show: "Database schema is up to date!"
```

### 4. Test After Clean Start

```bash
# Stop and remove everything
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache

# Start again
docker compose up
```

## Expected Issues & Solutions

### Issue: Migration fails on first run
**Symptom**: `prisma migrate deploy` fails with database not ready

**Solution**: The healthcheck should prevent this, but if it happens:
```bash
docker compose restart api
# or
docker compose restart bot
```

### Issue: Bot fails to start
**Symptom**: `Cannot find package.json` or similar

**Verification**: This was the original bug - now fixed by `cd /app/bot`
```bash
docker compose exec bot sh
cd /app/bot
ls -la package.json  # Should exist
```

### Issue: Commons dependency not found
**Symptom**: `Cannot find module '@himo/commons'`

**Verification**: This should be fixed by `--filter api...`
```bash
docker compose exec api sh
ls -la /app/node_modules/@himo/commons  # Should exist
```

### Issue: Xvfb not starting
**Symptom**: Bot container exits immediately

**Debug**:
```bash
docker compose logs bot | grep -i xvfb
# Should see Xvfb startup
```

## Rollback Plan

If these changes don't work, rollback to previous commit:

```bash
git log --oneline -5
# Find the commit before ef4b8e8

git revert bfa52d6  # Revert simplification
git revert ef4b8e8  # Revert working directory fix

# Or hard reset (WARNING: loses changes)
git reset --hard d34dd50
```

## Production Testing

Before deploying to production, test `.prod` Dockerfiles:

```bash
# Build production images
docker build -f api/Dockerfile.prod -t himo-api:prod .
docker build -f bot/Dockerfile.prod -t himo-bot:prod .

# Test API
docker run --rm -e DATABASE_URL="postgresql://..." himo-api:prod

# Test bot
docker run --rm -e DATABASE_URL="postgresql://..." himo-bot:prod
```

## Success Criteria

- [ ] All services start without errors
- [ ] Migrations run successfully on first start
- [ ] API responds on http://localhost:3000
- [ ] Bot logs show successful initialization
- [ ] No "Cannot find package.json" errors
- [ ] No "Cannot find module '@himo/commons'" errors
- [ ] Clean restart works (down -v, up)
- [ ] Production Dockerfiles also work

## Contact

If any issues occur, provide:
1. Full docker compose logs: `docker compose logs > logs.txt`
2. Container status: `docker compose ps`
3. Error messages
4. Which step failed
