-- Messaging System and Additional Fixes for SkillMatch
-- This migration adds messaging capabilities and fixes various database issues

-- 1. Create Messages Table for communication between users
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  subject text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  message_type text DEFAULT 'general' CHECK (message_type IN ('general', 'application', 'interview', 'offer')),
  parent_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create Message Attachments Table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create Conversations Table for grouping messages
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id, job_id)
);

-- 4. Add account deletion audit table
CREATE TABLE IF NOT EXISTS account_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  deletion_reason text,
  deleted_at timestamptz DEFAULT now(),
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. Add proper application deletion policies
CREATE POLICY "Users can delete own applications"
  ON applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. RLS Policies for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can view message attachments"
  ON message_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_attachments.message_id
      AND (messages.sender_id = auth.uid() OR messages.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can add attachments to their messages"
  ON message_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- 7. Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('message-attachments', 'message-attachments', false, 10485760, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'image/jpeg', 'image/png', 'image/gif', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for message attachments storage
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Functions for proper account deletion
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to delete their own account
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;
  
  -- Store deletion record for audit
  INSERT INTO account_deletions (user_id, user_email, deleted_by)
  SELECT user_id_to_delete, email, user_id_to_delete
  FROM auth.users
  WHERE id = user_id_to_delete;
  
  -- Delete user data (will cascade to related tables)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;

-- 9. Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  completion_score integer := 0;
  profile_record user_profiles%ROWTYPE;
BEGIN
  -- Get the user's profile
  SELECT * INTO profile_record FROM user_profiles WHERE user_id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate completion based on filled fields
  IF profile_record.full_name IS NOT NULL AND length(trim(profile_record.full_name)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_record.location IS NOT NULL AND length(trim(profile_record.location)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.current_job_title IS NOT NULL AND length(trim(profile_record.current_job_title)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.bio IS NOT NULL AND length(trim(profile_record.bio)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_record.phone IS NOT NULL AND length(trim(profile_record.phone)) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF profile_record.linkedin_url IS NOT NULL AND length(trim(profile_record.linkedin_url)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.portfolio_url IS NOT NULL AND length(trim(profile_record.portfolio_url)) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.resume_url IS NOT NULL AND length(trim(profile_record.resume_url)) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_record.skills IS NOT NULL AND jsonb_array_length(profile_record.skills) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$$;

-- 10. Trigger to automatically update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- 11. Create indexes for messaging performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- 12. Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create conversation record
  INSERT INTO conversations (participant_1_id, participant_2_id, job_id, last_message_at)
  VALUES (
    LEAST(NEW.sender_id, NEW.recipient_id),
    GREATEST(NEW.sender_id, NEW.recipient_id),
    NEW.job_id,
    NEW.created_at
  )
  ON CONFLICT (participant_1_id, participant_2_id, job_id)
  DO UPDATE SET last_message_at = NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- 13. Add triggers for updating timestamps on new tables
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 14. Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_user_1 uuid, conversation_user_2 uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to mark their own received messages as read
  IF auth.uid() != conversation_user_2 THEN
    RAISE EXCEPTION 'Unauthorized: You can only mark your own messages as read';
  END IF;
  
  UPDATE messages
  SET is_read = true
  WHERE sender_id = conversation_user_1
    AND recipient_id = conversation_user_2
    AND is_read = false;
END;
$$;

-- 15. Add function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count integer;
BEGIN
  -- Only allow users to check their own unread count
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: You can only check your own message count';
  END IF;
  
  SELECT COUNT(*)
  INTO unread_count
  FROM messages
  WHERE recipient_id = user_id_param
    AND is_read = false;
    
  RETURN COALESCE(unread_count, 0);
END;
$$;