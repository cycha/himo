# 🚀 Production Deployment Guide

Complete guide for deploying Himo to production with Docker or cloud platforms.

---

## 📋 Table of Contents

- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Environment Variables](#environment-variables)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring](#monitoring)

---

## 🐳 Docker Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/cycha/himo.git
cd himo

# 2. Set environment variables
cp .env.example .env.production
# Edit .env.production with your values

# 3. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 4. Check status
docker-compose -f docker-compose.prod.yml ps
```

**Access:**
- Frontend: http://localhost
- API: http://localhost/api
- MongoDB: localhost:27017

### Architecture

```
┌─────────────────┐
│   Client (80)   │  ← Nginx serving React app
│   + Nginx       │  ← Proxies /api to backend
└────────┬────────┘
         │
    ┌────▼────────┐
    │  API (3000) │  ← Node.js Express API
    └────┬────────┘
         │
    ┌────▼────────┐
    │ MongoDB     │  ← Database
    │  (27017)    │
    └─────────────┘
         │
    ┌────▼────────┐
    │    Bot      │  ← Web scraper
    └─────────────┘
```

### Container Details

#### Client (Frontend)
- **Base:** nginx:stable-alpine
- **Build:** Multi-stage (Node 18 → Nginx)
- **Port:** 80
- **Features:**
  - Gzip compression
  - Static asset caching (1 year)
  - Security headers
  - SPA routing support
  - API proxy to backend

#### API (Backend)
- **Base:** node:18-alpine
- **Port:** 3000
- **Features:**
  - Production-optimized
  - Health checks
  - Auto-restart

#### MongoDB
- **Base:** mongo:6-alpine
- **Port:** 27017
- **Persistent:** Volume mounted

---

## ☁️ Cloud Platforms

### Option 1: Vercel (Frontend) + Railway (Backend) ⭐ Recommended

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api.railway.app/api/:path*"
    }
  ]
}
```

**Backend on Railway:**
1. Connect GitHub repository
2. Select `api` folder as root
3. Add environment variables
4. Deploy automatically

---

### Option 2: AWS (Full Stack)

**Frontend (S3 + CloudFront):**
```bash
# Build
cd client && npm run build

# Deploy to S3
aws s3 sync build/ s3://your-bucket-name

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

**Backend (EC2 or ECS):**
- Use Docker containers
- Auto-scaling group
- Load balancer

---

### Option 3: DigitalOcean (Docker Droplet)

```bash
# 1. Create droplet with Docker
# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Clone and deploy
git clone https://github.com/cycha/himo.git
cd himo
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Environment Variables

### Required Variables

**API (.env):**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/himo
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

**Client (.env):**
```env
VITE_API_URL=https://your-api-domain.com
```

### Generating Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use openssl
openssl rand -hex 64
```

---

## 🔒 SSL/HTTPS Setup

### With Docker + Let's Encrypt

**1. Install Certbot:**
```bash
docker-compose -f docker-compose.prod.yml down
```

**2. Update nginx.conf:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Rest of config...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**3. Update docker-compose.prod.yml:**
```yaml
client:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./certbot/conf:/etc/letsencrypt
    - ./certbot/www:/var/www/certbot
```

---

## 📊 Monitoring

### Health Checks

**API Health Endpoint:**
```bash
curl http://localhost:3000/health
```

**Frontend Health:**
```bash
curl http://localhost/
```

### Docker Container Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow specific service
docker-compose -f docker-compose.prod.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

---

## 🔧 Maintenance

### Backup MongoDB

```bash
# Backup
docker exec himo-mongo mongodump --out=/backup

# Copy to host
docker cp himo-mongo:/backup ./mongodb-backup

# Restore
docker exec himo-mongo mongorestore /backup
```

### Update Application

```bash
# Pull latest code
git pull origin master

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Or rebuild specific service
docker-compose -f docker-compose.prod.yml up -d --build client
```

### Clean Up

```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.prod.yml down -v

# Prune unused images
docker image prune -a
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs service-name

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart service
docker-compose -f docker-compose.prod.yml restart service-name
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker exec himo-mongo mongosh --eval "db.adminCommand('ping')"

# Check connection string
docker exec himo-api env | grep MONGODB_URI
```

### Nginx 502 Bad Gateway

- Check API is running: `docker ps`
- Check API logs: `docker logs himo-api`
- Verify network: `docker network inspect himo_app-network`

---

## 📈 Performance Optimization

### Enable CDN
- CloudFlare (free SSL + CDN)
- AWS CloudFront
- Fastly

### Database Indexing
```javascript
// Ensure indexes are created
db.ads.createIndex({ price: 1 })
db.ads.createIndex({ location: "2dsphere" })
db.users.createIndex({ email: 1 }, { unique: true })
```

### Nginx Caching
Already configured in `nginx.conf`:
- Static assets: 1 year cache
- Gzip compression enabled
- Security headers added

---

## ✅ Production Checklist

Before deploying:

- [ ] Environment variables set
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB has authentication (if exposed)
- [ ] SSL/HTTPS configured
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Health checks working
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Domain DNS configured
- [ ] Firewall rules set

---

## 🆘 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Check [Docker Guide](DOCKER_GUIDE.md)
4. Open GitHub issue

---

**Last Updated:** November 2025
