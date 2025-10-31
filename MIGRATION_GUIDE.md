# Migration Guide: JavaScript to TypeScript

This guide explains how to migrate from the old JavaScript codebase to the new TypeScript architecture.

## 🎯 Overview

The project has been completely restructured with:
- **Full TypeScript** support across all modules
- **Modern architecture** with separation of concerns
- **Updated dependencies** with security improvements
- **Better error handling** and validation
- **Improved code organization** and maintainability

## 📁 New Project Structure

```
himo/
├── commons/               # Shared package
│   └── src/
│       ├── models/       # Mongoose models (was: schema/)
│       ├── types/        # TypeScript interfaces (NEW)
│       └── utils/        # DB connection & utilities
│
├── api/                  # REST API
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── services/     # Business logic (NEW)
│       ├── middleware/   # Auth, validation, errors (NEW)
│       ├── routes/       # API routes (NEW)
│       └── server.ts     # Main server file
│
├── bot/                  # Web scraper
│   └── src/
│       ├── scrappers/    # Scraper implementations
│       ├── tasks/        # Cron job tasks
│       ├── types/        # TypeScript interfaces (NEW)
│       └── utils/        # Helper functions
│
└── client/               # React frontend (to be migrated)
```

## 🔄 Key Changes

### 1. File Organization

**Old:**
```
commons/
  db.js
  schema/
    schemaAd.js
    schemaUser.js
```

**New:**
```
commons/src/
  models/
    ad.model.ts
    user.model.ts
  types/
    ad.types.ts
    user.types.ts
  utils/
    db.ts
```

### 2. Imports

**Old (JavaScript):**
```javascript
const db = require('commons/db');
const Ad = require('commons/schema/schemaAd');
```

**New (TypeScript):**
```typescript
import { connect, close, Ad, IAd } from '@himo/commons';
```

### 3. Password Hashing

**Old:**
```javascript
const passwordHash = require('password-hash');
password: passwordHash.generate(password) // WEAK!
```

**New:**
```typescript
import bcrypt from 'bcrypt';
// Auto-hashed in pre-save hook with 12 salt rounds
const user = new User({ email, password });
await user.save(); // Password automatically hashed
```

### 4. JWT Tokens

**Old:**
```javascript
const jwt = require('jwt-simple');
jwt.encode(this, "hardcoded-secret"); // INSECURE!
```

**New:**
```typescript
import jwt from 'jsonwebtoken';
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
```

### 5. API Routes

**Old:**
```javascript
app.post('/search', (req, res) => adController.search(req, res));
app.post('/user/signup', (req, res) => user.signup(req, res));
```

**New:**
```typescript
// Organized routes with validation & error handling
router.post('/ads/search', 
  searchValidation, 
  handleValidationErrors, 
  adController.search
);

router.post('/users/signup',
  signupValidation,
  handleValidationErrors,
  userController.signup
);
```

### 6. Error Handling

**Old:**
```javascript
try {
  return res.status(200).json(ads);
} catch (error) {
  return res.status(500).json({error});
}
```

**New:**
```typescript
try {
  const ads = await adService.search(searchDto, page);
  res.status(200).json({ success: true, data: ads });
} catch (error) {
  next(error); // Handled by centralized error middleware
}
```

## 🚀 Migration Steps

### Step 1: Install Dependencies

```bash
# Root directory
npm install

# This installs all workspace dependencies
```

### Step 2: Set Up Environment Variables

Copy the example files and configure them:

```bash
cp api/.env.example api/.env
cp bot/.env.example bot/.env
cp client/.env.example client/.env
```

Edit each `.env` file with your configuration.

### Step 3: Build TypeScript Projects

```bash
npm run build
```

This compiles all TypeScript modules.

### Step 4: Update MongoDB Connection String

In your `.env` files, update:
```env
MONGODB_URL=mongodb://localhost:27017/himo
```

### Step 5: Update Secret Keys

**IMPORTANT:** Change the JWT secret in `api/.env`:
```env
JWT_SECRET=your-very-secure-random-secret-key-here
```

### Step 6: Test the API

```bash
# Start API in dev mode
npm run dev:api

# Test health endpoint
curl http://localhost:3000/api/health
```

### Step 7: Test the Bot

```bash
# Start bot in dev mode
npm run dev:bot
```

### Step 8: Migrate Existing Data

If you have existing users with old password hashes:

```javascript
// Run this migration script once
const User = require('./commons/dist/models/user.model').User;
const bcrypt = require('bcrypt');

async function migratePasswords() {
  const users = await User.find({});
  
  for (const user of users) {
    // If password doesn't look like a bcrypt hash
    if (!user.password.startsWith('$2')) {
      // User will need to reset password or
      // Set a temporary password and notify them
      const tempPassword = 'TempPassword123!';
      user.password = await bcrypt.hash(tempPassword, 12);
      await user.save();
      console.log(`Migrated user: ${user.email}`);
    }
  }
}
```

## 🔐 Security Improvements

| Feature | Old | New |
|---------|-----|-----|
| Password hashing | `password-hash` (weak) | `bcrypt` with 12 rounds |
| JWT library | `jwt-simple` | `jsonwebtoken` |
| Secret management | Hardcoded | Environment variables |
| CORS | Permissive | Configurable |
| Rate limiting | ❌ None | ✅ Implemented |
| Security headers | ❌ None | ✅ Helmet.js |
| Input validation | ❌ None | ✅ express-validator |

## 📝 API Changes

### Backward Compatibility

Legacy endpoints still work:
- `/search` → redirects to `/api/ads/search`
- `/user/signup` → redirects to `/api/users/signup`
- `/user/login` → redirects to `/api/users/login`

### New Endpoints

```
GET  /api/health          # Health check
POST /api/ads/search      # Search ads
GET  /api/ads/:id         # Get ad by ID
POST /api/users/signup    # Register user
POST /api/users/login     # Login user
GET  /api/users/profile   # Get user profile (requires auth)
```

### Response Format

**Old:**
```json
[{ /* ad data */ }]
```

**New:**
```json
{
  "success": true,
  "data": [{ /* ad data */ }],
  "page": 0,
  "count": 35
}
```

## 🧪 Testing

### Manual Testing

```bash
# Test signup
curl -X POST http://localhost:3000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test search
curl -X POST http://localhost:3000/api/ads/search \
  -H "Content-Type: application/json" \
  -d '{"priceMax":500000,"type":"appartement"}'
```

## 🐛 Common Issues

### Issue: Module not found '@himo/commons'

**Solution:** Build the commons module first:
```bash
cd commons && npm run build
cd .. && npm install
```

### Issue: Database connection failed

**Solution:** Check MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Or Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Issue: TypeScript errors

**Solution:** Clean and rebuild:
```bash
npm run clean
npm run build
```

## 📚 Next Steps

1. ✅ Commons module (COMPLETE)
2. ✅ API module (COMPLETE)
3. ✅ Bot module (COMPLETE)
4. ⏳ Client module (TODO - migrate to TypeScript + React hooks)
5. ⏳ Add comprehensive testing (Jest + Playwright)
6. ⏳ Set up CI/CD pipeline
7. ⏳ Docker optimization with multi-stage builds

## 💡 Best Practices

### TypeScript

- Use interfaces for data structures
- Avoid `any` type when possible
- Enable strict mode in `tsconfig.json`
- Use type guards for runtime checks

### Error Handling

- Always use try-catch in async functions
- Pass errors to `next()` in Express
- Use custom error classes for specific errors
- Log errors with context

### Security

- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Validate all user inputs
- Sanitize data before database operations
- Keep dependencies updated

## 🆘 Need Help?

- Check the README.md for general information
- Review TypeScript documentation
- Check console logs for detailed error messages
- Enable debug mode: `NODE_ENV=development`

---

**Questions?** Open an issue or contact the development team.
