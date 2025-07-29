-- Initialize database for local development
-- This file is used by Docker Compose to set up the local PostgreSQL database

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create basic database structure for local development
-- Note: In production, use Supabase migrations instead

-- This is just a placeholder for local development
-- The actual schema should be managed through Supabase migrations