-- Add oauth_provider column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth_provider ON user_profiles(oauth_provider);
