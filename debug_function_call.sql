-- Test the exact function call that's failing
SELECT update_application_status_with_message(
  '22f4bcaf-26e2-461e-8e75-f64dd67cd1d8'::uuid,  -- p_application_id
  'reviewed'::text,                                -- p_new_status  
  'e9fde54f-06a9-42ae-8fd3-c8ff99d4ee52'::uuid,  -- p_sender_id
  NULL::text,                                      -- p_message_subject
  NULL::text,                                      -- p_message_content
  NULL::text,                                      -- p_template_name
  NULL::timestamptz,                               -- p_interview_date
  NULL::text,                                      -- p_interview_type
  NULL::text                                       -- p_interview_location
);
