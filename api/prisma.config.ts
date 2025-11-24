import { defineConfig, env } from 'prisma/config';

// Try to load dotenv if available (for development)
try {
  require('dotenv/config');
} catch {
  // dotenv not available, environment variables should be set externally
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
