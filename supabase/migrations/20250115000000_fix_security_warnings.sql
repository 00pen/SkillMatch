-- ============================================================================
-- Fix Supabase Security Warnings
-- This migration addresses all security warnings from Supabase Advisor
-- ============================================================================

-- 1. FIX FUNCTION SEARCH_PATH MUTABLE WARNINGS
-- Add SET search_path = '' to all functions to prevent search path injection attacks

-- Fix delete_user_account function
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSON 
SET search_path = ''
AS $$
DECLARE
    result JSON;
    user_email TEXT;
BEGIN
    -- Check if user exists and is the authenticated user
    IF p_user_id != auth.uid() THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Unauthorized: You can only delete your own account'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Get user email before deletion
    SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
    
    -- Delete user activities (if table exists)
    DELETE FROM activities WHERE user_id = p_user_id;
    
    -- Delete saved jobs
    DELETE FROM saved_jobs WHERE user_id = p_user_id;
    
    -- Delete job applications
    DELETE FROM applications WHERE user_id = p_user_id;
    
    -- Delete messages where user is sender or recipient
    DELETE FROM messages WHERE sender_id = p_user_id OR recipient_id = p_user_id;
    
    -- Delete conversations where user is participant
    DELETE FROM conversations WHERE participant_1_id = p_user_id OR participant_2_id = p_user_id;
    
    -- Delete user profile (this will cascade to related records due to FK constraints)
    DELETE FROM user_profiles WHERE id = p_user_id;
    
    -- Record the deletion to prevent re-registration
    INSERT INTO deleted_users (id, email) VALUES (p_user_id, user_email)
    ON CONFLICT (email) DO UPDATE SET deleted_at = CURRENT_TIMESTAMP;
    
    -- Delete the auth user - this will prevent login with this account
    DELETE FROM auth.users WHERE id = p_user_id;
    
    SELECT json_build_object(
        'success', true,
        'message', 'Account deleted successfully. You have been signed out.'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix is_email_deleted function
CREATE OR REPLACE FUNCTION is_email_deleted(p_email TEXT)
RETURNS BOOLEAN 
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM deleted_users WHERE email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix delete_application_with_activity function
CREATE OR REPLACE FUNCTION delete_application_with_activity(application_id UUID)
RETURNS JSON 
SET search_path = ''
AS $$
DECLARE
    result JSON;
    user_id UUID;
BEGIN
    -- Get the user_id for this application
    SELECT user_id INTO user_id FROM applications WHERE id = application_id;
    
    -- Check if user is authorized to delete this application
    IF user_id != auth.uid() THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Unauthorized: You can only delete your own applications'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Delete the application
    DELETE FROM applications WHERE id = application_id;
    
    -- Add activity record
    INSERT INTO activities (user_id, type, description, created_at)
    VALUES (user_id, 'application_deleted', 'Application withdrawn', CURRENT_TIMESTAMP);
    
    SELECT json_build_object(
        'success', true,
        'message', 'Application deleted successfully'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  -- Check if this email was previously deleted
  IF EXISTS(SELECT 1 FROM deleted_users WHERE email = NEW.email) THEN
    -- Don't create a profile for deleted emails
    RAISE WARNING 'Attempted to create profile for deleted email: %', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Insert a new profile for the user
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    profile_completion,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker'),
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix delete_user_data function
CREATE OR REPLACE FUNCTION delete_user_data(user_id_to_delete UUID)
RETURNS void
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to delete their own data
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own data';
  END IF;
  
  -- Store deletion record for audit
  INSERT INTO account_deletions (user_id, user_email, deleted_by)
  SELECT user_id_to_delete, email, user_id_to_delete
  FROM auth.users
  WHERE id = user_id_to_delete;
  
  -- Delete user data (will cascade to related tables)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Fix update_profile_completion function
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  -- Update the profile completion percentage when profile is updated
  NEW.profile_completion = calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix calculate_profile_completion function
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS integer
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  completion_score integer := 0;
  total_fields integer := 10; -- Total number of fields to check
BEGIN
  -- Check each field and add to completion score
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND full_name IS NOT NULL AND full_name != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND phone IS NOT NULL AND phone != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND location IS NOT NULL AND location != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND bio IS NOT NULL AND bio != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND skills IS NOT NULL AND array_length(skills, 1) > 0) THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND experience_level IS NOT NULL) THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND resume_url IS NOT NULL AND resume_url != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND portfolio_url IS NOT NULL AND portfolio_url != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND linkedin_url IS NOT NULL AND linkedin_url != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id AND github_url IS NOT NULL AND github_url != '') THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Return percentage (0-100)
  RETURN (completion_score * 100) / total_fields;
END;
$$;

-- Fix submit_job_application function
CREATE OR REPLACE FUNCTION submit_job_application(
  p_user_id UUID,
  p_job_id UUID,
  p_cover_letter TEXT DEFAULT NULL,
  p_resume_url TEXT DEFAULT NULL
)
RETURNS JSON
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  application_id UUID;
BEGIN
  -- Check if user is authorized
  IF auth.uid() != p_user_id THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Unauthorized: You can only submit applications for yourself'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Check if job exists and is active
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = p_job_id AND status = 'active') THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Job not found or not available'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Check if user already applied
  IF EXISTS (SELECT 1 FROM applications WHERE user_id = p_user_id AND job_id = p_job_id) THEN
    SELECT json_build_object(
      'success', false,
      'message', 'You have already applied to this job'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Insert application
  INSERT INTO applications (user_id, job_id, cover_letter, resume_url, status, applied_at)
  VALUES (p_user_id, p_job_id, p_cover_letter, p_resume_url, 'pending', CURRENT_TIMESTAMP)
  RETURNING id INTO application_id;
  
  -- Add activity
  INSERT INTO activities (user_id, type, description, created_at)
  VALUES (p_user_id, 'application_submitted', 'Applied to job', CURRENT_TIMESTAMP);
  
  SELECT json_build_object(
    'success', true,
    'message', 'Application submitted successfully',
    'application_id', application_id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 2. MOVE PG_TRGM EXTENSION TO DEDICATED SCHEMA
-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
-- Note: This requires superuser privileges and may need to be done manually
-- ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- 3. GRANT PERMISSIONS
-- Grant execute permissions on all fixed functions
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_deleted(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_application_with_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_job_application(UUID, UUID, TEXT, TEXT) TO authenticated;

-- 4. CREATE TRIGGERS WITH FIXED FUNCTIONS
-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
DROP TRIGGER IF EXISTS update_profile_completion_trigger ON user_profiles;

-- Recreate triggers with fixed functions
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_completion_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- ============================================================================
-- NOTES FOR MANUAL STEPS
-- ============================================================================
-- 
-- 1. EXTENSION MIGRATION (requires superuser):
--    Run this in Supabase SQL Editor with superuser privileges:
--    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
--
-- 2. ENABLE LEAKED PASSWORD PROTECTION:
--    Go to Supabase Dashboard > Authentication > Settings
--    Enable "Leaked Password Protection" in the Password Security section
--
-- 3. VERIFY FIXES:
--    Run the Supabase Advisor again to confirm all warnings are resolved
