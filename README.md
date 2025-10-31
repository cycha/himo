# 🏠 Himo - Real Estate Aggregator

**A world-class, production-ready full-stack TypeScript application**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000.svg)](https://ui.shadcn.com/)

> A modern real estate search platform for the French market, built with enterprise-level architecture and 2025's most modern tech stack.

---

## ✨ Highlights

- 🏗️ **Clean Architecture** - SOLID principles, Repository pattern, Dependency Injection
- ⚡ **Lightning Fast** - Vite build tool, 90% faster than Create React App
- 🎨 **Modern Design** - shadcn/ui + Tailwind CSS (58% smaller bundle than Ant Design)
- 🔒 **Production Ready** - 0 vulnerabilities, JWT auth, bcrypt hashing
- 📦 **Optimized** - 221 packages (was 1,484), 371 KB bundle (was 877 KB)
- 📚 **Well Documented** - 4,000+ lines of comprehensive documentation

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/cycha/himo.git
cd himo

# Install dependencies
npm install

# Start MongoDB
mongod

# Seed database (optional)
npm run seed --workspace=api

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
- **[Commit Guide](docs/guides/COMMIT_GUIDE.md)** - Git workflow

### 🔄 Migration Stories
- **[Vite Migration](docs/migration/VITE_MIGRATION.md)** - CRA → Vite (90% faster!)
- **[TypeScript Migration](docs/migration/MIGRATION_GUIDE.md)** - JS → TS

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
- **MongoDB + Mongoose** - Database
- **JWT + bcrypt** - Authentication (12 rounds)
- **Clean Architecture** - SOLID principles

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📊 Project Statistics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Dependencies** | 1,484 | 221 | ↓ 85% |
| **Bundle Size** | 877 KB | 371 KB | ↓ 58% |
| **Dev Server** | 30-60s | 2-3s | ↓ 90% |
| **Build Time** | 45-90s | 1.5s | ↓ 98% |
| **Vulnerabilities** | 211 | 0 | ↓ 100% |

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

### Recommended Platforms
- **Frontend:** Vercel, Netlify, AWS S3
- **Backend:** Railway, Heroku, AWS EC2
- **Database:** MongoDB Atlas

---

## 📈 Performance

### Build Performance
- **Development:** Hot reload in <50ms
- **Production Build:** 1.5 seconds
- **Bundle Size:** 371 KB (gzip: 117 KB)

### Lighthouse Scores (Target)
- **Performance:** 95+
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 90+

---

## 🧪 Testing

### Manual Testing
1. ✅ User signup and login
2. ✅ Property search with filters
3. ✅ Dashboard access
4. ✅ Responsive design

### Future: Automated Testing
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] API tests (Supertest)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 💼 Portfolio Highlights

### Why This Project Stands Out

1. **Enterprise Architecture**
   - Clean Architecture with SOLID principles
   - Repository pattern for data access
   - Dependency injection for testability

2. **Modern Tech Stack**
   - React 19 (latest)
   - Vite 7 (fastest build tool)
   - shadcn/ui (2025's standard)

3. **Performance Focused**
   - 85% fewer dependencies
   - 58% smaller bundle
   - 90% faster dev experience

4. **Production Ready**
   - Comprehensive security
   - Error handling
   - Logging and monitoring ready

5. **Well Documented**
   - 4,000+ lines of documentation
   - Architecture diagrams
   - Code examples

---

## 🤝 Contributing

Contributions are welcome! Please read the [Commit Guide](docs/guides/COMMIT_GUIDE.md) for our workflow.

---

## 📝 License

This project is for portfolio purposes.

---

## 👨‍💻 Author

**GitHub:** [cycha](https://github.com/cycha)

---

## 📞 Support

For questions or issues:
1. Check the [Documentation](docs/README.md)
2. Review [Architecture guides](docs/architecture/)
3. Open an issue on GitHub

---

## 🌟 Show Your Support

If you found this project helpful, please give it a ⭐️ on GitHub!

---

**Built with ❤️ using world-class architecture and modern best practices**

**Last Updated:** November 2025 | **Version:** 2.0.0
