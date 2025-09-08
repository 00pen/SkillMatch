/*
  Enhanced Application System Migration
  
  This migration adds:
  1. Enhanced application status system
  2. Interview scheduling with dates
  3. Application messages and status updates
  4. Email notification system
  5. Default message templates
*/

-- First, update the applications table to include additional fields
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS interview_scheduled_at timestamptz,
ADD COLUMN IF NOT EXISTS interview_location text,
ADD COLUMN IF NOT EXISTS interview_type text CHECK (interview_type IN ('in-person', 'video', 'phone')),
ADD COLUMN IF NOT EXISTS interview_notes text,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS offer_details jsonb,
ADD COLUMN IF NOT EXISTS hired_at timestamptz;

-- Update the status check constraint to include new statuses
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'reviewed', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected', 'withdrawn'));

-- Create application_messages table for status update messages
CREATE TABLE IF NOT EXISTS application_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('employer', 'job_seeker')),
  message_type text NOT NULL CHECK (message_type IN ('status_update', 'interview_invite', 'rejection', 'offer', 'general')),
  subject text NOT NULL,
  content text NOT NULL,
  is_template_message boolean DEFAULT false,
  template_name text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create message_templates table for default messages
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('status_update', 'interview_invite', 'rejection', 'offer')),
  subject_template text NOT NULL,
  content_template text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interviews table for detailed interview scheduling
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  interview_type text NOT NULL CHECK (interview_type IN ('in-person', 'video', 'phone')),
  location text,
  meeting_link text,
  interviewer_notes text,
  candidate_notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_notifications table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('status_update', 'interview_invite', 'rejection', 'offer', 'hired')),
  sent_at timestamptz DEFAULT now(),
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed'))
);

-- Enable RLS on new tables
ALTER TABLE application_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_messages
CREATE POLICY "Users can view messages for their applications"
  ON application_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_messages.application_id 
      AND (applications.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()))
    )
  );

CREATE POLICY "Users can create messages for their applications"
  ON application_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_messages.application_id 
      AND (applications.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()))
    )
  );

-- RLS Policies for message_templates
CREATE POLICY "Authenticated users can view message templates"
  ON message_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can manage message templates"
  ON message_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for interviews
CREATE POLICY "Users can view interviews for their applications"
  ON interviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = interviews.application_id 
      AND (applications.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()))
    )
  );

CREATE POLICY "Employers can manage interviews"
  ON interviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = interviews.application_id 
      AND EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = interviews.application_id 
      AND EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid())
    )
  );

-- RLS Policies for email_notifications
CREATE POLICY "Users can view their email notifications"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = email_notifications.application_id 
      AND (applications.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()))
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_messages_application_id ON application_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_application_messages_sender_id ON application_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_application_messages_created_at ON application_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_application_id ON email_notifications(application_id);

-- Add triggers for updating timestamps
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default message templates
INSERT INTO message_templates (name, message_type, subject_template, content_template, variables) VALUES
(
  'application_received',
  'status_update',
  'Application Received - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}. We have received your application and our team will review it carefully.

We will contact you within the next few business days regarding the next steps in our hiring process.

Best regards,
{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name"]'::jsonb
),
(
  'application_reviewed',
  'status_update',
  'Application Update - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

We have reviewed your application for the {{job_title}} position at {{company_name}}. We are impressed with your qualifications and would like to move forward with the next step in our hiring process.

We will be in touch soon with more details.

Best regards,
{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name"]'::jsonb
),
(
  'interview_invitation',
  'interview_invite',
  'Interview Invitation - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

Congratulations! We would like to invite you for an interview for the {{job_title}} position at {{company_name}}.

Interview Details:
- Date: {{interview_date}}
- Time: {{interview_time}}
- Type: {{interview_type}}
- Location/Link: {{interview_location}}
- Duration: {{interview_duration}} minutes

Please confirm your availability by replying to this message. If you have any questions or need to reschedule, please let us know as soon as possible.

We look forward to speaking with you!

Best regards,
{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name", "interview_date", "interview_time", "interview_type", "interview_location", "interview_duration"]'::jsonb
),
(
  'offer_extended',
  'offer',
  'Job Offer - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

We are pleased to extend an offer for the {{job_title}} position at {{company_name}}!

After careful consideration, we believe you would be an excellent addition to our team. We were impressed by your skills, experience, and enthusiasm during the interview process.

Please review the attached offer details and let us know your decision by {{offer_deadline}}.

We are excited about the possibility of you joining our team!

Best regards,
{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name", "offer_deadline"]'::jsonb
),
(
  'application_rejected_generic',
  'rejection',
  'Application Update - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We appreciate the time you invested in our application process and encourage you to apply for future opportunities that match your skills and interests.

We wish you the best in your job search.

Best regards,
{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name"]'::jsonb
),
(
  'application_rejected_after_interview',
  'rejection',
  'Interview Follow-up - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

Thank you for taking the time to interview for the {{job_title}} position at {{company_name}}. We enjoyed our conversation and learning more about your background and experience.

After careful consideration, we have decided to move forward with another candidate whose experience more closely aligns with our current needs.

This was a difficult decision as we were impressed by your qualifications and professionalism throughout the process.

We wish you the best in your job search and encourage you to apply for future opportunities with us.

Best regards,
{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name"]'::jsonb
),
(
  'candidate_hired',
  'status_update',
  'Welcome to the Team! - {{job_title}} at {{company_name}}',
  'Dear {{candidate_name}},

Congratulations and welcome to {{company_name}}!

We are thrilled to have you join our team as {{job_title}}. Your skills and experience will be valuable additions to our organization.

Next Steps:
- You will receive onboarding information from HR within the next 2 business days
- Your start date is {{start_date}}
- Please complete any required paperwork before your first day

If you have any questions before your start date, please don''t hesitate to reach out.

We look forward to working with you!

Best regards,
{{company_name}} Team',
  '["candidate_name", "job_title", "company_name", "start_date"]'::jsonb
);

-- Function to send application status update with message
CREATE OR REPLACE FUNCTION update_application_status_with_message(
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
  v_application applications%ROWTYPE;
  v_job jobs%ROWTYPE;
  v_company companies%ROWTYPE;
  v_user_profile user_profiles%ROWTYPE;
  v_message_id uuid;
  v_template message_templates%ROWTYPE;
  v_final_subject text;
  v_final_content text;
  v_interview_id uuid;
BEGIN
  -- Get application details
  SELECT * INTO v_application FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Application not found');
  END IF;
  
  -- Get job and company details
  SELECT * INTO v_job FROM jobs WHERE id = v_application.job_id;
  SELECT * INTO v_company FROM companies WHERE id = v_job.company_id;
  SELECT * INTO v_user_profile FROM user_profiles WHERE id = v_application.user_id;
  
  -- Update application status
  UPDATE applications 
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
    INSERT INTO interviews (
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
    SELECT * INTO v_template FROM message_templates WHERE name = p_template_name;
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
    v_final_subject := COALESCE(p_message_subject, 'Application Status Update');
    v_final_content := COALESCE(p_message_content, 'Your application status has been updated.');
  END IF;
  
  -- Create message record
  INSERT INTO application_messages (
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
    CASE 
      WHEN p_new_status = 'interview_scheduled' THEN 'interview_invite'
      WHEN p_new_status = 'rejected' THEN 'rejection'
      WHEN p_new_status = 'offer_extended' THEN 'offer'
      ELSE 'status_update'
    END,
    v_final_subject,
    v_final_content,
    p_template_name IS NOT NULL,
    p_template_name
  ) RETURNING id INTO v_message_id;
  
  -- Create email notification record
  INSERT INTO email_notifications (
    application_id,
    recipient_email,
    subject,
    content,
    notification_type
  ) VALUES (
    p_application_id,
    COALESCE(v_user_profile.email, v_application.email),
    v_final_subject,
    v_final_content,
    CASE 
      WHEN p_new_status = 'interview_scheduled' THEN 'interview_invite'
      WHEN p_new_status = 'rejected' THEN 'rejection'
      WHEN p_new_status = 'offer_extended' THEN 'offer'
      WHEN p_new_status = 'hired' THEN 'hired'
      ELSE 'status_update'
    END
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Application status updated successfully',
    'message_id', v_message_id,
    'interview_id', v_interview_id
  );
END;
$$;

-- Function to get application details with messages and interviews
CREATE OR REPLACE FUNCTION get_application_details(p_application_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'application', row_to_json(a.*),
    'job', row_to_json(j.*),
    'company', row_to_json(c.*),
    'messages', COALESCE(
      (SELECT json_agg(row_to_json(m.*) ORDER BY m.created_at DESC)
       FROM application_messages m 
       WHERE m.application_id = p_application_id), 
      '[]'::json
    ),
    'interviews', COALESCE(
      (SELECT json_agg(row_to_json(i.*) ORDER BY i.scheduled_at DESC)
       FROM interviews i 
       WHERE i.application_id = p_application_id), 
      '[]'::json
    )
  ) INTO v_result
  FROM applications a
  LEFT JOIN jobs j ON a.job_id = j.id
  LEFT JOIN companies c ON j.company_id = c.id
  WHERE a.id = p_application_id;
  
  RETURN v_result;
END;
$$;
