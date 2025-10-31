# Docker Guide for Himo

## Quick Start Options

### Option 1: Local Development with MongoDB Only (Recommended)
Run MongoDB in Docker, API/Bot locally with hot-reload:

```bash
# Start MongoDB
docker-compose -f docker-compose.local.yml up -d mongo

# In Terminal 1 - API
npm run dev:api

# In Terminal 2 - Bot (optional)
npm run dev:bot

# Stop MongoDB when done
docker-compose -f docker-compose.local.yml down
```

**Benefits:**
- ✅ Fast hot-reload with tsx
- ✅ Easy debugging
- ✅ See console logs directly
- ✅ MongoDB web UI at http://localhost:8081 (admin/admin)

### Option 2: Full Docker Development
Run everything in Docker with volume mounts:

```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Option 3: Production Docker
Run optimized production builds:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Available Docker Compose Files

### `docker-compose.local.yml`
**Purpose:** Local development - MongoDB only

**Services:**
- MongoDB (port 27017)
- Mongo Express web UI (port 8081)

**Usage:**
```bash
docker-compose -f docker-compose.local.yml up -d
```

### `docker-compose.yml`
**Purpose:** Base production configuration

**Services:**
- MongoDB
- API (production build)
- Bot (production build)

**Usage:**
```bash
docker-compose up -d
```

### `docker-compose.dev.yml`
**Purpose:** Development override for docker-compose.yml

**Features:**
- Volume mounts for hot-reload
- Dev command with tsx watch
- Debugger port exposed (9229)
- Mongo Express included

**Usage:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### `docker-compose.prod.yml`
**Purpose:** Production optimizations

**Features:**
- Multi-stage builds
- Optimized images
- Resource limits
- Health checks

## Docker Commands Reference

### Start Services
```bash
# Local MongoDB only
docker-compose -f docker-compose.local.yml up -d

# Development (all services)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# Build and start
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f bot
docker-compose logs -f mongo

# Last 100 lines
docker-compose logs --tail=100 -f
```

### Stop Services
```bash
# Stop (keeps containers)
docker-compose stop

# Down (removes containers)
docker-compose down

# Down with volumes (removes data!)
docker-compose down -v
```

### Manage Services
```bash
# Restart a service
docker-compose restart api

# Rebuild a service
docker-compose build api

# Scale a service
docker-compose up -d --scale bot=3

# Execute command in container
docker-compose exec api sh
docker-compose exec mongo mongosh himo
```

### Check Status
```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Check health
docker-compose ps
docker inspect himo-api --format='{{.State.Health.Status}}'
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secure-secret-key-here

# CORS Origin
CORS_ORIGIN=http://localhost:3001

# Scraping Schedule
SCRAPING_INTERVAL=*/2 5-22 * * *

# MongoDB (optional, has defaults)
MONGODB_URL=mongodb://mongo:27017/himo
```

## Accessing Services

### When running locally (Option 1)
- **API:** http://localhost:3000
- **MongoDB:** mongodb://localhost:27017
- **Mongo Express:** http://localhost:8081 (admin/admin)

### When running in Docker
- **API:** http://localhost:3000
- **MongoDB:** mongodb://localhost:27017 (from host)
- **MongoDB:** mongodb://mongo:27017 (from containers)
- **Mongo Express:** http://localhost:8081

## Testing

### API Health Check
```bash
curl http://localhost:3000/api/health
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Search Ads
```bash
curl -X POST http://localhost:3000/api/ads/search \
  -H "Content-Type: application/json" \
  -d '{"priceMax":500000,"type":"appartement"}'
```

## MongoDB Management

### Connect with mongosh
```bash
# From host
mongosh mongodb://localhost:27017/himo

# From Docker
docker-compose exec mongo mongosh himo
```

### View Data
```javascript
// List collections
show collections

// Count ads
db.ads.countDocuments()

// Find ads
db.ads.find().limit(5).pretty()

// Find users
db.users.find().pretty()
```

### Backup Database
```bash
# Backup
docker-compose exec mongo mongodump --db=himo --out=/data/backup

# Restore
docker-compose exec mongo mongorestore --db=himo /data/backup/himo
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker-compose ps mongo

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo

# Check connectivity
docker-compose exec api ping mongo
```

### API Not Starting
```bash
# Check logs
docker-compose logs api

# Check if port is in use
lsof -i :3000

# Rebuild
docker-compose build api
docker-compose up -d api
```

### Volume Permission Issues
```bash
# On Linux, fix permissions
sudo chown -R $USER:$USER .

# Rebuild without cache
docker-compose build --no-cache
```

### Clean Everything
```bash
# Remove containers, volumes, images
docker-compose down -v --rmi all

# Remove all Docker data (CAREFUL!)
docker system prune -a --volumes
```

## Performance Tips

### Development
- Use `docker-compose.local.yml` for fastest development
- Volume mounts can be slow on macOS - use Option 1
- Use `tsx watch` for instant hot-reload

### Production
- Use multi-stage builds
- Set resource limits
- Enable healthchecks
- Use Docker secrets for sensitive data

## Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use health checks** - Ensure services are ready before connecting
3. **Volume management** - Back up MongoDB data regularly
4. **Resource limits** - Prevent services from consuming all resources
5. **Logging** - Use structured logging for easier debugging
6. **Security** - Change default passwords and secrets
7. **Updates** - Keep base images updated (mongo, node)

## Next Steps

1. ✅ Start MongoDB: `docker-compose -f docker-compose.local.yml up -d`
2. ✅ Run API: `npm run dev:api`
3. ✅ Test endpoints (see GETTING_STARTED.md)
4. ⏳ Run bot: `npm run dev:bot`
5. ⏳ View MongoDB: http://localhost:8081

---

**Need help?** Check the troubleshooting section or the main README.md
