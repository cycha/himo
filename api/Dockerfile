# Development Dockerfile for Express API with TypeScript
FROM node:25-alpine

# Install build tools for native modules (bcrypt, etc)
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.cjs tsconfig.json ./

# Copy workspace package.json files (API + commons)
COPY commons/package.json ./commons/
COPY api/package.json ./api/

# Copy workspace source code for proper monorepo resolution
COPY commons ./commons
COPY api ./api

# Install dependencies for api workspace only
RUN pnpm install --frozen-lockfile --filter api

# Rebuild bcrypt for Linux environment
RUN cd /app/node_modules/.pnpm/bcrypt@*/node_modules/bcrypt && npm rebuild || true

# Generate Prisma Client
RUN pnpm --filter api exec prisma generate

# Copy and run startup script that resolves failed migrations, runs new ones, then starts the dev server
COPY api/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000 9229

# Run dev server with migrations
CMD ["/bin/sh", "/app/docker-entrypoint.sh"]