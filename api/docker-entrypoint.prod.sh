#!/bin/sh
cd /app
echo "Checking for failed migrations..."
pnpm --filter api exec prisma migrate resolve --rolled-back 20251101124956_init 2>&1 || true
echo "Running database migrations..."
pnpm --filter api exec prisma migrate deploy 2>&1 || true
echo "Migrations complete, starting API server..."
node api/dist/server.js
