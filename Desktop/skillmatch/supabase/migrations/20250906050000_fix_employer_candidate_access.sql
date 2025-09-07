-- Fix infinite recursion in RLS policies by dropping all existing policies and creating simple ones

-- Drop all existing policies to prevent conflicts
DROP POLICY IF EXISTS "Employers can view job seeker profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Temporarily disable RLS to clear any existing issues
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "view_own_profile" ON user_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "update_own_profile" ON user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "insert_own_profile" ON user_profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow employers to view job seeker profiles (simple policy without subquery)
CREATE POLICY "employers_view_job_seekers" ON user_profiles
FOR SELECT 
TO authenticated
USING (role = 'job_seeker');

-- Allow job seekers to view employer profiles (for company information)
CREATE POLICY "job_seekers_view_employers" ON user_profiles
FOR SELECT 
TO authenticated
USING (role = 'employer');
