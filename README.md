# HIMO - Real Estate Aggregator 🏠

A modern, full-stack real estate ad aggregator for the French market. This project showcases best practices in TypeScript, Node.js, React, and MongoDB development.

## 🏗️ Architecture

This is a **monorepo** containing 4 packages:

- **`@himo/commons`** - Shared TypeScript types, Mongoose models, and utilities
- **`@himo/api`** - REST API built with Express and TypeScript
- **`@himo/bot`** - Web scraper for aggregating real estate ads from French websites
- **`@himo/client`** - React SPA with modern UI (TypeScript + hooks)

## 🚀 Features

- **Real-time scraping** from major French real estate websites (LeBonCoin, SeLoger, etc.)
- **Advanced search** with filters (price, surface, location, property type)
- **Geospatial queries** using MongoDB's 2dsphere indexes
- **User authentication** with JWT and bcrypt
- **Rate limiting** and security headers
- **Full TypeScript** with strict typing across the entire stack
- **Docker support** for easy deployment

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0
- **Docker** (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd himo
```

### 2. Install dependencies
```bash
npm install
```

This will install all dependencies for the monorepo and all workspaces.

### 3. Set up environment variables

Create `.env` files in each module:

**`api/.env`**
```env
API_PORT=3000
MONGODB_URL=mongodb://localhost:27017/himo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

**`bot/.env`**
```env
MONGODB_URL=mongodb://localhost:27017/himo
SCRAPING_INTERVAL=*/2 5-22 * * *
```

**`client/.env`**
```env
REACT_APP_API_URL=http://localhost:3000
```

### 4. Build the TypeScript projects
```bash
npm run build
```

## 🏃 Running the Application

### Development Mode

Run each service in development mode with hot-reload:

```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Bot
npm run dev:bot

# Terminal 3 - Client
npm run dev:client
```

### Production Mode

```bash
# Build all packages
npm run build

# Start services
npm run start:api
npm run start:bot
npm run start:client
```

## 🐳 Docker Deployment

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📦 Project Structure

```
himo/
├── api/                    # REST API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── services/      # Business logic layer
│   │   └── server.ts      # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── bot/                    # Web scraper
│   ├── src/
│   │   ├── scrappers/     # Site-specific scrapers
│   │   ├── tasks/         # Cron job definitions
│   │   ├── utils/         # Helper functions
│   │   └── index.ts       # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API client
│   │   └── App.tsx
│   └── package.json
│
├── commons/                # Shared package
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Database connection, etc.
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml      # Docker configuration
├── tsconfig.json           # Root TypeScript config
└── package.json            # Monorepo root
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=api
npm test --workspace=bot
npm test --workspace=client
```

## 🔧 Development Scripts

```bash
# Type checking (no emit)
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean

# Watch mode for TypeScript compilation
npm run build:watch
```

## 🗄️ Database Schema

### Ad Collection
```typescript
{
  title: string;
  description: string;
  url: string;
  price: number;
  surface?: number;
  rooms?: number;
  real_estate_type?: 'appartement' | 'maison' | 'terrain';
  provider: 'leboncoin' | 'seloger' | 'pap';
  location: {
    city?: string;
    zipcode: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  release_date: Date;
}
```

### User Collection
```typescript
{
  email: string;
  password: string; // bcrypt hashed
  created_at: Date;
}
```

## 🔐 Security

- **Password hashing** with bcrypt (12 salt rounds)
- **JWT authentication** with configurable expiration
- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration
- **Input validation** with express-validator
- **Environment variables** for sensitive data

## 🚧 Migration from JavaScript

This project has been migrated from JavaScript to TypeScript with the following improvements:

### Before
- ❌ No type safety
- ❌ Weak password hashing (password-hash)
- ❌ Missing security headers
- ❌ No input validation
- ❌ Direct model access in controllers
- ❌ Outdated dependencies

### After
- ✅ Full TypeScript with strict mode
- ✅ Strong password hashing (bcrypt)
- ✅ Helmet + rate limiting
- ✅ Zod/express-validator for validation
- ✅ Service layer architecture
- ✅ Modern, up-to-date dependencies
- ✅ Comprehensive error handling
- ✅ ESLint + Prettier

## 📈 Performance Optimizations

- MongoDB indexes for fast queries
- Connection pooling
- Geospatial indexes for location-based searches
- Text indexes for full-text search

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Charly Joulie**  
Full-Stack Developer

---

Built with ❤️ using TypeScript, Node.js, React, and MongoDB
