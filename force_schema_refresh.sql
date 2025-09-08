-- Force Supabase schema cache refresh
-- Run these commands in the Supabase SQL Editor to force cache refresh

-- Method 1: Drop and recreate the function to force cache update
-- Drop all versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS public.update_application_status_with_message CASCADE;

-- Recreate the function (copy from migration file)
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
DECLARE
    v_application record;
    v_template record;
    v_message_content text;
    v_message_id uuid;
    v_result json;
BEGIN
    -- Get application details
    SELECT a.*, j.title as job_title, c.name as company_name
    INTO v_application
    FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.companies c ON j.company_id = c.id
    WHERE a.id = p_application_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Application not found');
    END IF;
    
    -- Update application status
    UPDATE public.applications 
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_application_id;
    
    -- Get message template if specified
    IF p_template_name IS NOT NULL THEN
        SELECT * INTO v_template
        FROM public.message_templates
        WHERE name = p_template_name
        LIMIT 1;
        
        IF FOUND THEN
            -- Replace placeholders in template
            v_message_content := v_template.content_template;
            v_message_content := REPLACE(v_message_content, '{job_title}', v_application.job_title);
            v_message_content := REPLACE(v_message_content, '{company_name}', v_application.company_name);
            v_message_content := REPLACE(v_message_content, '{candidate_name}', COALESCE(v_application.full_name, 'Candidate'));
        END IF;
    END IF;
    
    -- Create message record if we have content
    IF v_message_content IS NOT NULL THEN
        INSERT INTO public.application_messages (
            application_id,
            sender_id,
            message_type,
            subject,
            content,
            status
        ) VALUES (
            p_application_id,
            p_sender_id,
            'status_update',
            COALESCE(v_template.subject_template, 'Application Status Update'),
            v_message_content,
            'sent'
        ) RETURNING id INTO v_message_id;
        
        -- Create email notification record
        INSERT INTO public.email_notifications (
            recipient_id,
            sender_id,
            subject,
            content,
            status,
            related_application_id
        ) VALUES (
            v_application.user_id,
            p_sender_id,
            COALESCE(v_template.subject, 'Application Status Update'),
            v_message_content,
            'pending',
            p_application_id
        );
    END IF;
    
    -- Return success response
    v_result := json_build_object(
        'success', true,
        'application_id', p_application_id,
        'new_status', p_new_status,
        'message_id', v_message_id,
        'message_sent', v_message_content IS NOT NULL
    );
    
    RETURN v_result;
END;
$$;

-- Method 2: Grant explicit permissions
GRANT EXECUTE ON FUNCTION public.update_application_status_with_message(uuid, text, uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_application_status_with_message(uuid, text, uuid, text) TO authenticated;

-- Method 3: Test the function directly with explicit type casting
-- Valid statuses: 'pending', 'reviewed', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected', 'withdrawn'
SELECT public.update_application_status_with_message(
    '22f4bcaf-26e2-461e-8e75-f64dd67cd1d8'::uuid,
    'reviewed'::text,
    'e9fde54f-06a9-42ae-8fd3-c8ff99d4ee52'::uuid,
    'status_update_reviewed'::text
);
