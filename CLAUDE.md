# CLAUDE.md

Instructions for Claude Code when working with this repository.

## Project Overview

Himo is a full-stack TypeScript real estate aggregator. Monorepo with three packages: API (Express backend), Client (React frontend), and Bot (web scraper).

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TanStack Query, shadcn/ui
- **Backend:** Express, TypeScript, Prisma, PostgreSQL + PostGIS
- **Auth:** JWT + bcrypt
- **Package Manager:** pnpm workspaces

## Key Commands

```bash
pnpm install
pnpm dev:api              # Backend on :3000
pnpm dev:client           # Frontend on :3001
pnpm dev:bot              # Scraper
pnpm build
pnpm --filter api test
pnpm lint
pnpm type-check
```

## Architecture

### Backend (Clean Architecture)
```
Controllers → Services → Repositories → Database
```

- **Controllers**: HTTP only, no business logic
- **Services**: Business logic, orchestrate repositories
- **Repositories**: Database operations via Prisma
- **DTOs**: Data contracts between layers

### Frontend (Feature-based)
```
client/src/
├── features/      # Feature modules (auth, ads, dashboard)
├── components/    # Shared UI components
│   └── ui/       # shadcn/ui components
├── hooks/        # React hooks (api/, common/)
├── context/      # React Context
└── services/     # API client (Axios)
```

### Key Patterns
- TanStack Query for server state
- Custom hooks for API calls (useAuth, useAds, useBot)
- shadcn/ui for component library
- Feature-based organization

## Database

PostgreSQL with Prisma ORM. Migrations:

```bash
pnpm --filter api prisma:migrate
pnpm --filter api prisma:generate
pnpm --filter api prisma:studio
```

## Environment

Required in `.env`:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

## Testing

Backend uses Jest with integration tests. Files: `*.test.ts` alongside source.

```bash
pnpm --filter api test
pnpm --filter api test -- <pattern>
```

## Git Commits

When creating commits:
- Write clear, concise commit messages
- Use conventional commit format: `type: description`
- **DO NOT** add Claude Code footer or co-authorship tags
- Keep messages professional and straightforward

## Important Notes

- Always use `pnpm` (not npm/yarn)
- Monorepo: use `pnpm --filter <workspace>` for workspace-specific commands
- Maintain TypeScript types, run `pnpm type-check` before commits
- Backend port: 3000, Frontend port: 3001