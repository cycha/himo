#!/bin/sh
rm -f /tmp/.X99-lock && rm -f /tmp/.X11-unix/X99
Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp &
sleep 3
cd /app
echo "Checking for failed migrations..."
pnpm --filter api exec prisma migrate resolve --rolled-back 20251101124956_init 2>/dev/null || true
echo "Running database migrations..."
pnpm --filter api exec prisma migrate deploy 2>/dev/null || true
pnpm --filter bot start || { pkill -f Xvfb; exit 1; }
