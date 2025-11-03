# Himo Architecture Documentation

## 🏗️ Clean Architecture Implementation

This project follows **Clean Architecture** principles with clear separation of concerns and **SOLID** principles.

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│              (Controllers - HTTP/API)                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Business Logic Layer               │
│                    (Services)                        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Data Access Layer                  │
│                   (Repositories)                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Data Layer                         │
│              (Database - PostgreSQL)                    │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

```
api/src/
├── controllers/      # HTTP request/response handling
│   ├── ad.controller.ts
│   └── user.controller.ts
├── services/        # Business logic
│   ├── ad.service.ts
│   └── user.service.ts
├── repositories/    # Data access abstraction
│   ├── ad.repository.ts
│   └── user.repository.ts
├── dtos/           # Data Transfer Objects
│   ├── ad.dto.ts
│   └── user.dto.ts
├── middleware/     # Cross-cutting concerns
│   ├── auth.ts
│   ├── validation.ts
│   └── error-handler.ts
├── routes/         # Route definitions
│   ├── ad.routes.ts
│   ├── user.routes.ts
│   └── index.ts
└── server.ts       # Application entry point
```

## Layer Responsibilities

### 1. Controllers (Presentation Layer)
**Responsibility:** Handle HTTP requests and responses

```typescript
export class AdController {
  constructor(private readonly service = adService) {}

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const searchDto: SearchAdDto = req.body;
      const result = await this.service.search(searchDto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

**Rules:**
- ✅ Handle HTTP requests/responses
- ✅ Validate input (with middleware)
- ✅ Call service methods
- ✅ Format responses
- ❌ No business logic
- ❌ No database access

### 2. Services (Business Logic Layer)
**Responsibility:** Implement business rules and orchestrate operations

```typescript
export class AdService implements IAdService {
  constructor(private readonly repository = adRepository) {}

  async search(searchDto: SearchAdDto): Promise<SearchResultDto> {
    const query = this.buildSearchQuery(searchDto);
    const [ads, totalCount] = await Promise.all([
      this.repository.findWithFilters(query, page),
      this.repository.count(query),
    ]);
    return { success: true, data: ads, count: ads.length };
  }

  private buildSearchQuery(searchDto: SearchAdDto) {
    // Business logic for building queries
  }
}
```

**Rules:**
- ✅ Business logic
- ✅ Data transformation
- ✅ Orchestrate repository calls
- ✅ Implement interfaces
- ❌ No HTTP concerns
- ❌ No direct database access

### 3. Repositories (Data Access Layer)
**Responsibility:** Abstract database operations

```typescript
export class AdRepository {
  async findWithFilters(query: FilterQuery, page: number): Promise<any[]> {
    return Ad.find(query)
      .sort('-release_date')
      .skip(page * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .lean()
      .exec();
  }

  async findById(id: string): Promise<any | null> {
    return Ad.findById(id).lean().exec();
  }
}
```

**Rules:**
- ✅ Database queries
- ✅ CRUD operations
- ✅ Query optimization
- ❌ No business logic
- ❌ No HTTP concerns

### 4. DTOs (Data Transfer Objects)
**Responsibility:** Define data contracts between layers

```typescript
export interface SearchAdDto {
  title?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
}

export interface SearchResultDto {
  success: boolean;
  data: AdResponseDto[];
  page: number;
  count: number;
}
```

**Rules:**
- ✅ Type definitions
- ✅ Data contracts
- ✅ Validation schemas
- ❌ No logic

## SOLID Principles Applied

### S - Single Responsibility Principle
Each class has one responsibility:
- **Controllers**: HTTP handling
- **Services**: Business logic
- **Repositories**: Data access

### O - Open/Closed Principle
Classes are open for extension, closed for modification:
```typescript
export interface IAdService {
  search(dto: SearchAdDto): Promise<SearchResultDto>;
}

export class AdService implements IAdService {
  // Implementation can be extended without modifying the interface
}
```

### L - Liskov Substitution Principle
Interfaces can be substituted with implementations:
```typescript
// Can inject any implementation of IAdService
constructor(private readonly service: IAdService) {}
```

### I - Interface Segregation Principle
Specific interfaces instead of one general interface:
```typescript
export interface IAdService {
  search(dto: SearchAdDto): Promise<SearchResultDto>;
  getById(id: string): Promise<AdResponseDto | null>;
}

export interface IUserService {
  signup(dto: SignupDto): Promise<AuthResponseDto>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
}
```

### D - Dependency Inversion Principle
Depend on abstractions, not concretions:
```typescript
// Service depends on repository interface
export class AdService {
  constructor(private readonly repository = adRepository) {}
}
```

## Design Patterns Used

### 1. Repository Pattern
Abstracts data access logic:
```typescript
// Instead of:
const ads = await Ad.find(query).exec();

// We use:
const ads = await adRepository.findWithFilters(query, page);
```

**Benefits:**
- ✅ Testability (easy to mock)
- ✅ Maintainability (single place to change queries)
- ✅ Flexibility (easy to switch databases)

### 2. Dependency Injection
```typescript
export class AdService {
  constructor(private readonly repository = adRepository) {}
}

// Can inject mock for testing:
const service = new AdService(mockRepository);
```

### 3. DTO Pattern
```typescript
// Request DTO
interface SearchAdDto {
  priceMin?: number;
  priceMax?: number;
}

// Response DTO
interface SearchResultDto {
  success: boolean;
  data: AdResponseDto[];
}
```

### 4. Singleton Pattern
```typescript
export const adRepository = new AdRepository();
export const adService = new AdService();
```

## Data Flow Example

### Search Ads Flow

```
1. Client Request
   POST /api/ads/search
   { "priceMax": 300000 }
          ↓
2. Route Handler
   → ad.routes.ts validates input
          ↓
3. Controller
   → AdController.search()
   → Extracts SearchAdDto from request
          ↓
4. Service
   → AdService.search(searchDto)
   → Builds query with business logic
   → Orchestrates repository calls
          ↓
5. Repository
   → AdRepository.findWithFilters(query)
   → Executes database query
          ↓
6. Database
   → PostgreSQL returns results
          ↓
7. Response
   ← Service transforms to SearchResultDto
   ← Controller sends JSON response
```

## Testing Strategy

### Unit Tests
Test each layer independently:

```typescript
// Service test with mocked repository
describe('AdService', () => {
  it('should search ads', async () => {
    const mockRepo = {
      findWithFilters: jest.fn().mockResolvedValue(mockAds),
      count: jest.fn().mockResolvedValue(10),
    };
    
    const service = new AdService(mockRepo);
    const result = await service.search({ priceMax: 300000 });
    
    expect(result.data).toHaveLength(5);
  });
});
```

### Integration Tests
Test multiple layers:

```typescript
describe('Ad Search API', () => {
  it('should return ads under 300k', async () => {
    const response = await request(app)
      .post('/api/ads/search')
      .send({ priceMax: 300000 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Benefits of This Architecture

### 1. Testability
- Easy to mock dependencies
- Unit test each layer independently
- No database needed for service tests

### 2. Maintainability
- Clear separation of concerns
- Easy to find and fix bugs
- Changes isolated to specific layers

### 3. Scalability
- Easy to add new features
- Can replace layers independently
- Can switch databases without changing business logic

### 4. Team Collaboration
- Multiple developers can work on different layers
- Clear contracts between layers
- Reduced merge conflicts

### 5. Code Reusability
- Services can be used by different controllers
- Repositories can be shared across services
- DTOs define clear interfaces

## Migration Path (Before → After)

### Before (Tightly Coupled)
```typescript
// Controller directly accessing database
async search(req, res) {
  const ads = await Ad.find({ price: { $lte: req.body.priceMax } })
    .sort('-release_date')
    .exec();
  res.json({ ads });
}
```

### After (Clean Architecture)
```typescript
// Controller → Service → Repository → Database
class AdController {
  async search(req, res) {
    const result = await this.service.search(req.body);
    res.json(result);
  }
}

class AdService {
  async search(dto: SearchAdDto) {
    const query = this.buildQuery(dto);
    return await this.repository.findWithFilters(query);
  }
}

class AdRepository {
  async findWithFilters(query) {
    return Ad.find(query).sort('-release_date').exec();
  }
}
```

## Best Practices

### 1. Always Use DTOs
```typescript
// ❌ Don't pass request directly
service.search(req.body);

// ✅ Use typed DTOs
const searchDto: SearchAdDto = req.body;
service.search(searchDto);
```

### 2. Keep Controllers Thin
```typescript
// ❌ Don't put logic in controllers
async search(req, res) {
  if (req.body.priceMin > req.body.priceMax) {
    return res.status(400).json({ error: 'Invalid range' });
  }
  // ...business logic...
}

// ✅ Move logic to services
async search(req, res) {
  const result = await this.service.search(req.body);
  res.json(result);
}
```

### 3. Use Interfaces
```typescript
// ✅ Define interfaces for services
export interface IAdService {
  search(dto: SearchAdDto): Promise<SearchResultDto>;
}

// ✅ Implement the interface
export class AdService implements IAdService {
  // ...
}
```

### 4. Handle Errors Properly
```typescript
// ✅ Let errors bubble up to error handler
async search(req, res, next) {
  try {
    const result = await this.service.search(req.body);
    res.json(result);
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
}
```

## Conclusion

This architecture provides:
- ✅ **Clean separation of concerns**
- ✅ **Easy testing and mocking**
- ✅ **SOLID principles**
- ✅ **Scalable and maintainable**
- ✅ **Industry best practices**
- ✅ **Portfolio-ready code**

Perfect for demonstrating advanced software engineering skills to potential employers!
