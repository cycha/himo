# Getting Started with Himo v2.0 🚀

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo and all workspaces.

### 2. Set Up Environment Variables

```bash
# Copy example files
cp api/.env.example api/.env
cp bot/.env.example bot/.env
```

Edit `api/.env`:

```env
API_PORT=3000
DATABASE_URL=postgresql://localhost:27017/himo
JWT_SECRET=change-this-to-a-secure-random-string-32-chars-min
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

Edit `bot/.env`:

```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:27017/himo
SCRAPING_INTERVAL=*/5 * * * *
```

### 3. Start PostgreSQL

**Option A: Docker (Recommended)**

```bash
docker run -d -p 27017:27017 --name himo-postgres postgres:16-alpine
```

**Option B: Homebrew (macOS)**

```bash
brew services start docker-compose up -d postgresb-community
```

**Option C: PostgreSQL Atlas (Cloud)**

- Sign up at https://www.docker-compose up -d postgresb.com/cloud/atlas
- Create a free cluster
- Get connection string and update `.env` files

### 4. Build the Project

```bash
npm run build
```

This compiles all TypeScript modules to JavaScript.

### 5. Run the Application

**Terminal 1 - API Server:**

```bash
npm run dev:api
```

API will start at http://localhost:3000

**Terminal 2 - Scraper Bot:**

```bash
npm run dev:bot
```

**Terminal 3 - Client (when ready):**

```bash
npm run dev:client
```

### 6. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Search ads (will be empty initially)
curl -X POST http://localhost:3000/api/ads/search \
  -H "Content-Type: application/json" \
  -d '{"priceMax": 500000}'

# Create a user
curl -X POST http://localhost:3000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## What Just Happened?

### ✅ Commons Module (`@himo/commons`)

- **TypeScript types** for Ads and Users
- **Prisma models** with validation and indexes
- **Database utilities** with connection pooling
- **Security** with bcrypt password hashing

### ✅ API Module (`@himo/api`)

- **REST API** with Express and TypeScript
- **Clean architecture** with controllers → services → models
- **Authentication** with JWT tokens
- **Validation** with express-validator
- **Security** with helmet, CORS, rate limiting
- **Error handling** with centralized middleware

### ✅ Bot Module (`@himo/bot`)

- **Web scraper** for LeBonCoin and other sites
- **Cron jobs** for scheduled scraping
- **OOP design** with base scraper class
- **Retry logic** with exponential backoff
- **Logging** with structured output

## Project Structure

```
himo/
├── commons/          # Shared package
│   ├── src/
│   │   ├── models/       # Prisma schemas
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # DB connection
│   └── dist/             # Compiled JavaScript
│
├── api/              # REST API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # API routes
│   │   └── server.ts     # Main file
│   └── dist/             # Compiled JavaScript
│
├── bot/              # Scraper
│   ├── src/
│   │   ├── scrappers/    # Scraper classes
│   │   ├── tasks/        # Cron tasks
│   │   └── index.ts      # Main file
│   └── dist/             # Compiled JavaScript
│
└── client/           # React frontend (to migrate)
```

## Available Scripts

### Root Level

```bash
npm run build          # Build all TypeScript projects
npm run build:watch    # Watch mode for all projects
npm run clean          # Clean all dist folders
npm run type-check     # Type check without emitting
npm run lint           # Lint all code
npm run format         # Format all code with Prettier
```

### API

```bash
npm run dev --workspace=api      # Dev mode with hot reload
npm run build --workspace=api    # Build TypeScript
npm start --workspace=api        # Start production build
```

### Bot

```bash
npm run dev --workspace=bot      # Dev mode with hot reload
npm run build --workspace=bot    # Build TypeScript
npm start --workspace=bot        # Start production build
npm run lbc --workspace=bot      # Run LeBonCoin scraper once
```

## Common Issues & Solutions

### ❌ "Cannot find module '@himo/commons'"

**Solution:**

```bash
cd commons
npm run build
cd ..
npm install
```

### ❌ "Connection refused to PostgreSQL"

**Solution:**

```bash
# Check if PostgreSQL is running
docker ps  # or
brew services list

# Start PostgreSQL
docker start docker-compose up -d postgresb  # or
brew services start docker-compose up -d postgresb-community
```

### ❌ TypeScript compilation errors

**Solution:**

```bash
npm run clean
npm install
npm run build
```

### ❌ Port already in use

**Solution:**

```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
API_PORT=3001
```

## Development Workflow

### Making Changes

1. **Edit TypeScript files** in `src/` folders
2. **In dev mode** (tsx watch), changes auto-reload
3. **For production**, rebuild:
   ```bash
   npm run build
   ```

### Adding Dependencies

```bash
# Add to specific workspace
npm install express --workspace=api
npm install axios --workspace=bot

# Add dev dependency
npm install --save-dev @types/express --workspace=api
```

### Database Operations

```bash
# Connect to PostgreSQL
psql -U postgres postgresql://localhost:27017/himo

# View collections
show collections

# View ads
db.ads.find().limit(5)

# Count ads
db.ads.countDocuments()

# Drop database (careful!)
db.dropDatabase()
```

## Testing the Scraper

The bot runs automatically on a schedule, but you can test manually:

```bash
# Run scraper once
npm run lbc --workspace=bot

# Or import and run in Node
node -e "
  const { scrapingTask } = require('./bot/dist/tasks/scraping-task');
  scrapingTask();
"
```

## API Endpoints

### Public Endpoints

```
POST /api/ads/search      # Search ads
GET  /api/ads/:id         # Get ad details
POST /api/users/signup    # Register
POST /api/users/login     # Login
GET  /api/health          # Health check
```

### Protected Endpoints (require JWT token)

```
GET  /api/users/profile   # Get user profile
```

### Using Authentication

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.data.token')

# 2. Use token
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

## What's Next?

### Immediate Priority

1. **Run and test** the backend (API + Bot)
2. **Review the code** to understand the architecture
3. **Migrate the client** to TypeScript + React 18

### Short Term

- Add comprehensive testing (Jest + Playwright)
- Improve UI with modern design system
- Add more scrapers for other sites

### Long Term

- Set up CI/CD pipeline
- Deploy to production
- Add monitoring and analytics
- Create admin dashboard

## Learning Resources

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Architecture

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

### Express + TypeScript

- [Express TypeScript Guide](https://www.typescriptlang.org/docs/handbook/asp-net-core.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Need Help?

1. Check `README.md` for overview
2. Check `MIGRATION_GUIDE.md` for JavaScript → TypeScript changes
3. Check `PORTFOLIO_ROADMAP.md` for future plans
4. Check console logs for detailed errors
5. Enable debug mode: `NODE_ENV=development`

## Success Indicators

✅ API responds at http://localhost:3000/api/health
✅ Bot starts without errors
✅ PostgreSQL connection successful
✅ Can create users and login
✅ Scraper runs and saves ads
✅ TypeScript compilation succeeds

---

**Congratulations!** You now have a modern, TypeScript-based real estate aggregator running locally. 🎉

**Next:** Review the code, test the features, and start planning the client migration!
