-- Fix application status constraint to match frontend values
-- This script updates the database constraint to allow the status values used by the application

-- Drop the existing constraint
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add the new constraint with all status values used by the frontend
ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('applied', 'pending', 'reviewed', 'under-review', 'interview', 'interview_scheduled', 'interviewed', 'offer', 'offer_extended', 'hired', 'rejected', 'withdrawn'));
