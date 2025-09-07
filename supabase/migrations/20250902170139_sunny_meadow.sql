/*
  # Initial SkillMatch Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `companies` - Company information and profiles
    - `jobs` - Job postings with detailed information
    - `applications` - Job applications submitted by users
    - `saved_jobs` - Jobs saved by users for later viewing
    - `skills` - Master list of skills
    - `user_skills` - Skills associated with users
    - `job_skills` - Skills required for jobs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for employers to manage their company data
    - Add policies for public job viewing

  3. Features
    - Full-text search capabilities
    - Proper indexing for performance
    - Audit trails with timestamps
    - Flexible salary ranges
    - Support for remote work options
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('job-seeker', 'employer')),
  location text,
  current_job_title text,
  company_name text,
  industry text,
  bio text,
  website_url text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  phone text,
  profile_completion_percentage integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  industry text,
  size text,
  founded integer,
  headquarters text,
  website text,
  logo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  experience_level text NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  is_remote boolean DEFAULT false,
  responsibilities text[],
  requirements text[],
  benefits text[],
  education_requirements text,
  application_deadline timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'expired')),
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'under-review', 'interview', 'offer', 'hired', 'rejected')),
  cover_letter text,
  resume_url text,
  portfolio_url text,
  salary_expectation integer,
  available_start_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- User Skills Table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Job Skills Table
CREATE TABLE IF NOT EXISTS job_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, skill_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Company creators can update"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view active jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Job creators can view own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Employers can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Job creators can update own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Job creators can view applications to their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Job creators can update application status"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

-- RLS Policies for saved_jobs
CREATE POLICY "Users can manage own saved jobs"
  ON saved_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for skills
CREATE POLICY "Anyone can view skills"
  ON skills
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create skills"
  ON skills
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_skills
CREATE POLICY "Users can manage own skills"
  ON user_skills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for job_skills
CREATE POLICY "Anyone can view job skills"
  ON job_skills
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Job creators can manage job skills"
  ON job_skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_skills.job_id 
      AND jobs.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_skills.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING gin(to_tsvector('english', name || ' ' || description));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial skills
INSERT INTO skills (name, category) VALUES
  ('JavaScript', 'Programming'),
  ('React', 'Frontend'),
  ('Node.js', 'Backend'),
  ('Python', 'Programming'),
  ('TypeScript', 'Programming'),
  ('CSS', 'Frontend'),
  ('HTML', 'Frontend'),
  ('SQL', 'Database'),
  ('Git', 'Tools'),
  ('AWS', 'Cloud'),
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('GraphQL', 'API'),
  ('REST API', 'API'),
  ('MongoDB', 'Database'),
  ('PostgreSQL', 'Database'),
  ('Vue.js', 'Frontend'),
  ('Angular', 'Frontend'),
  ('Express.js', 'Backend'),
  ('Next.js', 'Frontend'),
  ('Tailwind CSS', 'Frontend'),
  ('Figma', 'Design'),
  ('Adobe Creative Suite', 'Design'),
  ('UI/UX Design', 'Design'),
  ('Product Management', 'Business'),
  ('Project Management', 'Business'),
  ('Agile', 'Methodology'),
  ('Scrum', 'Methodology'),
  ('Machine Learning', 'AI/ML'),
  ('Data Analysis', 'Analytics')
ON CONFLICT (name) DO NOTHING;