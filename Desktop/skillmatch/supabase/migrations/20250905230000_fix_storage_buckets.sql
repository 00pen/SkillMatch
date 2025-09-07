-- Fix storage buckets and RLS policies for file uploads

-- Create profile pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Profile Pictures Bucket Policies
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add profile picture URL column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Update existing buckets to ensure they have correct policies
-- Drop and recreate policies for user-resumes bucket to fix path issues
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;

CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-resumes' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'employer'))
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

-- Fix user-portfolios bucket policies
DROP POLICY IF EXISTS "Users can upload their own portfolios" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own portfolios" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own portfolios" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own portfolios" ON storage.objects;

CREATE POLICY "Users can upload their own portfolios" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own portfolios" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-portfolios' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'employer'))
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
