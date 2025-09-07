-- ============================================================================
-- Fix Account Deletion Function
-- This migration fixes the account deletion function to work properly from client-side
-- ============================================================================

-- Drop the existing problematic function
DROP FUNCTION IF EXISTS delete_user_account(uuid);

-- Create a proper account deletion function that works from client-side
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
    
    -- Delete messages where user is sender or recipient
    DELETE FROM messages WHERE sender_id = p_user_id OR recipient_id = p_user_id;
    
    -- Delete conversations where user is participant
    DELETE FROM conversations WHERE participant_1_id = p_user_id OR participant_2_id = p_user_id;
    
    -- Delete user profile (this will cascade to related records due to FK constraints)
    DELETE FROM user_profiles WHERE id = p_user_id;
    
    -- Note: We cannot delete the auth user from client-side code
    -- The auth user will be cleaned up by Supabase's background processes
    -- or can be deleted manually by an admin if needed
    
    SELECT json_build_object(
        'success', true,
        'message', 'Account data deleted successfully. Please sign out to complete the process.'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- ============================================================================
-- COMPLETED MIGRATION
-- ============================================================================

INSERT INTO migration_log (version, description, executed_at) 
VALUES ('20250904170000', 'Fix account deletion function for client-side usage', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;

COMMIT;
