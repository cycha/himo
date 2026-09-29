# Development Dockerfile for bot (headless Chromium, no Xvfb)

FROM node:25-slim

# Install build tools and Playwright's Chromium dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm (pinned to match lockfile)
RUN npm install -g pnpm@10.22.0

# Copy root config files
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.cjs tsconfig.json ./

# Copy workspace package.json files (bot + commons + api for Prisma)
COPY commons/package.json ./commons/
COPY api/package.json ./api/
COPY bot/package.json ./bot/

# Copy workspace source code (needed for proper monorepo resolution)
COPY commons ./commons
COPY api ./api
COPY api/prisma ./api/prisma
COPY bot ./bot

# Install dependencies for both api and bot workspaces
RUN pnpm install --frozen-lockfile --filter api --filter bot

# Generate Prisma Client from API schema
RUN pnpm --filter api exec prisma generate

# Install Playwright browsers from bot workspace
WORKDIR /app/bot
RUN pnpm exec playwright install chromium --with-deps || echo "Playwright installation attempted"

# Build TypeScript (optional for dev - can run as tsx)
RUN pnpm run build || true

# Start: run migrations then start bot (no Xvfb needed)
CMD sh -c "cd /app/api && npx prisma migrate deploy && cd /app/bot && pnpm start"
