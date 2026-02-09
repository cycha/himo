# Himo - Real Estate Aggregator

Full-stack TypeScript real estate platform aggregating listings from multiple French sources.

## Highlights

- **Clean Architecture** - SOLID principles, layered backend (Controllers > Services > Repositories)
- **Modern Stack** - React 19, Vite 7, TypeScript 5, Prisma 7, Express 5
- **Type-Safe** - End-to-end TypeScript with strict mode across all packages
- **Production-Ready** - Docker deployment, CI/CD, automated scraping, geospatial search
- **Tested** - Jest integration tests, ESLint 9, comprehensive type checking
- **i18n** - Internationalization support (English, French)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, TanStack Query, shadcn/ui, Tailwind CSS |
| **Backend** | Express 5, Prisma 7, PostgreSQL + PostGIS |
| **Scraper** | Playwright, node-cron |
| **Auth** | JWT + bcrypt |
| **Infra** | pnpm workspaces, Docker, GitHub Actions |

## Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose

## Quick Start

```bash
# Clone and install
pnpm install

# Start PostgreSQL
docker compose up -d postgres

# Run migrations
pnpm --filter api prisma:migrate

# Start development (API + Client)
pnpm dev
```

Open http://localhost:3001 to view the app. API runs on http://localhost:3000.

## Project Structure

```
himo/
├── api/         # Express backend (Clean Architecture)
├── client/      # React frontend (feature-based)
├── bot/         # Playwright scraper for real estate sites
├── commons/     # Shared TypeScript types and models
└── scripts/     # Deployment scripts
```

## Architecture

**Backend** follows Clean Architecture:
```
Controllers → Services → Repositories → Prisma → PostgreSQL
```

**Frontend** uses feature-based organization:
```
features/    # Feature modules (auth, ads, dashboard)
components/  # Shared UI (shadcn/ui)
hooks/       # API hooks (TanStack Query) + common hooks
context/     # React Context (auth, theme)
services/    # Axios API client
```

## Development

```bash
pnpm dev                  # API + Client in parallel
pnpm dev:api              # Backend only (port 3000)
pnpm dev:client           # Frontend only (port 3001)
pnpm dev:bot              # Scraper
pnpm build                # Build all packages
pnpm lint                 # ESLint
pnpm type-check           # TypeScript check
pnpm --filter api test    # Run API tests
```

## Database

PostgreSQL with PostGIS extension, managed via Prisma ORM.

```bash
pnpm --filter api prisma:migrate    # Run migrations
pnpm --filter api prisma:generate   # Regenerate client
pnpm --filter api prisma:studio     # Visual database browser
pnpm --filter api prisma:seed       # Seed data
```

## Docker

```bash
# Development (with hot reload)
docker compose up

# Production
docker compose -f docker-compose.prod.yml up
```

## Environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/himo
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
```

See `.env.example`, `.env.production.example`, and `.env.deploy.example` for full configuration.

## CI/CD

GitHub Actions workflows handle:
- **CI** - Lint, type-check, build, test on push/PR
- **Security** - Dependency audit, CodeQL analysis, secret scanning
- **CD** - Automated deployment
- **Dependabot** - Automated dependency updates
