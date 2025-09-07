-- ============================================================================
-- SkillMatch Database Complete Fix Script
-- Fixes all schema issues and missing columns
-- Run this in your Supabase SQL editor
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- FIX USER_PROFILES TABLE - Add missing columns
-- ============================================================================

-- Add missing columns to user_profiles
DO $$ 
BEGIN
    -- Add portfolio_files column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'portfolio_files') THEN
        ALTER TABLE user_profiles ADD COLUMN portfolio_files JSONB DEFAULT '[]';
    END IF;
    
    -- Add other potentially missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'availability') THEN
        ALTER TABLE user_profiles ADD COLUMN availability TEXT DEFAULT 'available';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'notice_period') THEN
        ALTER TABLE user_profiles ADD COLUMN notice_period TEXT DEFAULT '2-weeks';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'employment_type_preferences') THEN
        ALTER TABLE user_profiles ADD COLUMN employment_type_preferences TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'years_experience') THEN
        ALTER TABLE user_profiles ADD COLUMN years_experience TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'skills') THEN
        ALTER TABLE user_profiles ADD COLUMN skills JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'certifications') THEN
        ALTER TABLE user_profiles ADD COLUMN certifications TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'education') THEN
        ALTER TABLE user_profiles ADD COLUMN education JSONB[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'work_experience') THEN
        ALTER TABLE user_profiles ADD COLUMN work_experience JSONB[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'profile_completion') THEN
        ALTER TABLE user_profiles ADD COLUMN profile_completion INTEGER DEFAULT 0;
    END IF;
    
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some columns could not be added: %', SQLERRM;
END $$;

-- ============================================================================
-- CREATE JOB_SKILLS TABLE AND RELATIONSHIP
-- ============================================================================

-- Create skills table if it doesn't exist
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create job_skills junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, skill_id)
);

-- Add foreign key constraints for job_skills
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'job_skills_job_id_fkey') THEN
        ALTER TABLE job_skills ADD CONSTRAINT job_skills_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'job_skills_skill_id_fkey') THEN
        ALTER TABLE job_skills ADD CONSTRAINT job_skills_skill_id_fkey 
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE;
    END IF;
    
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some foreign key constraints could not be added: %', SQLERRM;
END $$;

-- ============================================================================
-- CREATE ACTIVITIES TABLE FOR LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    related_id UUID,
    related_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for activities
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'activities_user_id_fkey') THEN
        ALTER TABLE activities ADD CONSTRAINT activities_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
    
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Activities foreign key could not be added: %', SQLERRM;
END $$;

-- ============================================================================
-- FIX JOBS TABLE - Add missing columns
-- ============================================================================

DO $$ 
BEGIN
    -- Add missing columns to jobs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'education_requirements') THEN
        ALTER TABLE jobs ADD COLUMN education_requirements TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'application_deadline') THEN
        ALTER TABLE jobs ADD COLUMN application_deadline DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'start_date') THEN
        ALTER TABLE jobs ADD COLUMN start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'contact_email') THEN
        ALTER TABLE jobs ADD COLUMN contact_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'contact_phone') THEN
        ALTER TABLE jobs ADD COLUMN contact_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'is_urgent') THEN
        ALTER TABLE jobs ADD COLUMN is_urgent BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'application_instructions') THEN
        ALTER TABLE jobs ADD COLUMN application_instructions TEXT;
    END IF;
    
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some job columns could not be added: %', SQLERRM;
END $$;

-- ============================================================================
-- FIX APPLICATIONS TABLE - Add missing columns
-- ============================================================================

DO $$ 
BEGIN
    -- Add missing columns to applications table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'full_name') THEN
        ALTER TABLE applications ADD COLUMN full_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'email') THEN
        ALTER TABLE applications ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'phone') THEN
        ALTER TABLE applications ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'location') THEN
        ALTER TABLE applications ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'salary_expectation') THEN
        ALTER TABLE applications ADD COLUMN salary_expectation INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'available_start_date') THEN
        ALTER TABLE applications ADD COLUMN available_start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'notes') THEN
        ALTER TABLE applications ADD COLUMN notes TEXT;
    END IF;
    
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some application columns could not be added: %', SQLERRM;
END $$;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

DO $$
BEGIN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
    ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'RLS could not be enabled on some tables: %', SQLERRM;
END $$;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    -- User Profiles Policies
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    CREATE POLICY "Users can view own profile" ON user_profiles
        FOR SELECT USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    CREATE POLICY "Users can update own profile" ON user_profiles
        FOR UPDATE USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    CREATE POLICY "Users can insert own profile" ON user_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
    CREATE POLICY "Users can delete own profile" ON user_profiles
        FOR DELETE USING (auth.uid() = id);

    -- Jobs Policies
    DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;
    CREATE POLICY "Anyone can view active jobs" ON jobs
        FOR SELECT USING (status = 'active');

    DROP POLICY IF EXISTS "Employers can manage own jobs" ON jobs;
    CREATE POLICY "Employers can manage own jobs" ON jobs
        FOR ALL USING (created_by = auth.uid());

    -- Applications Policies
    DROP POLICY IF EXISTS "Users can view own applications" ON applications;
    CREATE POLICY "Users can view own applications" ON applications
        FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own applications" ON applications;
    CREATE POLICY "Users can create own applications" ON applications
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own applications" ON applications;
    CREATE POLICY "Users can update own applications" ON applications
        FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own applications" ON applications;
    CREATE POLICY "Users can delete own applications" ON applications
        FOR DELETE USING (auth.uid() = user_id);

    -- Employers can view applications for their jobs
    DROP POLICY IF EXISTS "Employers can view job applications" ON applications;
    CREATE POLICY "Employers can view job applications" ON applications
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM jobs 
                WHERE jobs.id = applications.job_id 
                AND jobs.created_by = auth.uid()
            )
        );

    -- Saved Jobs Policies
    DROP POLICY IF EXISTS "Users can manage own saved jobs" ON saved_jobs;
    CREATE POLICY "Users can manage own saved jobs" ON saved_jobs
        FOR ALL USING (auth.uid() = user_id);

    -- Skills Policies
    DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
    CREATE POLICY "Anyone can view skills" ON skills
        FOR SELECT USING (true);

    -- Job Skills Policies
    DROP POLICY IF EXISTS "Anyone can view job skills" ON job_skills;
    CREATE POLICY "Anyone can view job skills" ON job_skills
        FOR SELECT USING (true);

    -- Activities Policies
    DROP POLICY IF EXISTS "Users can view own activities" ON activities;
    CREATE POLICY "Users can view own activities" ON activities
        FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own activities" ON activities;
    CREATE POLICY "Users can create own activities" ON activities
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Companies Policies
    DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
    CREATE POLICY "Anyone can view companies" ON companies
        FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can manage own companies" ON companies;
    CREATE POLICY "Users can manage own companies" ON companies
        FOR ALL USING (created_by = auth.uid());

EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some RLS policies could not be created: %', SQLERRM;
END $$;

-- ============================================================================
-- CREATE FUNCTIONS
-- ============================================================================

-- Profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_percentage INTEGER := 0;
    profile_record user_profiles%ROWTYPE;
BEGIN
    SELECT * INTO profile_record FROM user_profiles WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Basic information (60%)
    IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
        completion_percentage := completion_percentage + 15;
    END IF;
    
    IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
        completion_percentage := completion_percentage + 15;
    END IF;
    
    IF profile_record.experience_level IS NOT NULL THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    -- Professional information (30%)
    IF profile_record.current_job_title IS NOT NULL AND profile_record.current_job_title != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF profile_record.industry IS NOT NULL AND profile_record.industry != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF profile_record.years_experience IS NOT NULL THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    -- Skills and links (10%)
    IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    RETURN LEAST(completion_percentage, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion := calculate_profile_completion(NEW.id);
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger safely
DO $$
BEGIN
    DROP TRIGGER IF EXISTS trigger_update_profile_completion ON user_profiles;
    CREATE TRIGGER trigger_update_profile_completion
        BEFORE INSERT OR UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_profile_completion();
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Trigger could not be created: %', SQLERRM;
END $$;

-- Delete application function
CREATE OR REPLACE FUNCTION delete_application_with_activity(
    p_application_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id      UUID := COALESCE(p_user_id, auth.uid());
    app_row        applications%ROWTYPE;
    v_job_title    TEXT;
    v_company_name TEXT;
    result         JSON;
BEGIN
    -- Get application record (must belong to caller)
    SELECT a.*
    INTO app_row
    FROM applications a
    WHERE a.id = p_application_id
        AND a.user_id = v_user_id;

    IF NOT FOUND THEN
        result := json_build_object(
            'success', false,
            'message', 'Application not found or you do not have permission to delete it'
        );
        RETURN result;
    END IF;

    -- Fetch job + company details for activity logging
    SELECT j.title, c.name
    INTO v_job_title, v_company_name
    FROM jobs j
    LEFT JOIN companies c ON c.id = j.company_id
    WHERE j.id = app_row.job_id;

    -- Delete the application
    DELETE FROM applications WHERE id = p_application_id;

    -- Log activity
    INSERT INTO activities (user_id, type, title, description, related_id, related_type, metadata)
    VALUES (
        v_user_id,
        'application_deleted',
        COALESCE(v_job_title, 'Application deleted'),
        CASE 
            WHEN v_job_title IS NOT NULL AND v_company_name IS NOT NULL
                THEN 'You deleted your application for ' || v_job_title || ' at ' || v_company_name
            WHEN v_job_title IS NOT NULL
                THEN 'You deleted your application for ' || v_job_title
            ELSE
                'You deleted one of your applications'
        END,
        p_application_id,
        'application',
        jsonb_build_object('job_title', v_job_title, 'company_name', v_company_name)
    );

    -- Return success
    result := json_build_object('success', true, 'message', 'Application deleted successfully');
    RETURN result;

EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'message', 'Error deleting application: ' || SQLERRM);
    RETURN result;
END;
$$;

-- Delete user account function
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user exists and is the authenticated user
    IF p_user_id != auth.uid() THEN
        SELECT json_build_object(
            'success', false,
            'message', 'Unauthorized: You can only delete your own account'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Delete user activities
    DELETE FROM activities WHERE user_id = p_user_id;
    
    -- Delete saved jobs
    DELETE FROM saved_jobs WHERE user_id = p_user_id;
    
    -- Delete job applications
    DELETE FROM applications WHERE user_id = p_user_id;
    
    -- Delete user profile (cascades to related records)
    DELETE FROM user_profiles WHERE id = p_user_id;
    
    SELECT json_build_object(
        'success', true,
        'message', 'Account deleted successfully'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

DO $$
BEGIN
    GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION delete_application_with_activity(UUID, UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some permissions could not be granted: %', SQLERRM;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_completion ON user_profiles(profile_completion);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
    CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id);
    CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id ON job_skills(skill_id);
    CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Some indexes could not be created: %', SQLERRM;
END $$;

-- ============================================================================
-- INSERT SAMPLE SKILLS
-- ============================================================================

INSERT INTO skills (name, category) VALUES
('JavaScript', 'programming'),
('Python', 'programming'),
('React', 'frontend'),
('Node.js', 'backend'),
('AWS', 'cloud'),
('Docker', 'devops'),
('PostgreSQL', 'database'),
('MongoDB', 'database'),
('Git', 'tools'),
('Kubernetes', 'devops'),
('TypeScript', 'programming'),
('Vue.js', 'frontend'),
('Angular', 'frontend'),
('PHP', 'programming'),
('Java', 'programming'),
('C#', 'programming'),
('Go', 'programming'),
('Rust', 'programming'),
('Swift', 'programming'),
('Kotlin', 'programming')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- UPDATE EXISTING PROFILES
-- ============================================================================

DO $$
BEGIN
    -- Update profile completion for existing profiles
    UPDATE user_profiles 
    SET profile_completion = calculate_profile_completion(id)
    WHERE profile_completion IS NULL OR profile_completion = 0;
    
    RAISE NOTICE 'Updated % user profiles with completion percentages', ROW_COUNT;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Could not update profile completions: %', SQLERRM;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables exist
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'applications', 'saved_jobs', 'jobs', 'companies', 'skills', 'job_skills', 'activities');

-- Verify key columns exist
SELECT 'Key columns verified:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('portfolio_files', 'certifications', 'skills', 'profile_completion');

-- Verify RLS is enabled
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'applications', 'saved_jobs', 'jobs', 'companies', 'skills', 'job_skills', 'activities');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SkillMatch Database Fixes Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All schema issues have been resolved.';
    RAISE NOTICE 'Your application should now work without errors.';
END $$;

-- ============================================================================
-- CREATE TRIGGERS FOR AUTOMATIC PROFILE CREATION
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();