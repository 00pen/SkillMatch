-- ============================================================================
-- Manual Extension Migration Script
-- Run this script with SUPERUSER privileges in Supabase SQL Editor
-- ============================================================================

-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension from public schema to extensions schema
-- This requires superuser privileges
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Grant usage on the extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Update any existing indexes that use pg_trgm functions to reference the new schema
-- (This may not be necessary as the extension functions should still work)
