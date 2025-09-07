-- ============================================================================
-- Account Deletion Fix - Properly delete auth user and prevent login
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Drop the existing problematic function
DROP FUNCTION IF EXISTS delete_user_account(uuid);

-- Create a proper account deletion function that deletes the auth user
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
    
    -- Delete user activities (if table exists)
    DELETE FROM activities WHERE user_id = p_user_id;
    
    -- Delete saved jobs
    DELETE FROM saved_jobs WHERE user_id = p_user_id;
    
    -- Delete job applications
    DELETE FROM applications WHERE user_id = p_user_id;
    
    -- Delete messages where user is sender or recipient (if tables exist)
    DELETE FROM messages WHERE sender_id = p_user_id OR recipient_id = p_user_id;
    
    -- Delete conversations where user is participant (if tables exist)
    DELETE FROM conversations WHERE participant_1_id = p_user_id OR participant_2_id = p_user_id;
    
    -- Delete user profile (this will cascade to related records due to FK constraints)
    DELETE FROM user_profiles WHERE id = p_user_id;
    
    -- CRITICAL: Delete the auth user - this prevents login with this account
    DELETE FROM auth.users WHERE id = p_user_id;
    
    SELECT json_build_object(
        'success', true,
        'message', 'Account deleted successfully. You have been signed out.'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Account Deletion Fix Applied!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users will now be properly logged out and unable to login after account deletion.';
END $$;
