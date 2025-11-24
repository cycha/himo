# Himo - Real Estate Aggregator

Full-stack TypeScript real estate platform aggregating listings from multiple French sources.

## Highlights

- **Clean Architecture** - SOLID principles, layered backend (Controllers → Services → Repositories)
- **Modern Stack** - React 19, Vite 7, TypeScript 5, Prisma ORM v7
- **Type-Safe** - End-to-end TypeScript with strict mode
- **Production-Ready** - Docker deployment, automated scraping, geospatial search
- **Tested** - Jest integration tests, ESLint, comprehensive type checking

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS
**Backend:** Express, TypeScript, Prisma, PostgreSQL + PostGIS
**Scraper:** Puppeteer, TypeScript
**Auth:** JWT + bcrypt
**Tools:** pnpm workspaces, Docker, ESLint

## Quick Start

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
cd api && npx prisma migrate deploy && cd ..

# Start development servers
pnpm dev:api     # Terminal 1 - http://localhost:3000
pnpm dev:client  # Terminal 2 - http://localhost:3001
```

Open http://localhost:3001 to view the app.

## Project Structure

```
himo/
├── api/         # Express backend with Clean Architecture
├── client/      # React 19 frontend with feature-based structure
├── bot/         # Web scraper for real estate sites
└── commons/     # Shared types and models
```

## Architecture

**Backend:** Clean Architecture with dependency injection
- Controllers handle HTTP requests
- Services implement business logic
- Repositories abstract database operations
- DTOs ensure type-safe data contracts

**Frontend:** Feature-based organization
- TanStack Query for server state management
- Custom hooks for API calls
- shadcn/ui component library
- React Context for app state

## Environment Setup

Copy `.env.example` to `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/himo
JWT_SECRET=your-secret-key
```

## Development

```bash
pnpm dev:api              # Start backend (port 3000)
pnpm dev:client           # Start frontend (port 3001)
pnpm dev:bot              # Start scraper
pnpm build                # Build all packages
pnpm test                 # Run tests
pnpm lint                 # Lint code
pnpm type-check           # TypeScript check
```

## Docker

```bash
docker-compose up         # Start all services
docker-compose up postgres # PostgreSQL only
```
