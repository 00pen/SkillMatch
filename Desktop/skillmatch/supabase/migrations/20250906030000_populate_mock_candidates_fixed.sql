-- Migration to populate user_profiles table with mock candidate data
-- This ensures the candidates page has data to display
-- Fixed to match actual database schema

-- Insert mock job seeker profiles
INSERT INTO user_profiles (
  id,
  full_name,
  email,
  role,
  location,
  phone,
  bio,
  date_of_birth,
  gender,
  nationality,
  current_job_title,
  company_name,
  industry,
  years_experience,
  experience_level,
  expected_salary_min,
  expected_salary_max,
  salary_currency,
  employment_type_preferences,
  remote_work_preference,
  availability,
  notice_period,
  website_url,
  linkedin_url,
  github_url,
  portfolio_url,
  skills,
  languages,
  certifications,
  education,
  work_experience,
  resume_url,
  cover_letter_url,
  profile_image_url,
  profile_completion,
  is_active,
  created_at,
  updated_at,
  portfolio_files,
  profile_picture_url,
  oauth_provider
) VALUES 
(
  'mock-candidate-1',
  'John Smith',
  'john.smith@email.com',
  'job_seeker',
  'San Francisco, CA',
  '+1 (555) 123-4567',
  'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies. Passionate about building scalable applications and leading development teams. Proven track record of delivering high-quality software solutions.',
  '1990-05-15',
  'male',
  'American',
  'Senior Software Engineer',
  'TechCorp Inc.',
  'technology',
  5,
  'senior',
  120000,
  150000,
  'USD',
  '['full-time', 'contract'],
  'hybrid',
  'Available immediately',
  '2 weeks',
  'https://johnsmith.dev',
  'https://linkedin.com/in/johnsmith',
  'https://github.com/johnsmith',
  'https://johnsmith.dev',
  ARRAY['React', 'Node.js', 'JavaScript', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL', 'TypeScript', 'Kubernetes'],
  ARRAY['English', 'Spanish', 'French'],
  '[
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "2021",
      "credential_id": "AWS-12345"
    },
    {
      "name": "Certified Kubernetes Administrator",
      "issuer": "Cloud Native Computing Foundation",
      "date": "2020",
      "credential_id": "CKA-67890"
    }
  ]'::jsonb,
  '[
    {
      "institution": "Stanford University",
      "degree": "Master of Science",
      "field": "Computer Science",
      "start_date": "2016",
      "end_date": "2018",
      "gpa": "3.8"
    },
    {
      "institution": "UC Berkeley",
      "degree": "Bachelor of Science",
      "field": "Computer Engineering",
      "start_date": "2012",
      "end_date": "2016",
      "gpa": "3.6"
    }
  ]'::jsonb,
  '[
    {
      "company": "TechCorp Inc.",
      "position": "Senior Software Engineer",
      "job_title": "Senior Software Engineer",
      "industry": "technology",
      "start_date": "2020",
      "end_date": "Present",
      "description": "Lead a team of 5 developers building scalable web applications. Implemented microservices architecture resulting in 40% performance improvement. Mentored junior developers and established code review processes.",
      "technologies": ["React", "Node.js", "AWS", "Docker", "PostgreSQL"]
    },
    {
      "company": "StartupXYZ",
      "position": "Full Stack Developer",
      "job_title": "Full Stack Developer",
      "industry": "technology",
      "start_date": "2018",
      "end_date": "2020",
      "description": "Built end-to-end web applications from concept to deployment. Worked directly with founders to define product requirements. Implemented CI/CD pipelines and automated testing.",
      "technologies": ["Vue.js", "Python", "PostgreSQL", "Redis", "Jenkins"]
    }
  ]'::jsonb,
  null,
  null,
  85,
  true,
  NOW(),
  NOW(),
  '[
    {"type": "linkedin", "url": "https://linkedin.com/in/johnsmith"},
    {"type": "github", "url": "https://github.com/johnsmith"},
    {"type": "portfolio", "url": "https://johnsmith.dev"}
  ]'::jsonb,
  null,
  null
),
(
  'mock-candidate-2',
  'Sarah Johnson',
  'sarah.johnson@email.com',
  'job_seeker',
  'New York, NY',
  '+1 (555) 987-6543',
  'Strategic marketing professional with a track record of launching successful products. Expert in data-driven marketing campaigns and cross-functional collaboration. Passionate about driving growth through innovative marketing strategies.',
  '1992-08-22',
  'female',
  'American',
  'Product Marketing Manager',
  'MarketingPro',
  'technology',
  3,
  'mid',
  90000,
  110000,
  'USD',
  '['full-time', 'contract'],
  'remote',
  '2 weeks notice',
  '2 weeks',
  'https://sarahjohnson.com',
  'https://linkedin.com/in/sarahjohnson',
  null,
  'https://sarahjohnson.com',
  ARRAY['Product Marketing', 'Analytics', 'A/B Testing', 'Salesforce', 'HubSpot', 'Content Marketing', 'SEO', 'Social Media Marketing'],
  ARRAY['English', 'German'],
  '[
    {
      "name": "Google Analytics Certified",
      "issuer": "Google",
      "date": "2021",
      "credential_id": "GA-54321"
    }
  ]'::jsonb,
  '[
    {
      "institution": "Columbia University",
      "degree": "Master of Business Administration",
      "field": "Marketing",
      "start_date": "2018",
      "end_date": "2020",
      "gpa": "3.9"
    }
  ]'::jsonb,
  '[
    {
      "company": "MarketingPro",
      "position": "Product Marketing Manager",
      "job_title": "Product Marketing Manager",
      "industry": "technology",
      "start_date": "2021",
      "end_date": "Present",
      "description": "Led go-to-market strategies for 3 major product launches. Increased user acquisition by 65% through targeted campaigns. Managed marketing budget of $2M annually.",
      "technologies": ["HubSpot", "Salesforce", "Google Analytics", "Mailchimp"]
    }
  ]'::jsonb,
  null,
  null,
  80,
  true,
  NOW(),
  NOW(),
  '[
    {"type": "linkedin", "url": "https://linkedin.com/in/sarahjohnson"},
    {"type": "portfolio", "url": "https://sarahjohnson.com"}
  ]'::jsonb,
  null,
  null
),
(
  'mock-candidate-3',
  'Alex Chen',
  'alex.chen@email.com',
  'job_seeker',
  'Austin, TX',
  '+1 (555) 456-7890',
  'Creative UX/UI designer with a passion for creating intuitive and beautiful user experiences. Experienced in user research, prototyping, and design systems. Strong advocate for accessibility and inclusive design.',
  '1995-03-10',
  'non-binary',
  'American',
  'UX/UI Designer',
  'DesignCo',
  'technology',
  3,
  'mid',
  75000,
  95000,
  'USD',
  '['full-time', 'freelance'],
  'hybrid',
  'Available in 1 month',
  '1 month',
  'https://alexchen.design',
  'https://linkedin.com/in/alexchen',
  null,
  'https://alexchen.design',
  ARRAY['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems', 'HTML', 'CSS', 'JavaScript'],
  ARRAY['English', 'Mandarin'],
  '[
    {
      "name": "Google UX Design Certificate",
      "issuer": "Google",
      "date": "2020",
      "credential_id": "GUX-98765"
    }
  ]'::jsonb,
  '[
    {
      "institution": "Art Center College of Design",
      "degree": "Bachelor of Fine Arts",
      "field": "Interaction Design",
      "start_date": "2016",
      "end_date": "2020",
      "gpa": "3.7"
    }
  ]'::jsonb,
  '[
    {
      "company": "DesignCo",
      "position": "UX/UI Designer",
      "job_title": "UX/UI Designer",
      "industry": "technology",
      "start_date": "2021",
      "end_date": "Present",
      "description": "Design user interfaces for web and mobile applications. Conduct user research and usability testing. Collaborate with product managers and developers to implement design solutions.",
      "technologies": ["Figma", "Sketch", "Adobe XD", "InVision", "Principle"]
    },
    {
      "company": "StartupABC",
      "position": "Junior Designer",
      "job_title": "Junior Designer",
      "industry": "technology",
      "start_date": "2020",
      "end_date": "2021",
      "description": "Created visual designs for marketing materials and web interfaces. Assisted senior designers with user research and prototyping.",
      "technologies": ["Photoshop", "Illustrator", "Figma"]
    }
  ]'::jsonb,
  null,
  null,
  75,
  true,
  NOW(),
  NOW(),
  '[
    {"type": "linkedin", "url": "https://linkedin.com/in/alexchen"},
    {"type": "portfolio", "url": "https://alexchen.design"},
    {"type": "dribbble", "url": "https://dribbble.com/alexchen"}
  ]'::jsonb,
  null,
  null
),
(
  'mock-candidate-4',
  'Maria Garcia',
  'maria.garcia@email.com',
  'job_seeker',
  'Los Angeles, CA',
  '+1 (555) 321-9876',
  'Data scientist with expertise in machine learning, statistical analysis, and data visualization. Passionate about using data to solve complex business problems and drive strategic decisions.',
  '1988-12-05',
  'female',
  'Mexican-American',
  'Data Scientist',
  'DataTech Solutions',
  'technology',
  3,
  'mid',
  95000,
  125000,
  'USD',
  '['full-time', 'contract'],
  'remote',
  'Available immediately',
  '2 weeks',
  'https://mariagarcia.dev',
  'https://linkedin.com/in/mariagarcia',
  'https://github.com/mariagarcia',
  'https://mariagarcia.dev',
  ARRAY['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Scikit-learn', 'Tableau', 'Power BI'],
  ARRAY['English', 'Spanish'],
  '[
    {
      "name": "AWS Certified Machine Learning - Specialty",
      "issuer": "Amazon Web Services",
      "date": "2021",
      "credential_id": "AWS-ML-54321"
    }
  ]'::jsonb,
  '[
    {
      "institution": "UCLA",
      "degree": "Master of Science",
      "field": "Data Science",
      "start_date": "2018",
      "end_date": "2020",
      "gpa": "3.9"
    },
    {
      "institution": "UC San Diego",
      "degree": "Bachelor of Science",
      "field": "Mathematics",
      "start_date": "2014",
      "end_date": "2018",
      "gpa": "3.8"
    }
  ]'::jsonb,
  '[
    {
      "company": "DataTech Solutions",
      "position": "Data Scientist",
      "job_title": "Data Scientist",
      "industry": "technology",
      "start_date": "2020",
      "end_date": "Present",
      "description": "Develop machine learning models for predictive analytics. Create data pipelines and automated reporting systems. Collaborate with business stakeholders to identify data-driven opportunities.",
      "technologies": ["Python", "SQL", "TensorFlow", "AWS", "Docker"]
    }
  ]'::jsonb,
  null,
  null,
  90,
  true,
  NOW(),
  NOW(),
  '[
    {"type": "linkedin", "url": "https://linkedin.com/in/mariagarcia"},
    {"type": "github", "url": "https://github.com/mariagarcia"},
    {"type": "portfolio", "url": "https://mariagarcia.dev"}
  ]'::jsonb,
  null,
  null
)
ON CONFLICT (id) DO NOTHING;

-- Update profile completion for existing profiles that might be incomplete
UPDATE user_profiles 
SET profile_completion = CASE 
  WHEN full_name IS NOT NULL AND bio IS NOT NULL AND skills IS NOT NULL THEN 70
  WHEN full_name IS NOT NULL AND bio IS NOT NULL THEN 50
  WHEN full_name IS NOT NULL THEN 30
  ELSE 10
END
WHERE role = 'job_seeker' AND profile_completion < 50;
