# Database Fixes Guide

## Step 1: Run the Database Fixes Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `database_fixes.sql` into the editor
4. Click "Run" to execute the script

## Step 2: Verify the Fixes

After running the script, you should see these messages:
- "SkillMatch Database Fixes Complete!"
- "All schema issues have been resolved."

## Step 3: Test Your Application

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test these features:
   - Profile completion page (should save data without errors)
   - Job details page (should load without job_skills errors)
   - Account deletion (should work properly)
   - Application deletion (should work properly)

## What the Fixes Address:

### ✅ Fixed Issues:
1. **Missing `portfolio_files` column** - Added to user_profiles table
2. **Missing `job_skills` relationship** - Created proper table structure
3. **Schema cache issues** - Updated queries to use direct column access
4. **Profile data not saving** - Fixed updateUserProfile function
5. **Account deletion not working** - Fixed deleteUserAccount function
6. **Application deletion not working** - Fixed deleteApplication function

### 🔧 Database Changes Made:
- Added missing columns to `user_profiles`
- Created `job_skills` and `skills` tables
- Created `activities` table for logging
- Added proper foreign key constraints
- Enabled Row Level Security (RLS)
- Created RLS policies for data protection
- Added performance indexes
- Created helper functions

### 📝 Code Changes Made:
- Updated `src/lib/supabase.js` to handle missing columns
- Fixed `src/hooks/useJobs.js` to avoid job_skills relationship errors
- Updated profile update functions to handle JSONB fields properly

## Troubleshooting:

If you still see errors after running the fixes:

1. **Clear browser cache** and reload the page
2. **Check Supabase logs** for any remaining errors
3. **Verify environment variables** are set correctly
4. **Restart the development server**

## Environment Variables Required:

Make sure you have these in your `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps:

After running the fixes, your application should work without the schema errors. All profile data should save properly, job details should load without errors, and account/application deletion should work correctly.
