-- Complete fix for user profile creation issue
-- This will ensure profiles are created properly during registration

-- First, let's check and fix the user_profiles table structure
-- Add any missing columns that might be needed
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Drop existing trigger and function to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user triggered for user: %, metadata: %', NEW.email, NEW.raw_user_meta_data;
  
  -- Check if this email was previously deleted
  IF EXISTS(SELECT 1 FROM public.deleted_users WHERE email = NEW.email) THEN
    RAISE WARNING 'Attempted to create profile for deleted email: %', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Insert a new profile for the user
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    location,
    current_job_title,
    company_name,
    industry,
    profile_completion,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'fullName',
      split_part(NEW.email, '@', 1)
    ),
    CASE 
        -- Handle both underscore and hyphen formats
        WHEN NEW.raw_user_meta_data->>'role' IN ('job-seeker', 'job_seeker') THEN 'job_seeker'
        WHEN NEW.raw_user_meta_data->>'role' = 'employer' THEN 'employer'
        ELSE 'job_seeker'
    END,
    NEW.raw_user_meta_data->>'location',
    COALESCE(
      NEW.raw_user_meta_data->>'current_job_title',
      NEW.raw_user_meta_data->>'currentJobTitle'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'companyName'
    ),
    NEW.raw_user_meta_data->>'industry',
    0,
    NOW(),
    NOW()
  );
  
  RAISE LOG 'User profile created successfully for: %', NEW.email;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it with the metadata
    RAISE LOG 'Profile exists, updating for user: %', NEW.email;
    UPDATE public.user_profiles 
    SET 
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'fullName',
        full_name
      ),
      role = CASE 
          WHEN NEW.raw_user_meta_data->>'role' IN ('job-seeker', 'job_seeker') THEN 'job_seeker'
          WHEN NEW.raw_user_meta_data->>'role' = 'employer' THEN 'employer'
          ELSE role
      END,
      location = COALESCE(NEW.raw_user_meta_data->>'location', location),
      current_job_title = COALESCE(
        NEW.raw_user_meta_data->>'current_job_title',
        NEW.raw_user_meta_data->>'currentJobTitle',
        current_job_title
      ),
      company_name = COALESCE(
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'companyName',
        company_name
      ),
      industry = COALESCE(NEW.raw_user_meta_data->>'industry', industry),
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
    
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Failed to create user profile for %: % - %', NEW.email, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Enable logging to see trigger execution (optional - for debugging)
-- You can disable this later by setting log_min_messages to 'warning'
SET log_min_messages TO 'log';

-- Test the function with a sample (this won't actually create a user, just tests the logic)
-- You can uncomment this to test, but it's not necessary
-- DO $$
-- DECLARE
--   test_user_id UUID := gen_random_uuid();
--   test_metadata JSONB := '{"full_name": "Test User", "role": "job_seeker", "location": "Test City"}';
-- BEGIN
--   RAISE LOG 'Testing profile creation logic with metadata: %', test_metadata;
-- END $$;
