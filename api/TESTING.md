# Testing Guide

This document provides information about the test suite for the Himo API.

## Test Suite Overview

The API includes comprehensive test coverage for all major components:

### Unit Tests
- **Repositories** (`src/repositories/__tests__/`)
  - `user.repository.test.ts` - Tests for user CRUD operations, password hashing, and validation
  - `ad.repository.test.ts` - Tests for ad search, filtering, pagination, and geospatial queries

- **Services** (`src/services/__tests__/`)
  - `user.service.test.ts` - Tests for signup, login, JWT token generation, and user profile retrieval
  - `ad.service.test.ts` - Tests for ad search logic, filter building, and DTO mapping

- **Middleware** (`src/middleware/__tests__/`)
  - `auth.test.ts` - Tests for JWT authentication, token validation, and authorization
  - `validation.test.ts` - Tests for input validation rules (signup, login, search)
  - `error-handler.test.ts` - Tests for error handling, Prisma error mapping, and AppError class

### Integration Tests
- **Routes** (`src/routes/__tests__/`)
  - `user.routes.test.ts` - End-to-end tests for user signup, login, and profile endpoints
  - `ad.routes.test.ts` - End-to-end tests for ad search and retrieval endpoints

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js** 20.x or higher
2. **PostgreSQL** 15+ with PostGIS extension
3. **Environment variables** configured (see `.env.example`)

### Database Setup

1. Create a test database:
```bash
createdb himo_test
```

2. Enable PostGIS extension:
```sql
psql -d himo_test -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

3. Set up the test database URL in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/himo_test?schema=public"
```

4. Run Prisma migrations:
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Watch Mode
```bash
pnpm test -- --watch
```

### Run Specific Test File
```bash
pnpm test user.service.test.ts
```

### Run Tests with Coverage
```bash
pnpm test -- --coverage
```

## Test Structure

### Test Helpers (`src/__tests__/helpers/`)
- `testDb.ts` - Database helpers for creating test data and cleaning up
- `authHelpers.ts` - JWT token generation and validation helpers
- `testApp.ts` - Express app factory for integration tests

### Test Setup (`src/__tests__/setup.ts`)
- Configures test environment variables
- Sets up database connection
- Cleans database between tests
- Disconnects after all tests

### Test Mocks (`src/__tests__/mocks/`)
- `prismaMock.ts` - Mock Prisma client for unit tests (using jest-mock-extended)

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Preset**: `ts-jest` for TypeScript support
- **Environment**: Node.js
- **Coverage**: Configured to collect from all `src/**/*.ts` files except scripts
- **Setup Files**: `src/__tests__/setup.ts` runs before each test file
- **Timeout**: 10 seconds per test

## Writing New Tests

When adding new tests, follow these patterns:

### Unit Tests
```typescript
import { someFunction } from '../someModule';
import { cleanDatabase } from '../../__tests__/helpers/testDb';

describe('SomeModule', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
import request from 'supertest';
import { createTestApp } from '../../__tests__/helpers/testApp';

describe('Some Routes', () => {
  const app = createTestApp();

  it('should return 200', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toMatchObject({ /* expected */ });
  });
});
```

## Test Coverage Areas

### Authentication & Authorization
- User registration with email/password validation
- Login with credential verification
- JWT token generation and validation
- Protected route access control
- Token expiration handling

### Ad Search & Filtering
- Full-text search in title and description
- Filter by real estate type (appartement, maison, terrain, etc.)
- Filter by sell type (neuf, ancien)
- Price range filtering
- Surface area filtering
- Location-based search (city, zipcode, coordinates)
- Pagination with 35 items per page
- Multiple filter combinations

### Data Validation
- Email format validation
- Password length requirements
- Numeric field validation (price, surface, page)
- Required field validation
- Input sanitization

### Error Handling
- AppError class for operational errors
- Prisma error mapping (unique constraints, validation errors)
- Validation error responses (400)
- Authentication errors (401)
- Not found errors (404)
- Conflict errors (409)
- Internal server errors (500)

### Database Operations
- User CRUD operations
- Ad CRUD operations
- Password hashing with bcrypt
- Email case-insensitivity
- Duplicate email prevention
- Transaction handling

## Continuous Integration

The test suite is integrated with GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`):
- Runs on every push and pull request
- Uses PostgreSQL 15 with PostGIS 3.3
- Executes all tests in the suite
- Reports test failures

## Troubleshooting

### Tests Failing Due to Database Connection
Ensure PostgreSQL is running and accessible:
```bash
pg_isready
```

### Prisma Client Not Generated
Run Prisma generate:
```bash
pnpm prisma:generate
```

### Port Already in Use
Tests don't start a server, but if you're running the API locally, stop it first.

### Database Migration Issues
Reset and re-run migrations:
```bash
pnpm prisma:reset
```

## Test Statistics

- **Total Test Files**: 12
- **Total Test Cases**: 200+
- **Coverage Target**: 80%+

## Future Improvements

- [ ] Add performance tests for search queries
- [ ] Add tests for geospatial queries with actual distance calculations
- [ ] Add tests for rate limiting middleware
- [ ] Add load testing with k6 or Artillery
- [ ] Add mutation testing with Stryker
- [ ] Add contract testing for API endpoints
