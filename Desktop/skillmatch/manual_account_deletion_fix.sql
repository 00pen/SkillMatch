-- ============================================================================
-- Manual Account Deletion Fix
-- Run this script in your Supabase SQL Editor to fix the account deletion issue
-- ============================================================================

-- Drop the existing problematic function
DROP FUNCTION IF EXISTS delete_user_account(uuid);

-- Create a table to track deleted users to prevent re-registration
CREATE TABLE IF NOT EXISTS deleted_users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email)
);

-- Create a proper account deletion function that works from client-side
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSON AS $$
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

-- Create a function to check if an email was previously deleted
CREATE OR REPLACE FUNCTION is_email_deleted(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM deleted_users WHERE email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_deleted(TEXT) TO authenticated;

-- Create RLS policies for deleted_users table
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to check if their email was deleted
CREATE POLICY "Users can check if email was deleted" ON deleted_users
    FOR SELECT USING (true);

-- Allow the delete function to insert into deleted_users
CREATE POLICY "Allow deletion tracking" ON deleted_users
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- UPDATE THE AUTH TRIGGER TO CHECK FOR DELETED EMAILS
-- ============================================================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to check for deleted emails
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
