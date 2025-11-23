# Himo API Documentation

This document provides information about the Himo API and its OpenAPI specification.

## OpenAPI Specification

The API is fully documented using the OpenAPI 3.0 specification. The specification file is located at `api/openapi.yaml`.

## Accessing the API Documentation

Once the API server is running, you can access the interactive API documentation in several ways:

### Interactive Swagger UI

Visit the Swagger UI interface in your browser:

```
http://localhost:3000/api/docs
```

This provides an interactive interface where you can:
- Browse all available endpoints
- View request/response schemas
- Test API endpoints directly from the browser
- See detailed examples and descriptions

### OpenAPI Specification Files

You can also download the OpenAPI specification in different formats:

**JSON Format:**
```
http://localhost:3000/api/docs/json
```

**YAML Format:**
```
http://localhost:3000/api/docs/yaml
```

## API Overview

The Himo API provides the following main functionalities:

### 1. Health Check
- `GET /api/health` - Check if the API is running

### 2. User Management
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login and receive JWT token
- `GET /api/users/profile` - Get authenticated user profile (requires authentication)

### 3. Real Estate Ads
- `GET /api/ads/search` - Search for ads with filters
- `POST /api/ads/search` - Search for ads (POST method for complex queries)
- `GET /api/ads/:id` - Get a specific ad by ID

### 4. Bot Management (all require authentication)
- `GET /api/bot/status` - Get current bot status
- `GET /api/bot/stats` - Get bot statistics
- `POST /api/bot/cron/start` - Start the cron scheduler
- `POST /api/bot/cron/stop` - Stop the cron scheduler
- `POST /api/bot/trigger` - Manually trigger a scraping task
- `POST /api/bot/stop` - Stop the currently running bot

## Authentication

Most endpoints require JWT authentication. To authenticate:

1. **Register or Login** using `/api/users/signup` or `/api/users/login`
2. **Receive a JWT token** in the response
3. **Include the token** in subsequent requests using the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example: Login and Make Authenticated Request

```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response will include a token
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "id": "550e8400-...",
#     "email": "user@example.com",
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }

# Use the token for authenticated requests
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## API Usage Examples

### Search for Ads

**GET Request (RESTful approach):**
```bash
curl -X GET "http://localhost:3000/api/ads/search?city=Paris&priceMin=100000&priceMax=500000&type=appartement"
```

**POST Request (complex queries):**
```bash
curl -X POST http://localhost:3000/api/ads/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "priceMin": 100000,
    "priceMax": 500000,
    "type": "appartement",
    "surfaceMin": 50,
    "page": 0
  }'
```

### Get Ad by ID

```bash
curl -X GET http://localhost:3000/api/ads/550e8400-e29b-41d4-a716-446655440000
```

### Trigger Bot Scraping

```bash
curl -X POST http://localhost:3000/api/bot/trigger \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Data Models

### Real Estate Types
- `appartement` - Apartment
- `maison` - House
- `terrain` - Land
- `parking` - Parking space
- `local-commercial` - Commercial property

### Property Condition
- `neuf` - New property
- `ancien` - Old property

### Providers
- `leboncoin` - Leboncoin
- `seloger` - SeLoger
- `pap` - PAP (Particulier à Particulier)
- `bienici` - Bien'ici

### Bot Run Status
- `running` - Bot is currently running
- `completed` - Bot completed successfully
- `failed` - Bot run failed
- `stopped` - Bot was manually stopped

## Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Pagination

Search endpoints support pagination using the `page` parameter (0-indexed):

```bash
# First page (default)
GET /api/ads/search?page=0

# Second page
GET /api/ads/search?page=1
```

The response includes pagination information:
```json
{
  "success": true,
  "data": [...],
  "page": 0,
  "count": 20,
  "totalPages": 5
}
```

## Development

To modify the API documentation:

1. Edit the OpenAPI specification file: `api/openapi.yaml`
2. Restart the development server: `pnpm dev:api`
3. View changes at `http://localhost:3000/api/docs`

## Using the OpenAPI Spec

The OpenAPI specification can be used to:

1. **Generate API clients** for various languages using tools like:
   - [OpenAPI Generator](https://openapi-generator.tech/)
   - [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)

2. **Import into API testing tools**:
   - Postman
   - Insomnia
   - Thunder Client (VS Code extension)

3. **Generate server stubs** for development

4. **Validate API responses** in tests

### Example: Generate TypeScript Client

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i http://localhost:3000/api/docs/json \
  -g typescript-axios \
  -o ./generated-client
```

## Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [API Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)
