# Supabase Security Warnings Fix Guide

This guide addresses all the security warnings from Supabase Advisor and provides step-by-step instructions to fix them.

## Warnings Fixed

### 1. Function Search Path Mutable (9 functions) ✅ FIXED
**Issue**: Functions without `SET search_path = ''` are vulnerable to search path injection attacks.

**Functions Fixed**:
- `delete_user_account`
- `is_email_deleted` 
- `delete_application_with_activity`
- `handle_new_user`
- `delete_user_data`
- `update_updated_at_column`
- `update_profile_completion`
- `calculate_profile_completion`
- `submit_job_application`

**Solution**: Added `SET search_path = ''` to all function definitions in the migration file.

### 2. Extension in Public Schema ⚠️ REQUIRES MANUAL ACTION
**Issue**: `pg_trgm` extension is installed in the public schema, which is a security risk.

**Solution**: 
1. Run the `extension_migration_manual.sql` script in Supabase SQL Editor with superuser privileges
2. This moves the extension to a dedicated `extensions` schema

### 3. Leaked Password Protection Disabled ⚠️ REQUIRES MANUAL ACTION
**Issue**: Leaked password protection is disabled in Supabase Auth.

**Solution**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Navigate to "Password Security" section
3. Enable "Leaked Password Protection"
4. This will check passwords against HaveIBeenPwned.org database

## How to Apply the Fixes

### Step 1: Run the Migration
```bash
# Apply the main security fixes migration
supabase db push
```

### Step 2: Move Extension (Manual)
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the contents of `extension_migration_manual.sql`
4. This requires superuser privileges

### Step 3: Enable Password Protection (Manual)
1. Open Supabase Dashboard
2. Go to Authentication → Settings
3. Find "Password Security" section
4. Enable "Leaked Password Protection"

### Step 4: Verify Fixes
1. Run Supabase Advisor again
2. All warnings should be resolved

## Security Benefits

1. **Search Path Protection**: Prevents SQL injection attacks through search path manipulation
2. **Extension Isolation**: Extensions in dedicated schema reduce attack surface
3. **Password Security**: Prevents users from using compromised passwords

## Files Created

- `supabase/migrations/20250115000000_fix_security_warnings.sql` - Main migration with function fixes
- `extension_migration_manual.sql` - Manual script for extension migration
- `SECURITY_FIXES_GUIDE.md` - This guide

## Notes

- The extension migration requires superuser privileges and must be done manually
- Password protection must be enabled through the Supabase Dashboard
- All function fixes are backward compatible and won't break existing functionality
