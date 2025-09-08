-- Verify if the function exists and check its signature
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    pg_catalog.pg_get_function_result(p.oid) as return_type,
    p.prosrc as function_body_preview
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'update_application_status_with_message'
AND n.nspname = 'public'
ORDER BY p.proname, pg_catalog.pg_get_function_arguments(p.oid);

-- Also check what functions exist with similar names
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname LIKE '%update_application%'
AND n.nspname = 'public'
ORDER BY p.proname;
