# 🏠 Himo - Real Estate Aggregator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000.svg)](https://ui.shadcn.com/)

> A modern real estate search platform for the French market, built with enterprise-level architecture and 2025's most modern tech stack.

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/cycha/himo.git
cd himo

# Install dependencies
npm install

# Start PostgreSQL (with Docker)
docker-compose up -d postgres

# Run migrations
cd api && npx prisma migrate deploy

# Start backend (terminal 1)
npm run dev:api

# Start frontend (terminal 2)
npm run dev:client
```

**Access the app:** http://localhost:3001

**📖 Detailed setup:** See [Getting Started Guide](docs/guides/GETTING_STARTED.md)

---

## 📚 Documentation

### 🎯 Essential Reading

- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Complete overview, tech stack, statistics
- **[Documentation Index](docs/README.md)** - Full documentation catalog

### 🏗️ Architecture (For Developers)

- **[Backend Architecture](docs/architecture/ARCHITECTURE.md)** - Clean Architecture, SOLID, Repository pattern
- **[Frontend Architecture](docs/architecture/FRONTEND_ARCHITECTURE.md)** - React patterns, hooks, feature structure
- **[Design System](docs/architecture/DESIGN_SYSTEM.md)** - shadcn/ui + Tailwind CSS guide

### 📖 Guides

- **[Getting Started](docs/guides/GETTING_STARTED.md)** - Installation and setup
- **[Docker Guide](docs/guides/DOCKER_GUIDE.md)** - Running with Docker

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with new features
- **TypeScript 5** - Full type safety
- **Vite 7** - Lightning-fast build tool
- **shadcn/ui** - 2025's most modern design system
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **React Router 6** - Client-side routing

### Backend

- **Node.js + Express** - Web server
- **TypeScript 5** - Type-safe backend
- **PostgreSQL + Prisma** - Database with PostGIS
- **JWT + bcrypt** - Authentication (12 rounds)
- **Clean Architecture** - SOLID principles

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 🏗️ Project Structure

```
himo/
├── api/                    # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # HTTP request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── dtos/         # Data transfer objects
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── components/    # Shared components
│   │   │   └── ui/       # shadcn/ui components
│   │   ├── hooks/        # Custom hooks
│   │   ├── context/      # React Context
│   │   └── services/     # API client
│   └── package.json
│
├── bot/                    # Web scraper (TypeScript)
├── commons/                # Shared code (types, models)
├── docs/                   # Documentation (4,000+ lines)
└── docker-compose.yml
```

---

## 🎯 Features

### User Features

- 🔐 User authentication (signup/login with JWT)
- 🔍 Advanced property search with filters
- 🏠 Real estate listings from multiple sources
- 📱 Responsive, modern UI
- 🌙 Dark mode ready

### Technical Features

- ⚡ Lightning-fast Vite dev server (<50ms HMR)
- 🎨 100% shadcn/ui design system
- 🔒 Secure authentication (JWT + bcrypt)
- 📦 Optimized bundle (371 KB)
- 🧪 Type-safe throughout (TypeScript 5)
- 🐳 Docker support
- 📚 Comprehensive documentation

---

## 🔐 Security

- ✅ JWT authentication with HTTP-only cookies
- ✅ bcrypt password hashing (12 rounds)
- ✅ Helmet for security headers
- ✅ Rate limiting for API endpoints
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Environment variables for secrets

---

## 🚢 Deployment

### Docker (Recommended)

```bash
docker-compose up
```

### Manual Deployment

See [Getting Started Guide](docs/guides/GETTING_STARTED.md) for detailed instructions.

**Last Updated:** November 2025 | **Version:** 2.0.0
