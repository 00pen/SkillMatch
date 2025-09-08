-- Test the RPC call format that Supabase uses
SELECT * FROM rpc('update_application_status_with_message', '{
  "p_application_id": "22f4bcaf-26e2-461e-8e75-f64dd67cd1d8",
  "p_new_status": "reviewed",
  "p_sender_id": "e9fde54f-06a9-42ae-8fd3-c8ff99d4ee52",
  "p_message_subject": null,
  "p_message_content": null,
  "p_template_name": null,
  "p_interview_date": null,
  "p_interview_type": null,
  "p_interview_location": null
}'::json);

-- Also check if the function has proper SECURITY DEFINER and permissions
SELECT 
    p.proname,
    p.prosecdef as is_security_definer,
    p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_application_status_with_message';
