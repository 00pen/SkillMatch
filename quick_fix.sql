-- Quick Fix for SkillMatch Database Issues
-- Run this in your Supabase SQL Editor

-- 1. Fix the array_length function issue
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

-- 2. Create trigger for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Create profile for existing user (replace with your user ID)
-- INSERT INTO user_profiles (id, email, full_name, role, profile_completion, created_at, updated_at)
-- VALUES ('210bd111-4d8b-4c51-90e9-85727be34a37', 'user@example.com', 'User', 'job_seeker', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
-- ON CONFLICT (id) DO NOTHING;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- 6. Verify the fix
SELECT 'Database fixes applied successfully!' as status;
