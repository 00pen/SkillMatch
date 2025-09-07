-- Debug queries to check database state
-- Run these in your Supabase SQL Editor to diagnose the issue

-- 1. Check if the trigger function exists and its current definition
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user'
AND n.nspname = 'public';

-- 2. Check if the trigger exists
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- 3. Check current user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Check recent user registrations and their metadata
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check corresponding profiles
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.created_at,
    au.raw_user_meta_data
FROM public.user_profiles up
RIGHT JOIN auth.users au ON up.id = au.id
ORDER BY au.created_at DESC 
LIMIT 5;
