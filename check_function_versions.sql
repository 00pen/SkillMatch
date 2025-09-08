-- Check for multiple versions of the function
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc as source_code_preview
FROM pg_proc 
WHERE proname = 'update_application_status_with_message'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Alternative query to see all function signatures
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    pg_catalog.pg_get_function_result(p.oid) as return_type
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'update_application_status_with_message'
AND n.nspname = 'public'
ORDER BY p.proname, pg_catalog.pg_get_function_arguments(p.oid);
