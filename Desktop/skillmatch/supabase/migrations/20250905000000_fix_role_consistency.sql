-- Fix role consistency issues in user_profiles table
-- This migration addresses the mismatch between role values in the database schema
-- and the application code expectations

-- 1. Update existing role values to use underscores instead of hyphens
UPDATE user_profiles 
SET role = 'job_seeker' 
WHERE role = 'job-seeker';

UPDATE user_profiles 
SET role = 'employer' 
WHERE role = 'employer';

-- 2. Drop the old constraint and create a new one with underscore values
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('job_seeker', 'employer'));

-- 3. Fix the user_profiles table structure to match the application expectations
-- The original schema had some inconsistencies with column names and references

-- Fix the primary key and foreign key relationship
-- The table should use 'id' as primary key that references auth.users(id)
-- not a separate 'user_id' column

-- First, check if we need to restructure the table
DO $$
BEGIN
    -- Check if the table has the wrong structure (separate id and user_id columns)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        -- The table has the wrong structure, let's fix it
        
        -- Create a temporary table with the correct structure
        CREATE TABLE user_profiles_new (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email text,
            full_name text,
            role text NOT NULL CHECK (role IN ('job_seeker', 'employer')),
            location text,
            current_job_title text,
            company_name text,
            industry text,
            bio text,
            website_url text,
            linkedin_url text,
            github_url text,
            portfolio_url text,
            phone text,
            profile_completion integer DEFAULT 0,
            date_of_birth date,
            gender text,
            nationality text,
            years_experience integer,
            expected_salary_min integer,
            expected_salary_max integer,
            salary_currency text DEFAULT 'USD',
            employment_type_preferences text[],
            remote_work_preference text,
            availability text,
            notice_period text,
            skills jsonb DEFAULT '[]',
            languages jsonb DEFAULT '[]',
            certifications jsonb DEFAULT '[]',
            education jsonb DEFAULT '[]',
            work_experience jsonb DEFAULT '[]',
            resume_url text,
            cover_letter_url text,
            portfolio_files jsonb DEFAULT '[]',
            profile_image_url text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        -- Copy data from old table to new table, using user_id as the new id
        INSERT INTO user_profiles_new (
            id, email, full_name, role, location, current_job_title, company_name, 
            industry, bio, website_url, linkedin_url, github_url, portfolio_url, 
            phone, profile_completion, date_of_birth, gender, nationality, 
            years_experience, expected_salary_min, expected_salary_max, 
            salary_currency, employment_type_preferences, remote_work_preference, 
            availability, notice_period, skills, languages, certifications, 
            education, work_experience, resume_url, cover_letter_url, 
            portfolio_files, profile_image_url, created_at, updated_at
        )
        SELECT 
            user_id, 
            (SELECT email FROM auth.users WHERE id = user_profiles.user_id),
            full_name, 
            CASE 
                WHEN role = 'job-seeker' THEN 'job_seeker'
                ELSE role 
            END,
            location, current_job_title, company_name, industry, bio, 
            website_url, linkedin_url, github_url, portfolio_url, phone,
            COALESCE(profile_completion_percentage, profile_completion, 0),
            date_of_birth, gender, nationality, 
            CASE 
                WHEN years_experience ~ '^[0-9]+$' THEN years_experience::integer
                ELSE NULL 
            END,
            expected_salary_min, expected_salary_max, salary_currency, 
            employment_type_preferences, remote_work_preference, availability, 
            notice_period, COALESCE(skills, '[]'::jsonb), COALESCE(languages, '[]'::jsonb), 
            COALESCE(certifications, '[]'::jsonb), COALESCE(education, '[]'::jsonb), 
            COALESCE(work_experience, '[]'::jsonb), resume_url, cover_letter_url, 
            COALESCE(portfolio_files, '[]'::jsonb), profile_image_url, 
            created_at, updated_at
        FROM user_profiles
        WHERE user_id IS NOT NULL;

        -- Drop the old table and rename the new one
        DROP TABLE user_profiles CASCADE;
        ALTER TABLE user_profiles_new RENAME TO user_profiles;
        
        -- Recreate indexes
        CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
        
        -- Enable RLS
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Recreate RLS policies
        CREATE POLICY "Users can view own profile"
            ON user_profiles
            FOR SELECT
            TO authenticated
            USING (auth.uid() = id);

        CREATE POLICY "Users can update own profile"
            ON user_profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = id);

        CREATE POLICY "Users can insert own profile"
            ON user_profiles
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
            
        -- Allow employers to view job seeker profiles for applications
        CREATE POLICY "Employers can view job seeker profiles"
            ON user_profiles
            FOR SELECT
            TO authenticated
            USING (
                role = 'job_seeker' AND 
                EXISTS (
                    SELECT 1 FROM user_profiles employer_profile 
                    WHERE employer_profile.id = auth.uid() 
                    AND employer_profile.role = 'employer'
                )
            );
    END IF;
END $$;

-- 4. Update the handle_new_user function to use the correct role values and table structure
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
  
  -- Insert a new profile for the user with correct role mapping
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
    CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'job-seeker' THEN 'job_seeker'
        WHEN NEW.raw_user_meta_data->>'role' = 'employer' THEN 'employer'
        ELSE 'job_seeker'
    END,
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

-- 5. Update triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
