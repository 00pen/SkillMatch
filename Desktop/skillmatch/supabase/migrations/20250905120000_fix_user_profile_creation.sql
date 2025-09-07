-- Fix user profile creation during registration
-- The issue is that the trigger function expects 'job-seeker' but AuthContext sends 'job_seeker'

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved trigger function that handles both formats
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this email was previously deleted
  IF EXISTS(SELECT 1 FROM deleted_users WHERE email = NEW.email) THEN
    -- Don't create a profile for deleted emails
    RAISE WARNING 'Attempted to create profile for deleted email: %', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Insert a new profile for the user with correct role mapping
  INSERT INTO user_profiles (
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
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, try to update it with the metadata
    UPDATE user_profiles 
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
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;
