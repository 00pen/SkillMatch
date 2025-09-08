-- Test if the function exists and what parameters it expects
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname LIKE '%update_application%';

-- Also check what functions are available
SELECT 
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname LIKE '%application%'
ORDER BY p.proname;
