-- Initialize PostGIS extension in the himo database
-- This runs during container startup to ensure PostGIS is available
-- when Prisma migrations execute

-- Connect to the himo database and create the extension
\c himo
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

-- Verify extension is loaded
SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';
