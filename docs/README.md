# 📚 Himo Documentation

Welcome to the Himo documentation! This folder contains comprehensive guides, architecture documentation, and project reports.

---

## 📖 Table of Contents

### 🚀 Getting Started
- **[Getting Started Guide](guides/GETTING_STARTED.md)** - Installation and setup
- **[Docker Guide](guides/DOCKER_GUIDE.md)** - Running with Docker
- **[Raspberry Pi Deployment](guides/RASPBERRY_PI_DEPLOYMENT.md)** - Deploy on Raspberry Pi with public access
- **[Production Deployment](guides/PRODUCTION_DEPLOYMENT.md)** - Cloud deployment guide
- **[Commit Guide](guides/COMMIT_GUIDE.md)** - Git workflow and conventions

### 🤖 Scraping & Automation
- **[Scraping Guide](guides/SCRAPING_GUIDE.md)** - Advanced web scraping with Playwright
- **[Xvfb Guide](guides/XVFB_GUIDE.md)** - Virtual display for non-headless scraping

### 🏗️ Architecture
- **[System Architecture](architecture/ARCHITECTURE.md)** - Clean Architecture, SOLID principles, Repository pattern
- **[Design System](architecture/DESIGN_SYSTEM.md)** - shadcn/ui + Tailwind CSS guide

---

## 📂 Documentation Structure

```
docs/
├── README.md                          # This file - Documentation index
│
├── architecture/                      # System architecture
│   ├── ARCHITECTURE.md               # Clean Architecture, SOLID principles
│   └── DESIGN_SYSTEM.md              # shadcn/ui + Tailwind CSS
│
└── guides/                           # How-to guides
    ├── GETTING_STARTED.md           # Quick start guide
    ├── DOCKER_GUIDE.md              # Docker setup
    ├── RASPBERRY_PI_DEPLOYMENT.md   # Raspberry Pi deployment
    ├── PRODUCTION_DEPLOYMENT.md     # Cloud deployment
    ├── SCRAPING_GUIDE.md            # Playwright scraping
    ├── XVFB_GUIDE.md                # Virtual display setup
    └── COMMIT_GUIDE.md              # Git conventions
```

---

## 📊 Documentation Statistics

- **Total Files:** 11
- **Guides:** 7
- **Architecture Docs:** 2

---

## 🎯 For Different Audiences

### 👨‍💻 For Developers
1. **[Getting Started](guides/GETTING_STARTED.md)** - Set up the project locally
2. **[System Architecture](architecture/ARCHITECTURE.md)** - Understand the architecture
3. **[Design System](architecture/DESIGN_SYSTEM.md)** - Learn the UI patterns
4. **[Scraping Guide](guides/SCRAPING_GUIDE.md)** - Advanced scraping techniques

### 🔧 For DevOps / Self-Hosting
1. **[Raspberry Pi Deployment](guides/RASPBERRY_PI_DEPLOYMENT.md)** - Deploy on Raspberry Pi
2. **[Docker Guide](guides/DOCKER_GUIDE.md)** - Docker setup
3. **[Production Deployment](guides/PRODUCTION_DEPLOYMENT.md)** - Cloud deployment

### 🎨 For Designers
1. **[Design System](architecture/DESIGN_SYSTEM.md)** - UI components and patterns
2. **[Getting Started](guides/GETTING_STARTED.md)** - Run the project locally

---

## 🌟 Highlights

### Backend Excellence
- ✅ **Clean Architecture** with Repository pattern
- ✅ **SOLID Principles** throughout
- ✅ **Dependency Injection** for testability
- ✅ **DTOs** for type-safe data transfer

### Frontend Modern Stack
- ✅ **React 19** with TypeScript 5
- ✅ **Vite** for lightning-fast builds
- ✅ **shadcn/ui** - 2025's best design system
- ✅ **Feature-based** architecture

### Performance
- ✅ **85% fewer dependencies** (1,484 → 221)
- ✅ **58% smaller bundle** (877 KB → 371 KB)
- ✅ **90% faster dev server** (30-60s → 2-3s)
- ✅ **0 vulnerabilities** in core

---

## 📝 Contributing to Documentation

When adding new documentation:

1. **Place it in the correct folder:**
   - Architecture → `architecture/`
   - Guides → `guides/`
   - Migrations → `migration/`
   - Reports → `reports/`

2. **Update this README** with a link to your new document

3. **Follow the format:**
   - Use clear headings
   - Include code examples
   - Add diagrams where helpful
   - Keep it concise but comprehensive

---

## 🔗 Quick Links

- **[Main README](../README.md)** - Project root
- **[GitHub Repository](https://github.com/cycha/himo)** - Source code
- **[Backend Code](../api/)** - Backend source
- **[Frontend Code](../client/)** - Frontend source

---

## 💡 Tips

- Use `Ctrl/Cmd + F` to search within documents
- All code examples are copy-pastable
- Documentation is kept up-to-date with the codebase
- For Raspberry Pi deployment, see the detailed guide

---

**Last Updated:** November 2025  
**Documentation Version:** 2.0.1
