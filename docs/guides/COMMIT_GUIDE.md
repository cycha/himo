# Git Commit Guide

Follow this order to commit the TypeScript migration in logical chunks:

## Commit 1: Project Setup & Configuration

```bash
git add .gitignore
git add tsconfig.json
git add package.json
git add .eslintrc.json .prettierrc.json .prettierignore
git commit -m "chore: set up TypeScript monorepo configuration

- Add root tsconfig.json with project references
- Configure npm workspaces for monorepo
- Add ESLint and Prettier for code quality
- Update .gitignore for TypeScript projects"
```

## Commit 2: Commons Module - Types & Interfaces

```bash
git add commons/tsconfig.json
git add commons/package.json
git add commons/src/types/
git commit -m "feat(commons): add TypeScript type definitions

- Create IAd interface with full type safety
- Create IUser interface with authentication methods
- Export all types from index"
```

## Commit 3: Commons Module - Models

```bash
git add commons/src/models/
git commit -m "feat(commons): migrate Prisma models to TypeScript

- Convert Ad schema with improved validation
- Convert User schema with bcrypt password hashing
- Add pre-save hooks for password security
- Implement proper indexes for performance
- Replace password-hash with bcrypt (12 salt rounds)"
```

## Commit 4: Commons Module - Database Utils

```bash
git add commons/src/utils/
git add commons/src/index.ts
git commit -m "feat(commons): add database connection utilities

- Implement singleton pattern for DB connection
- Add retry logic with configurable attempts
- Add connection status monitoring
- Export all utilities from index"
```

## Commit 5: API Module - Types & DTOs

```bash
git add api/tsconfig.json
git add api/package.json
git add api/src/types/
git commit -m "feat(api): add TypeScript types and DTOs

- Create SearchAdDto with proper validation types
- Add SignupDto and LoginDto interfaces
- Define LocationFilter type for geospatial queries"
```

## Commit 6: API Module - Middleware

```bash
git add api/src/middleware/
git commit -m "feat(api): implement middleware layer

- Add JWT authentication middleware
- Add input validation with express-validator
- Create centralized error handler
- Implement custom error class (AppError)
- Add validation error handling"
```

## Commit 7: API Module - Services

```bash
git add api/src/services/
git commit -m "feat(api): implement service layer

- Create AdService with business logic
- Create UserService with auth logic
- Separate business logic from controllers
- Implement proper error handling"
```

## Commit 8: API Module - Controllers

```bash
git add api/src/controllers/
git commit -m "feat(api): migrate controllers to TypeScript

- Convert AdController with type-safe handlers
- Convert UserController with improved error handling
- Add proper request/response typing
- Implement getProfile endpoint"
```

## Commit 9: API Module - Routes & Server

```bash
git add api/src/routes/
git add api/src/server.ts
git add api/.env.example
git commit -m "feat(api): set up Express server with TypeScript

- Create modular route structure
- Add health check endpoint
- Implement security (Helmet, CORS, rate limiting)
- Add graceful shutdown handling
- Configure environment variables
- Add backward compatibility routes"
```

## Commit 10: Bot Module - Types & Utils

```bash
git add bot/tsconfig.json
git add bot/package.json
git add bot/src/types/
git add bot/src/utils/
git commit -m "feat(bot): add TypeScript types and utilities

- Create scraper interfaces and types
- Add logger utility with structured output
- Add helper functions (sleep, shuffle, statistics)
- Replace manual retry logic with typed implementations"
```

## Commit 11: Bot Module - Scrapers

```bash
git add bot/src/scrappers/
git commit -m "feat(bot): migrate scrapers to TypeScript

- Create BaseScraper abstract class
- Implement LeBonCoinScraper with OOP design
- Add retry logic with exponential backoff
- Improve error handling and logging
- Add configurable scraping parameters"
```

## Commit 12: Bot Module - Tasks & Entry Point

```bash
git add bot/src/tasks/
git add bot/src/index.ts
git add bot/.env.example
git commit -m "feat(bot): set up cron jobs and task scheduler

- Create scraping task with comprehensive logging
- Add cleanup task for old ads
- Implement graceful shutdown
- Configure cron schedules
- Add environment configuration"
```

## Commit 13: Documentation

```bash
git add README.md
git add GETTING_STARTED.md
git add MIGRATION_GUIDE.md
git add PORTFOLIO_ROADMAP.md
git add TRANSFORMATION_SUMMARY.md
git commit -m "docs: add comprehensive project documentation

- Create detailed README with feature list
- Add quick start guide (GETTING_STARTED.md)
- Document JavaScript to TypeScript migration
- Outline future development roadmap
- Provide transformation summary for portfolio"
```

## After All Commits

Check your work:

```bash
git log --oneline
git status
```

Push to remote:

```bash
git push origin master
```

## Alternative: Single Commit (Not Recommended)

If you prefer one commit:

```bash
git add .
git commit -m "feat: migrate entire project to TypeScript

Major changes:
- Convert all modules (commons, api, bot) to TypeScript
- Implement clean architecture with service layer
- Upgrade security (bcrypt, JWT, rate limiting, Helmet)
- Add comprehensive error handling and validation
- Create modular structure with proper separation of concerns
- Add ESLint, Prettier for code quality
- Include comprehensive documentation

BREAKING CHANGES:
- Requires Node.js >= 18
- PostgreSQL connection string format may differ
- JWT secret must be configured in environment
- Password hashing changed from password-hash to bcrypt"
```

## Tips

1. **Review changes before committing:**

   ```bash
   git diff <file>
   ```

2. **Stage files interactively:**

   ```bash
   git add -p
   ```

3. **Amend last commit if needed:**

   ```bash
   git commit --amend
   ```

4. **Check what you're about to commit:**
   ```bash
   git diff --staged
   ```
