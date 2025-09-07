// This file has been replaced by Supabase integration
// All database operations are now handled through src/lib/supabase.js

console.warn('src/lib/database.js is deprecated. Use src/lib/supabase.js instead.');

// Re-export Supabase functions for compatibility
export { auth, db, supabase } from './supabase.js';