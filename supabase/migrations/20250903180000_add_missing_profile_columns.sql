-- Add missing columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS years_experience TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS expected_salary_min INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS expected_salary_max INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS employment_type_preferences TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS remote_work_preference TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notice_period TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cover_letter_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS portfolio_files JSONB DEFAULT '[]';

-- Add storage bucket for file uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-files', 'user-files', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the storage bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);