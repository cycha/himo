# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Himo is a production-ready, full-stack TypeScript real estate aggregator with a modern tech stack. It's a monorepo with three main packages: API (Express backend), Client (React frontend), and Bot (web scraper), plus a shared commons package.

## Monorepo Setup

This is a **pnpm workspaces monorepo** with the following structure:

```
himo/
├── api/                 # Express + Prisma backend
├── client/             # React 19 + Vite frontend
├── bot/                # Web scraper for real estate data
├── commons/            # Shared types and models
├── docs/               # Comprehensive documentation
└── package.json        # Root workspace config
```

All development commands use `pnpm --filter` to target specific workspaces.

## Common Development Commands

### Installation & Setup

```bash
pnpm install                          # Install all dependencies
cd api && npx prisma migrate deploy   # Run database migrations
docker-compose up -d postgres         # Start PostgreSQL with Docker
```

### Development Servers

```bash
pnpm dev:api                    # Start backend (Express with hot reload via tsx)
pnpm dev:client                 # Start frontend (Vite dev server, port 3001)
pnpm dev:bot                    # Start scraper
```

### Building

```bash
pnpm build                      # TypeScript build all packages
pnpm build:watch               # Watch mode for all packages
pnpm clean                      # Clean all dist folders
```

### Testing

```bash
pnpm --filter api test          # Run Jest tests (backend only)
pnpm --filter api test -- <pattern>  # Run specific tests matching pattern
pnpm --filter api test -- --watch    # Watch mode
```

### Code Quality

```bash
pnpm lint                       # Run ESLint
pnpm lint -- --fix              # Fix linting issues
pnpm format                     # Run Prettier
pnpm type-check                 # TypeScript type checking (no emit)
```

### Database Commands

```bash
pnpm --filter api prisma:generate   # Generate Prisma Client
pnpm --filter api prisma:migrate    # Create new migration
pnpm --filter api prisma:reset      # Reset database (WARNING: destructive)
pnpm --filter api prisma:studio     # Open Prisma Studio GUI
pnpm seed                           # Seed database with sample data
```

### Docker

```bash
docker-compose up               # Start all services (PostgreSQL, API, Bot)
docker-compose up postgres      # PostgreSQL only
docker-compose down             # Stop all services
```

## Backend Architecture

The API follows **Clean Architecture** with strict separation of concerns:

### Layer Structure

```
Controllers (HTTP handling)
    ↓
Services (Business logic)
    ↓
Repositories (Data access abstraction)
    ↓
Database (PostgreSQL + Prisma ORM)
```

### Directory Organization

```
api/src/
├── controllers/       # HTTP request/response handling
├── services/         # Business logic and orchestration
├── repositories/     # Database abstraction (CRUD operations)
├── dtos/            # Data Transfer Objects (contracts between layers)
├── middleware/      # Auth, validation, error handling
├── routes/          # Express route definitions
├── types/           # TypeScript types and enums
├── lib/             # Utilities (Prisma client, etc.)
└── scripts/         # Database seeding
```

### Key Principles

1. **Controllers** handle only HTTP concerns:
   - Receive HTTP requests
   - Call service methods
   - Format and send responses
   - No business logic, no database access

2. **Services** implement business rules:
   - Complex logic and validation
   - Orchestrate repository calls
   - Implement interfaces for testability
   - No HTTP concerns, no direct database access

3. **Repositories** abstract database operations:
   - CRUD operations via Prisma ORM
   - Query optimization
   - No business logic

4. **DTOs** define data contracts:
   - Input validation schemas
   - Response types
   - Type safety between layers

### Testing

Backend uses **Jest** with mocking and integration tests:

- Test files coexist with source (`*.test.ts` pattern)
- Database setup in `api/src/__tests__/setup.ts` handles cleanup between tests
- Use `jest-mock-extended` for mocking Prisma
- Test timeout: 10 seconds (adjustable)

Run tests: `pnpm --filter api test`

## Frontend Architecture

The Client uses **React 19** with modern patterns and feature-based organization:

### Tech Stack

- **Vite 7** for ultra-fast development (<50ms HMR)
- **React Router 6** for client-side routing
- **React Query** for server state management
- **shadcn/ui + Tailwind CSS** for design system
- **TypeScript** for type safety

### Directory Structure

```
client/src/
├── features/        # Feature modules (auth, ads, dashboard)
├── components/      # Shared UI components
│   └── ui/         # shadcn/ui components (auto-generated)
├── hooks/          # Custom React hooks
│   ├── api/        # Hooks for API calls (useAuth, useAds)
│   └── common/     # Utility hooks (useDebounce, useLocalStorage)
├── context/        # React Context for app state
├── services/       # API client and utilities
├── types/          # TypeScript type definitions
└── lib/            # Utility functions
```

### Key Patterns

1. **React Query Integration**:
   - Hooks like `useAuth` and `useAds` handle data fetching
   - Automatic caching and synchronization
   - Devtools available for debugging

2. **shadcn/ui Components**:
   - Copy-paste component library
   - Located in `components/ui/`
   - Built on Radix UI primitives
   - Fully styled with Tailwind

3. **Context for App State**:
   - `AuthContext` manages user authentication
   - Access via custom hooks

## Database

**PostgreSQL 16 + PostGIS** with Prisma ORM:

### Key Models

- **User**: Authentication with bcrypt hashing
- **Ad**: Real estate listings with geospatial support (latitude/longitude)

### Important Indexes

- Ads indexed by: provider + releaseDate, price, surface, type, zipcode, geospatial coordinates
- Users indexed by email

### Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/himo
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development|production|test
```

See `.env.example` for complete reference.

## Key Files & Patterns

### Authentication

- **Backend**: JWT tokens with HTTP-only cookies, bcrypt hashing (12 rounds)
- **Frontend**: `AuthContext` for state, `useAuth` hook for API calls
- **Middleware**: `auth.ts` validates JWT tokens

### API Client

- **Frontend**: `client/src/services/api.ts` (Axios instance with auth headers)
- **Hooks**: `useAuth`, `useAds` handle all API communication

### Error Handling

- Backend: `error-handler.ts` middleware catches and formats errors
- Frontend: React Query handles API errors with built-in retry logic

## Important Notes

1. **Type Safety**: This is a fully typed TypeScript codebase. Always maintain types and run `pnpm type-check` before committing.

2. **Dependency Management**: Monorepo uses pnpm workspaces. Never use npm or yarn. Always use `pnpm --filter <workspace>` for workspace-specific commands.

3. **Hot Reload**:
   - Backend: `tsx watch` provides automatic reload
   - Frontend: Vite provides sub-50ms HMR for instant feedback

4. **Database Migrations**: Use Prisma for all schema changes:

   ```bash
   pnpm --filter api prisma:migrate
   ```

   This creates migration files in `api/prisma/migrations/`

5. **API Port**: Backend runs on port 3000, frontend on port 3001

6. **Bundle Optimization**: Frontend is highly optimized (371 KB). Before adding dependencies, consider if they're necessary.

7. **Docker**: Uses multi-stage builds for efficiency. Services are in `docker-compose.yml`.

## Documentation

Comprehensive docs are in the `docs/` folder:

- **architecture/ARCHITECTURE.md**: Backend architecture deep dive
- **guides/GETTING_STARTED.md**: Detailed setup instructions
- **guides/DOCKER_GUIDE.md**: Docker deployment
- **guides/COMMIT_GUIDE.md**: Git workflow conventions

## Development Workflow

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Run quality checks: `pnpm lint && pnpm format && pnpm type-check`
4. Commit with clear messages (see guides/COMMIT_GUIDE.md)
5. Create PR with detailed description
6. Address review feedback
7. Merge to master when all checks pass
