-- Simple approach: Create a basic version of the function that matches your app's call
DROP FUNCTION IF EXISTS public.update_application_status_with_message CASCADE;

CREATE OR REPLACE FUNCTION public.update_application_status_with_message(
    p_application_id uuid,
    p_new_status text,
    p_sender_id uuid,
    p_template_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Simple status update without complex logic
    UPDATE public.applications 
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_application_id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'application_id', p_application_id,
        'new_status', p_new_status
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_application_status_with_message(uuid, text, uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_application_status_with_message(uuid, text, uuid, text) TO authenticated;

-- Test with valid status
SELECT public.update_application_status_with_message(
    '22f4bcaf-26e2-461e-8e75-f64dd67cd1d8'::uuid,
    'reviewed'::text,
    'e9fde54f-06a9-42ae-8fd3-c8ff99d4ee52'::uuid,
    NULL::text
);
