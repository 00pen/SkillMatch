-- ============================================================================
-- SkillMatch Complete Backend Integration Migration
-- This script sets up the complete database schema, storage buckets, 
-- RLS policies, and functions for full CRUD operations
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STORAGE BUCKETS FOR FILE MANAGEMENT
-- ============================================================================

-- Create storage buckets for user files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-resumes', 'user-resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('user-portfolios', 'user-portfolios', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip']),
  ('message-attachments', 'message-attachments', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('company-logos', 'company-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- User Resumes Bucket Policies
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Employers can view user resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-resumes' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- User Portfolios Bucket Policies
CREATE POLICY "Users can upload their own portfolios" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own portfolios" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Employers can view user portfolios" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-portfolios' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

CREATE POLICY "Users can update their own portfolios" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own portfolios" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Message Attachments Bucket Policies
CREATE POLICY "Users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their message attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM messages m 
        WHERE m.attachment_url = name AND 
        (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
      )
    )
  );

-- Company Logos Bucket Policies (public)
CREATE POLICY "Anyone can view company logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Employers can upload company logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

-- ============================================================================
-- ENHANCED TABLES AND FUNCTIONS
-- ============================================================================

-- Add file management columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add attachment support to messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- ============================================================================
-- PROFILE COMPLETION CALCULATION FUNCTION
-- ============================================================================

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
  
  -- Base profile information (60% total)
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
    completion_percentage := completion_percentage + 15;
  END IF;
  
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
    completion_percentage := completion_percentage + 10;
  END IF;
  
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completion_percentage := completion_percentage + 15;
  END IF;
  
  IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
    completion_percentage := completion_percentage + 10;
  END IF;
  
  IF profile_record.experience_level IS NOT NULL THEN
    completion_percentage := completion_percentage + 10;
  END IF;
  
  -- Skills and preferences (25% total)
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN
    completion_percentage := completion_percentage + 15;
  END IF;
  
  IF profile_record.preferred_job_types IS NOT NULL AND array_length(profile_record.preferred_job_types, 1) > 0 THEN
    completion_percentage := completion_percentage + 10;
  END IF;
  
  -- File uploads (15% total)
  IF profile_record.resume_url IS NOT NULL AND profile_record.resume_url != '' THEN
    completion_percentage := completion_percentage + 10;
  END IF;
  
  IF profile_record.portfolio_url IS NOT NULL AND profile_record.portfolio_url != '' THEN
    completion_percentage := completion_percentage + 5;
  END IF;
  
  RETURN LEAST(completion_percentage, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PROFILE COMPLETION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_completion ON user_profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- ============================================================================
-- FILE UPLOAD HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION upload_user_resume(
  user_id UUID,
  file_url TEXT,
  file_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE user_profiles 
  SET 
    resume_url = file_url,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
  
  IF FOUND THEN
    SELECT json_build_object(
      'success', true,
      'message', 'Resume uploaded successfully',
      'file_url', file_url
    ) INTO result;
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'User profile not found'
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION upload_user_portfolio(
  user_id UUID,
  file_url TEXT,
  file_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE user_profiles 
  SET 
    portfolio_url = file_url,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
  
  IF FOUND THEN
    SELECT json_build_object(
      'success', true,
      'message', 'Portfolio uploaded successfully',
      'file_url', file_url
    ) INTO result;
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'User profile not found'
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPLICATION MANAGEMENT FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION submit_job_application(
  p_job_id UUID,
  p_user_id UUID,
  p_cover_letter TEXT DEFAULT NULL,
  p_resume_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  existing_application UUID;
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
  ELSE
    -- Create new application
    INSERT INTO applications (
      id, job_id, user_id, cover_letter, resume_url, status, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), p_job_id, p_user_id, p_cover_letter, 
      COALESCE(p_resume_url, (SELECT resume_url FROM user_profiles WHERE id = p_user_id)),
      'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id INTO existing_application;
    
    SELECT json_build_object(
      'success', true,
      'message', 'Application submitted successfully',
      'application_id', existing_application
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION withdraw_job_application(
  p_application_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  app_record applications%ROWTYPE;
BEGIN
  SELECT * INTO app_record FROM applications 
  WHERE id = p_application_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Application not found or you do not have permission to withdraw it'
    ) INTO result;
  ELSE
    UPDATE applications 
    SET 
      status = 'withdrawn',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_application_id;
    
    SELECT json_build_object(
      'success', true,
      'message', 'Application withdrawn successfully'
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAVED JOBS MANAGEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_saved_job(
  p_job_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  existing_save UUID;
BEGIN
  SELECT id INTO existing_save 
  FROM saved_jobs 
  WHERE job_id = p_job_id AND user_id = p_user_id;
  
  IF existing_save IS NOT NULL THEN
    -- Remove from saved jobs
    DELETE FROM saved_jobs WHERE id = existing_save;
    
    SELECT json_build_object(
      'success', true,
      'message', 'Job removed from saved jobs',
      'action', 'removed',
      'is_saved', false
    ) INTO result;
  ELSE
    -- Add to saved jobs
    INSERT INTO saved_jobs (id, job_id, user_id, created_at)
    VALUES (gen_random_uuid(), p_job_id, p_user_id, CURRENT_TIMESTAMP);
    
    SELECT json_build_object(
      'success', true,
      'message', 'Job saved successfully',
      'action', 'added',
      'is_saved', true
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MESSAGING ENHANCEMENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION send_message(
  p_recipient_id UUID,
  p_content TEXT,
  p_job_id UUID DEFAULT NULL,
  p_attachment_url TEXT DEFAULT NULL,
  p_attachment_name TEXT DEFAULT NULL,
  p_attachment_size INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  conversation_id UUID;
  message_id UUID;
BEGIN
  -- Get or create conversation
  SELECT id INTO conversation_id 
  FROM conversations 
  WHERE 
    ((participant_1_id = auth.uid() AND participant_2_id = p_recipient_id) OR
     (participant_1_id = p_recipient_id AND participant_2_id = auth.uid())) AND
    (job_id = p_job_id OR (job_id IS NULL AND p_job_id IS NULL));
  
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (
      id, participant_1_id, participant_2_id, job_id, created_at, last_message_at
    ) VALUES (
      gen_random_uuid(), 
      LEAST(auth.uid(), p_recipient_id),
      GREATEST(auth.uid(), p_recipient_id),
      p_job_id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING id INTO conversation_id;
  END IF;
  
  -- Create message
  INSERT INTO messages (
    id, sender_id, recipient_id, job_id, content, 
    attachment_url, attachment_name, attachment_size, 
    created_at, message_type
  ) VALUES (
    gen_random_uuid(), auth.uid(), p_recipient_id, p_job_id, p_content,
    p_attachment_url, p_attachment_name, p_attachment_size,
    CURRENT_TIMESTAMP, 'general'
  ) RETURNING id INTO message_id;
  
  -- Update conversation last message time
  UPDATE conversations 
  SET last_message_at = CURRENT_TIMESTAMP 
  WHERE id = conversation_id;
  
  SELECT json_build_object(
    'success', true,
    'message', 'Message sent successfully',
    'message_id', message_id,
    'conversation_id', conversation_id
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REFRESH ALL PROFILE COMPLETIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_all_profile_completions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM user_profiles LOOP
    UPDATE user_profiles 
    SET profile_completion = calculate_profile_completion(user_record.id)
    WHERE id = user_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the refresh to update existing profiles
SELECT refresh_all_profile_completions();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upload_user_resume(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upload_user_portfolio(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_job_application(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION withdraw_job_application(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_saved_job(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_message(UUID, TEXT, UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_profile_completions() TO authenticated;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_resume_url ON user_profiles(resume_url) WHERE resume_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_portfolio_url ON user_profiles(portfolio_url) WHERE portfolio_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_attachment_url ON messages(attachment_url) WHERE attachment_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_job ON saved_jobs(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1_id, participant_2_id, job_id);

-- ============================================================================
-- COMPLETED MIGRATION
-- ============================================================================

INSERT INTO migration_log (version, description, executed_at) 
VALUES ('20250904160000', 'Complete backend integration with storage buckets and CRUD operations', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;

COMMIT;