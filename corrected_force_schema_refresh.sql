-- Force Supabase schema cache refresh - CORRECTED VERSION
-- Run these commands in the Supabase SQL Editor to force cache refresh

-- Method 1: Drop and recreate the function to force cache update
-- Drop all versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS public.update_application_status_with_message CASCADE;

-- Recreate the function (exact copy from migration file)
CREATE OR REPLACE FUNCTION public.update_application_status_with_message(
  p_application_id uuid,
  p_new_status text,
  p_sender_id uuid,
  p_message_subject text DEFAULT NULL,
  p_message_content text DEFAULT NULL,
  p_template_name text DEFAULT NULL,
  p_interview_date timestamptz DEFAULT NULL,
  p_interview_type text DEFAULT NULL,
  p_interview_location text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_application public.applications%ROWTYPE;
  v_job public.jobs%ROWTYPE;
  v_company public.companies%ROWTYPE;
  v_user_profile public.user_profiles%ROWTYPE;
  v_message_id uuid;
  v_template public.message_templates%ROWTYPE;
  v_final_subject text;
  v_final_content text;
  v_interview_id uuid;
BEGIN
  -- Get application details
  SELECT * INTO v_application FROM public.applications WHERE id = p_application_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Application not found');
  END IF;
  
  -- Get job and company details
  SELECT * INTO v_job FROM public.jobs WHERE id = v_application.job_id;
  SELECT * INTO v_company FROM public.companies WHERE id = v_job.company_id;
  SELECT * INTO v_user_profile FROM public.user_profiles WHERE id = v_application.user_id;
  
  -- Update application status
  UPDATE public.applications 
  SET 
    status = p_new_status,
    updated_at = now(),
    interview_scheduled_at = CASE WHEN p_new_status = 'interview_scheduled' THEN p_interview_date ELSE interview_scheduled_at END,
    interview_type = CASE WHEN p_new_status = 'interview_scheduled' THEN p_interview_type ELSE interview_type END,
    interview_location = CASE WHEN p_new_status = 'interview_scheduled' THEN p_interview_location ELSE interview_location END,
    hired_at = CASE WHEN p_new_status = 'hired' THEN now() ELSE hired_at END
  WHERE id = p_application_id;
  
  -- Create interview record if scheduling interview
  IF p_new_status = 'interview_scheduled' AND p_interview_date IS NOT NULL THEN
    INSERT INTO public.interviews (
      application_id,
      scheduled_at,
      interview_type,
      location,
      created_by
    ) VALUES (
      p_application_id,
      p_interview_date,
      p_interview_type,
      p_interview_location,
      p_sender_id
    ) RETURNING id INTO v_interview_id;
  END IF;
  
  -- Determine message content
  IF p_template_name IS NOT NULL THEN
    SELECT * INTO v_template FROM public.message_templates WHERE name = p_template_name;
    IF FOUND THEN
      v_final_subject := v_template.subject_template;
      v_final_content := v_template.content_template;
      
      -- Replace template variables
      v_final_subject := replace(v_final_subject, '{{candidate_name}}', COALESCE(v_user_profile.full_name, v_application.full_name, 'Candidate'));
      v_final_subject := replace(v_final_subject, '{{job_title}}', v_job.title);
      v_final_subject := replace(v_final_subject, '{{company_name}}', v_company.name);
      
      v_final_content := replace(v_final_content, '{{candidate_name}}', COALESCE(v_user_profile.full_name, v_application.full_name, 'Candidate'));
      v_final_content := replace(v_final_content, '{{job_title}}', v_job.title);
      v_final_content := replace(v_final_content, '{{company_name}}', v_company.name);
      
      -- Interview-specific replacements
      IF p_interview_date IS NOT NULL THEN
        v_final_content := replace(v_final_content, '{{interview_date}}', to_char(p_interview_date, 'FMDay, Month DD, YYYY'));
        v_final_content := replace(v_final_content, '{{interview_time}}', to_char(p_interview_date, 'HH12:MI AM'));
        v_final_content := replace(v_final_content, '{{interview_type}}', COALESCE(p_interview_type, 'Video Call'));
        v_final_content := replace(v_final_content, '{{interview_location}}', COALESCE(p_interview_location, 'TBD'));
        v_final_content := replace(v_final_content, '{{interview_duration}}', '60');
      END IF;
    END IF;
  ELSE
    -- Use provided subject and content
    v_final_subject := COALESCE(p_message_subject, 'Application Status Update');
    v_final_content := p_message_content;
  END IF;
  
  -- Create message record if we have content
  IF v_final_content IS NOT NULL THEN
    INSERT INTO public.application_messages (
      application_id,
      sender_id,
      sender_type,
      message_type,
      subject,
      content,
      is_template_message,
      template_name
    ) VALUES (
      p_application_id,
      p_sender_id,
      'employer',
      'status_update',
      v_final_subject,
      v_final_content,
      p_template_name IS NOT NULL,
      p_template_name
    ) RETURNING id INTO v_message_id;
    
    -- Create email notification record
    INSERT INTO public.email_notifications (
      application_id,
      recipient_email,
      subject,
      content,
      notification_type,
      delivery_status
    ) VALUES (
      p_application_id,
      COALESCE(v_user_profile.email, v_application.email),
      v_final_subject,
      v_final_content,
      'status_update',
      'pending'
    );
  END IF;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'application_id', p_application_id,
    'new_status', p_new_status,
    'message_id', v_message_id,
    'interview_id', v_interview_id,
    'message_sent', v_final_content IS NOT NULL
  );
END;
$$;

-- Method 2: Grant explicit permissions
GRANT EXECUTE ON FUNCTION public.update_application_status_with_message(uuid, text, uuid, text, text, text, timestamptz, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_application_status_with_message(uuid, text, uuid, text, text, text, timestamptz, text, text) TO authenticated;

-- Method 3: Test the function directly with explicit type casting
-- Valid statuses: 'pending', 'reviewed', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected', 'withdrawn'
SELECT public.update_application_status_with_message(
    '22f4bcaf-26e2-461e-8e75-f64dd67cd1d8'::uuid,
    'reviewed'::text,
    'e9fde54f-06a9-42ae-8fd3-c8ff99d4ee52'::uuid,
    'Application Status Update'::text,
    'Your application has been reviewed and we are moving forward with the next steps.'::text,
    NULL::text,
    NULL::timestamptz,
    NULL::text,
    NULL::text
);
