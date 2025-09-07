-- ============================================================================
-- SkillMatch Complete Database Fix Script
-- Run this in your Supabase SQL editor to ensure all features work properly
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE MISSING TABLES IF NOT EXISTS
-- ============================================================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    full_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('job_seeker', 'employer')) DEFAULT 'job_seeker',
    location TEXT,
    phone TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender TEXT,
    nationality TEXT,
    current_job_title TEXT,
    company_name TEXT,
    industry TEXT,
    years_experience INTEGER,
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    employment_type_preferences TEXT[],
    remote_work_preference TEXT,
    availability TEXT,
    notice_period TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    skills TEXT[],
    languages TEXT[],
    certifications TEXT[],
    education JSONB[],
    work_experience JSONB[],
    resume_url TEXT,
    cover_letter_url TEXT,
    profile_image_url TEXT,
    profile_completion INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint only if auth.users table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    size TEXT,
    founded INTEGER,
    headquarters TEXT,
    website TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    location TEXT,
    job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    is_remote BOOLEAN DEFAULT false,
    skills_required TEXT[],
    application_deadline DATE,
    start_date DATE,
    contact_email TEXT,
    contact_phone TEXT,
    is_urgent BOOLEAN DEFAULT false,
    application_instructions TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'active', 'paused', 'closed', 'expired')) DEFAULT 'active',
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    salary_expectation INTEGER,
    available_start_date DATE,
    notes TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- Conversations Table (Optional - for future messaging features)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID NOT NULL,
    participant_2_id UUID NOT NULL,
    job_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for conversations
DO $$ 
BEGIN
    -- Add participant_1_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_participant_1_id_fkey' 
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE conversations 
        ADD CONSTRAINT conversations_participant_1_id_fkey 
        FOREIGN KEY (participant_1_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add participant_2_id foreign key  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_participant_2_id_fkey' 
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE conversations 
        ADD CONSTRAINT conversations_participant_2_id_fkey 
        FOREIGN KEY (participant_2_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add job_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_job_id_fkey' 
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE conversations 
        ADD CONSTRAINT conversations_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL; -- Ignore if referenced tables don't exist yet
END $$;

-- Messages Table (Optional - for future messaging features)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    job_id UUID,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'general',
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_size INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for messages
DO $$ 
BEGIN
    -- Add sender_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add recipient_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_recipient_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_recipient_id_fkey 
        FOREIGN KEY (recipient_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add job_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_job_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_job_id_fkey 
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL; -- Ignore if jobs table doesn't exist yet
END $$;

-- ============================================================================
-- STORAGE POLICIES (if not exists)
-- ============================================================================

-- Create storage buckets if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-resumes') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('user-resumes', 'user-resumes', false, 10485760, 
                ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-portfolios') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('user-portfolios', 'user-portfolios', false, 52428800, 
                ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip']);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'message-attachments') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('message-attachments', 'message-attachments', false, 20971520, 
                ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain']);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'company-logos') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('company-logos', 'company-logos', true, 5242880, 
                ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

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

DROP POLICY IF EXISTS "Employers can view job seeker profiles" ON user_profiles;
CREATE POLICY "Employers can view job seeker profiles" ON user_profiles
    FOR SELECT USING (
        role = 'job_seeker' AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'employer'
        )
    );

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

DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON applications;
CREATE POLICY "Employers can view applications for their jobs" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j 
            WHERE j.id = applications.job_id 
            AND j.created_by = auth.uid()
        )
    );

-- Jobs Policies
DROP POLICY IF EXISTS "Anyone can view active jobs" ON jobs;
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Employers can create jobs" ON jobs;
CREATE POLICY "Employers can create jobs" ON jobs
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'employer'
        )
    );

DROP POLICY IF EXISTS "Employers can update own jobs" ON jobs;
CREATE POLICY "Employers can update own jobs" ON jobs
    FOR UPDATE USING (auth.uid() = created_by);

-- Saved Jobs Policies  
DROP POLICY IF EXISTS "Users can manage own saved jobs" ON saved_jobs;
CREATE POLICY "Users can manage own saved jobs" ON saved_jobs
    FOR ALL USING (auth.uid() = user_id);

-- Companies Policies
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
CREATE POLICY "Anyone can view companies" ON companies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employers can create companies" ON companies;
CREATE POLICY "Employers can create companies" ON companies
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'employer'
        )
    );

DROP POLICY IF EXISTS "Employers can update own companies" ON companies;
CREATE POLICY "Employers can update own companies" ON companies
    FOR UPDATE USING (auth.uid() = created_by);

-- Messages and Conversations Policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- ============================================================================
-- ENHANCED FUNCTIONS
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
    
    -- Basic information (50%)
    IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
        completion_percentage := completion_percentage + 10;
    END IF;
    
    IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
        completion_percentage := completion_percentage + 8;
    END IF;
    
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        completion_percentage := completion_percentage + 8;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
        completion_percentage := completion_percentage + 12;
    END IF;
    
    IF profile_record.experience_level IS NOT NULL THEN
        completion_percentage := completion_percentage + 12;
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
    
    -- Skills and links (20%)
    IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN
        completion_percentage := completion_percentage + 15;
    END IF;
    
    IF profile_record.linkedin_url IS NOT NULL AND profile_record.linkedin_url != '' THEN
        completion_percentage := completion_percentage + 5;
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

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON user_profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- Enhanced job application function
CREATE OR REPLACE FUNCTION submit_job_application(
    p_job_id UUID,
    p_user_id UUID,
    p_full_name TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_cover_letter TEXT DEFAULT NULL,
    p_resume_url TEXT DEFAULT NULL,
    p_portfolio_url TEXT DEFAULT NULL,
    p_salary_expectation INTEGER DEFAULT NULL,
    p_available_start_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    existing_application UUID;
    user_profile_data user_profiles%ROWTYPE;
BEGIN
    -- Check if application already exists
    SELECT id INTO existing_application 
    FROM applications 
    WHERE job_id = p_job_id AND user_id = p_user_id;
    
    IF existing_application IS NOT NULL THEN
        SELECT json_build_object(
            'success', false,
            'message', 'You have already applied to this job',
            'application_id', existing_application
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Get user profile data for defaults
    SELECT * INTO user_profile_data FROM user_profiles WHERE id = p_user_id;
    
    -- Create new application
    INSERT INTO applications (
        id, job_id, user_id, 
        full_name, email, phone, location,
        cover_letter, resume_url, portfolio_url,
        salary_expectation, available_start_date, notes,
        status, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), p_job_id, p_user_id,
        COALESCE(p_full_name, user_profile_data.full_name),
        COALESCE(p_email, user_profile_data.email),
        COALESCE(p_phone, user_profile_data.phone),
        COALESCE(p_location, user_profile_data.location),
        p_cover_letter,
        COALESCE(p_resume_url, user_profile_data.resume_url),
        COALESCE(p_portfolio_url, user_profile_data.portfolio_url),
        p_salary_expectation,
        p_available_start_date,
        p_notes,
        'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id INTO existing_application;
    
    -- Update job application count
    UPDATE jobs 
    SET application_count = application_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_job_id;
    
    SELECT json_build_object(
        'success', true,
        'message', 'Application submitted successfully',
        'application_id', existing_application
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete account function (proper cascade)
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
    
    -- Delete user profile (this will cascade to related records due to FK constraints)
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_job_application(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- ============================================================================
-- REFRESH ALL PROFILE COMPLETIONS
-- ============================================================================

-- Update all existing profiles
UPDATE user_profiles 
SET profile_completion = calculate_profile_completion(id)
WHERE profile_completion IS NULL OR profile_completion = 0;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completion ON user_profiles(profile_completion);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);

COMMIT;