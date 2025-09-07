-- ============================================================================
-- Sample Data Insertion Script
-- Adds comprehensive sample data for demonstration purposes
-- Run this in your Supabase SQL Editor after the main database setup
-- ============================================================================

-- ============================================================================
-- INSERT COMPREHENSIVE SAMPLE SKILLS
-- ============================================================================

INSERT INTO skills (name, category) VALUES
-- Programming Languages
('JavaScript', 'programming'),
('TypeScript', 'programming'),
('Python', 'programming'),
('Java', 'programming'),
('C#', 'programming'),
('C++', 'programming'),
('Go', 'programming'),
('Rust', 'programming'),
('Swift', 'programming'),
('Kotlin', 'programming'),
('PHP', 'programming'),
('Ruby', 'programming'),
('Scala', 'programming'),
('R', 'programming'),
('MATLAB', 'programming'),

-- Frontend Technologies
('React', 'frontend'),
('Vue.js', 'frontend'),
('Angular', 'frontend'),
('Svelte', 'frontend'),
('Next.js', 'frontend'),
('Nuxt.js', 'frontend'),
('Gatsby', 'frontend'),
('HTML5', 'frontend'),
('CSS3', 'frontend'),
('Sass', 'frontend'),
('Less', 'frontend'),
('Tailwind CSS', 'frontend'),
('Bootstrap', 'frontend'),
('Material-UI', 'frontend'),
('Ant Design', 'frontend'),

-- Backend Technologies
('Node.js', 'backend'),
('Express.js', 'backend'),
('FastAPI', 'backend'),
('Django', 'backend'),
('Flask', 'backend'),
('Spring Boot', 'backend'),
('ASP.NET Core', 'backend'),
('Laravel', 'backend'),
('Ruby on Rails', 'backend'),
('Gin', 'backend'),
('Fiber', 'backend'),
('Koa.js', 'backend'),

-- Databases
('PostgreSQL', 'database'),
('MySQL', 'database'),
('MongoDB', 'database'),
('Redis', 'database'),
('SQLite', 'database'),
('Oracle', 'database'),
('SQL Server', 'database'),
('Cassandra', 'database'),
('DynamoDB', 'database'),
('Elasticsearch', 'database'),
('Neo4j', 'database'),

-- Cloud & DevOps
('AWS', 'cloud'),
('Azure', 'cloud'),
('Google Cloud', 'cloud'),
('Docker', 'devops'),
('Kubernetes', 'devops'),
('Terraform', 'devops'),
('Jenkins', 'devops'),
('GitLab CI', 'devops'),
('GitHub Actions', 'devops'),
('Ansible', 'devops'),
('Chef', 'devops'),
('Puppet', 'devops'),

-- Tools & Version Control
('Git', 'tools'),
('GitHub', 'tools'),
('GitLab', 'tools'),
('Bitbucket', 'tools'),
('Jira', 'tools'),
('Confluence', 'tools'),
('Slack', 'tools'),
('Figma', 'tools'),
('Sketch', 'tools'),
('Adobe XD', 'tools'),
('Postman', 'tools'),
('Insomnia', 'tools'),

-- AI/ML
('Machine Learning', 'ai_ml'),
('Deep Learning', 'ai_ml'),
('TensorFlow', 'ai_ml'),
('PyTorch', 'ai_ml'),
('Scikit-learn', 'ai_ml'),
('Pandas', 'ai_ml'),
('NumPy', 'ai_ml'),
('OpenCV', 'ai_ml'),
('NLP', 'ai_ml'),
('Computer Vision', 'ai_ml'),

-- Mobile Development
('React Native', 'mobile'),
('Flutter', 'mobile'),
('Ionic', 'mobile'),
('Xamarin', 'mobile'),
('Cordova', 'mobile'),
('Android Studio', 'mobile'),
('Xcode', 'mobile'),

-- Business & Soft Skills
('Project Management', 'business'),
('Agile', 'business'),
('Scrum', 'business'),
('Kanban', 'business'),
('Leadership', 'business'),
('Communication', 'business'),
('Problem Solving', 'business'),
('Team Collaboration', 'business'),
('Time Management', 'business'),
('Critical Thinking', 'business')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE COMPANIES
-- ============================================================================

INSERT INTO companies (id, name, description, industry, size, founded, headquarters, website, logo_url, created_by, is_verified) VALUES
(gen_random_uuid(), 'TechCorp Inc.', 'Leading technology company specializing in cloud solutions and AI-driven applications.', 'Technology', '1000-5000', 2010, 'San Francisco, CA', 'https://techcorp.com', null, null, true),
(gen_random_uuid(), 'DataFlow Systems', 'Big data analytics and machine learning solutions for enterprise clients.', 'Data & Analytics', '500-1000', 2015, 'Austin, TX', 'https://dataflow.com', null, null, true),
(gen_random_uuid(), 'CloudScale Technologies', 'Cloud infrastructure and DevOps consulting services.', 'Cloud Computing', '100-500', 2018, 'Seattle, WA', 'https://cloudscale.tech', null, null, true),
(gen_random_uuid(), 'FinTech Solutions', 'Digital banking and financial technology innovations.', 'Financial Services', '1000-5000', 2012, 'New York, NY', 'https://fintech-solutions.com', null, null, true),
(gen_random_uuid(), 'HealthTech Innovations', 'Healthcare technology and telemedicine platforms.', 'Healthcare', '500-1000', 2017, 'Boston, MA', 'https://healthtech.io', null, null, true),
(gen_random_uuid(), 'EduTech Global', 'Educational technology and online learning platforms.', 'Education', '100-500', 2019, 'Chicago, IL', 'https://edutech.global', null, null, true),
(gen_random_uuid(), 'GreenTech Solutions', 'Sustainable technology and renewable energy solutions.', 'Clean Energy', '100-500', 2020, 'Portland, OR', 'https://greentech.solutions', null, null, true),
(gen_random_uuid(), 'RetailTech Pro', 'E-commerce and retail technology solutions.', 'Retail', '500-1000', 2016, 'Los Angeles, CA', 'https://retailtech.pro', null, null, true),
(gen_random_uuid(), 'GameStudio X', 'Mobile and web game development studio.', 'Gaming', '50-100', 2021, 'San Diego, CA', 'https://gamestudio.x', null, null, true),
(gen_random_uuid(), 'CyberSec Solutions', 'Cybersecurity and information security services.', 'Cybersecurity', '100-500', 2014, 'Washington, DC', 'https://cybersec.solutions', null, null, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE JOBS
-- ============================================================================

-- Get company IDs for job creation
WITH company_ids AS (
  SELECT id, name FROM companies LIMIT 10
)
INSERT INTO jobs (
  id, title, description, requirements, responsibilities, benefits, 
  location, job_type, employment_type, experience_level, 
  salary_min, salary_max, salary_currency, is_remote, 
  company_id, created_by, status, application_deadline, start_date,
  contact_email, contact_phone, is_urgent, application_instructions
)
SELECT 
  gen_random_uuid(),
  job_data.title,
  job_data.description,
  job_data.requirements,
  job_data.responsibilities,
  job_data.benefits,
  job_data.location,
  job_data.job_type,
  job_data.employment_type,
  job_data.experience_level,
  job_data.salary_min,
  job_data.salary_max,
  job_data.salary_currency,
  job_data.is_remote,
  c.id,
  null,
  'active',
  job_data.application_deadline,
  job_data.start_date,
  job_data.contact_email,
  job_data.contact_phone,
  job_data.is_urgent,
  job_data.application_instructions
FROM company_ids c
CROSS JOIN (
  VALUES 
  ('Senior Full Stack Developer', 
   'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for building scalable web applications using modern technologies like React, Node.js, and cloud platforms.',
   'Bachelor''s degree in Computer Science or related field. 5+ years of experience with React, Node.js, and cloud technologies. Strong problem-solving skills and experience with agile development methodologies.',
   'Lead development of new features, mentor junior developers, collaborate with product team, ensure code quality and best practices, participate in architecture decisions, and drive technical innovation.',
   'Competitive salary, equity package, comprehensive health insurance, 401k matching, flexible PTO, remote work options, professional development budget, and modern office space.',
   'San Francisco, CA', 'full-time', 'full-time', 'senior', 120000, 150000, 'USD', true,
   CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '45 days',
   'hiring@techcorp.com', '+1 (555) 123-4567', false,
   'Please include your portfolio and a brief cover letter explaining your interest in the role.'),

  ('Frontend Developer', 
   'Join our frontend team to build beautiful, responsive user interfaces using React and modern CSS frameworks. You''ll work closely with designers and backend developers to create exceptional user experiences.',
   '3+ years of experience with React, JavaScript, HTML5, CSS3. Experience with state management libraries like Redux or Zustand. Familiarity with testing frameworks like Jest and React Testing Library.',
   'Develop responsive web applications, implement UI/UX designs, optimize application performance, write unit and integration tests, collaborate with design team, and maintain code quality standards.',
   'Competitive salary, health insurance, dental and vision coverage, 401k matching, flexible work hours, remote work options, and annual learning budget.',
   'Austin, TX', 'full-time', 'full-time', 'mid', 80000, 110000, 'USD', true,
   CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '40 days',
   'careers@dataflow.com', '+1 (555) 234-5678', false,
   'Please share your GitHub profile and any relevant portfolio projects.'),

  ('Backend Engineer', 
   'We need a Backend Engineer to design and implement scalable server-side applications. You''ll work with microservices architecture, databases, and cloud platforms to build robust backend systems.',
   'Bachelor''s degree in Computer Science or equivalent experience. 4+ years of backend development experience with Python, Java, or Node.js. Experience with databases, APIs, and cloud platforms.',
   'Design and implement RESTful APIs, optimize database performance, implement security best practices, write comprehensive tests, deploy applications to cloud platforms, and collaborate with frontend teams.',
   'Competitive salary, stock options, comprehensive health benefits, flexible PTO, remote work, professional development opportunities, and team building events.',
   'Seattle, WA', 'full-time', 'full-time', 'mid', 90000, 130000, 'USD', true,
   CURRENT_DATE + INTERVAL '35 days', CURRENT_DATE + INTERVAL '50 days',
   'jobs@cloudscale.tech', '+1 (555) 345-6789', false,
   'Include examples of your backend projects and any open source contributions.'),

  ('DevOps Engineer', 
   'Join our DevOps team to manage cloud infrastructure, implement CI/CD pipelines, and ensure high availability of our services. You''ll work with Docker, Kubernetes, and cloud platforms.',
   '3+ years of DevOps experience with Docker, Kubernetes, and cloud platforms (AWS, Azure, or GCP). Experience with infrastructure as code tools like Terraform. Strong scripting skills in Python or Bash.',
   'Manage cloud infrastructure, implement and maintain CI/CD pipelines, monitor system performance, ensure security compliance, automate deployment processes, and collaborate with development teams.',
   'Competitive salary, comprehensive benefits, flexible work arrangements, professional development budget, and opportunities for career growth.',
   'New York, NY', 'full-time', 'full-time', 'senior', 110000, 140000, 'USD', true,
   CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '35 days',
   'careers@fintech-solutions.com', '+1 (555) 456-7890', true,
   'Please describe your experience with cloud platforms and automation tools.'),

  ('Data Scientist', 
   'We''re looking for a Data Scientist to analyze large datasets, build machine learning models, and provide insights to drive business decisions. You''ll work with Python, SQL, and various ML frameworks.',
   'Master''s degree in Data Science, Statistics, or related field. 3+ years of experience with Python, SQL, and machine learning libraries. Experience with data visualization and statistical analysis.',
   'Analyze large datasets, build and deploy machine learning models, create data visualizations, collaborate with business stakeholders, present findings to management, and maintain data pipelines.',
   'Competitive salary, health insurance, 401k matching, flexible PTO, remote work options, conference attendance budget, and access to cutting-edge tools and technologies.',
   'Boston, MA', 'full-time', 'full-time', 'mid', 95000, 125000, 'USD', true,
   CURRENT_DATE + INTERVAL '40 days', CURRENT_DATE + INTERVAL '55 days',
   'jobs@healthtech.io', '+1 (555) 567-8901', false,
   'Please include examples of your data science projects and any publications.'),

  ('Product Manager', 
   'Lead product development initiatives from conception to launch. You''ll work with cross-functional teams to define product requirements, prioritize features, and ensure successful product delivery.',
   'Bachelor''s degree in Business, Engineering, or related field. 4+ years of product management experience. Strong analytical skills and experience with agile development methodologies.',
   'Define product strategy and roadmap, gather and prioritize requirements, work with engineering and design teams, analyze market trends, manage product launches, and track key metrics.',
   'Competitive salary, equity participation, comprehensive benefits, flexible work arrangements, professional development opportunities, and leadership training programs.',
   'Chicago, IL', 'full-time', 'full-time', 'senior', 100000, 140000, 'USD', true,
   CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '45 days',
   'careers@edutech.global', '+1 (555) 678-9012', false,
   'Please provide examples of products you''ve managed and their impact on business metrics.'),

  ('UX/UI Designer', 
   'Create intuitive and engaging user experiences for our digital products. You''ll work with product managers and developers to design user interfaces that meet both user needs and business goals.',
   'Bachelor''s degree in Design, HCI, or related field. 3+ years of UX/UI design experience. Proficiency in Figma, Sketch, or Adobe Creative Suite. Experience with user research and prototyping.',
   'Conduct user research and usability testing, create wireframes and prototypes, design user interfaces, collaborate with development teams, maintain design systems, and present design solutions to stakeholders.',
   'Competitive salary, health benefits, flexible work arrangements, design tool subscriptions, conference attendance, and opportunities to work on diverse projects.',
   'Portland, OR', 'full-time', 'full-time', 'mid', 75000, 105000, 'USD', true,
   CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '40 days',
   'design@greentech.solutions', '+1 (555) 789-0123', false,
   'Please share your portfolio and describe your design process and methodology.'),

  ('Mobile App Developer', 
   'Develop native and cross-platform mobile applications for iOS and Android. You''ll work with React Native or Flutter to create engaging mobile experiences for our users.',
   '3+ years of mobile development experience with React Native, Flutter, or native iOS/Android development. Experience with mobile app deployment and app store guidelines.',
   'Develop mobile applications, implement responsive designs, integrate with backend APIs, optimize app performance, conduct testing and debugging, and collaborate with design and backend teams.',
   'Competitive salary, comprehensive benefits, flexible work arrangements, mobile device budget, app store credits, and opportunities to work on innovative mobile projects.',
   'Los Angeles, CA', 'full-time', 'full-time', 'mid', 85000, 115000, 'USD', true,
   CURRENT_DATE + INTERVAL '35 days', CURRENT_DATE + INTERVAL '50 days',
   'mobile@retailtech.pro', '+1 (555) 890-1234', false,
   'Please share examples of mobile apps you''ve developed and any app store links.'),

  ('Game Developer', 
   'Create engaging games for mobile and web platforms. You''ll work with Unity, Unreal Engine, or web technologies to develop games that provide exceptional user experiences.',
   'Bachelor''s degree in Game Development, Computer Science, or related field. 2+ years of game development experience. Proficiency in Unity, Unreal Engine, or web game development technologies.',
   'Develop game mechanics and features, implement game logic, optimize game performance, create game assets, conduct playtesting, and collaborate with artists and designers.',
   'Competitive salary, health insurance, flexible work arrangements, game development tools and licenses, gaming equipment budget, and opportunities to work on exciting game projects.',
   'San Diego, CA', 'full-time', 'full-time', 'mid', 70000, 100000, 'USD', true,
   CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '45 days',
   'jobs@gamestudio.x', '+1 (555) 901-2345', false,
   'Please share your game development portfolio and any published games.'),

  ('Cybersecurity Analyst', 
   'Protect our systems and data from cyber threats. You''ll monitor security systems, investigate incidents, and implement security measures to ensure the safety of our digital infrastructure.',
   'Bachelor''s degree in Cybersecurity, Computer Science, or related field. 3+ years of cybersecurity experience. Knowledge of security tools, threat analysis, and incident response procedures.',
   'Monitor security systems and networks, investigate security incidents, implement security measures, conduct vulnerability assessments, develop security policies, and provide security training to staff.',
   'Competitive salary, comprehensive benefits, flexible work arrangements, security certifications support, professional development opportunities, and access to cutting-edge security tools.',
   'Washington, DC', 'full-time', 'full-time', 'mid', 90000, 120000, 'USD', true,
   CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '35 days',
   'security@cybersec.solutions', '+1 (555) 012-3456', true,
   'Please describe your experience with security tools and any relevant certifications.')
) AS job_data(title, description, requirements, responsibilities, benefits, location, job_type, employment_type, experience_level, salary_min, salary_max, salary_currency, is_remote, application_deadline, start_date, contact_email, contact_phone, is_urgent, application_instructions)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE USER PROFILES (CANDIDATES)
-- ============================================================================

-- Create sample candidate profiles
INSERT INTO user_profiles (
  id, full_name, email, role, location, phone, bio, 
  current_job_title, company_name, industry, years_experience, 
  experience_level, expected_salary_min, expected_salary_max, 
  salary_currency, employment_type_preferences, remote_work_preference,
  availability, notice_period, website_url, linkedin_url, github_url,
  skills, languages, certifications, profile_completion, is_active
) VALUES
(gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@email.com', 'job_seeker', 'San Francisco, CA', '+1 (555) 100-0001', 
 'Passionate full-stack developer with 5+ years of experience building scalable web applications. I love working with modern technologies and solving complex problems.',
 'Senior Software Engineer', 'TechCorp Inc.', 'Technology', 5, 'senior', 120000, 150000, 'USD', 
 ARRAY['full-time', 'contract'], 'hybrid', 'available', '2-weeks',
 'https://sarahjohnson.dev', 'https://linkedin.com/in/sarahjohnson', 'https://github.com/sarahjohnson',
 ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'], 
 ARRAY['English', 'Spanish'], ARRAY['AWS Certified Developer', 'React Professional'], 85, true),

(gen_random_uuid(), 'Michael Chen', 'michael.chen@email.com', 'job_seeker', 'Austin, TX', '+1 (555) 100-0002',
 'Frontend specialist with a passion for creating beautiful, user-friendly interfaces. I have extensive experience with React, Vue.js, and modern CSS frameworks.',
 'Frontend Developer', 'DataFlow Systems', 'Technology', 3, 'mid', 80000, 110000, 'USD',
 ARRAY['full-time'], 'remote', 'available', '1-month',
 'https://michaelchen.design', 'https://linkedin.com/in/michaelchen', 'https://github.com/michaelchen',
 ARRAY['JavaScript', 'React', 'Vue.js', 'TypeScript', 'CSS3', 'Sass', 'Figma'], 
 ARRAY['English', 'Mandarin'], ARRAY['Google UX Design Certificate'], 78, true),

(gen_random_uuid(), 'Emily Rodriguez', 'emily.rodriguez@email.com', 'job_seeker', 'Seattle, WA', '+1 (555) 100-0003',
 'Backend engineer with expertise in Python, Java, and cloud technologies. I enjoy building robust, scalable systems and working with microservices architecture.',
 'Backend Engineer', 'CloudScale Technologies', 'Technology', 4, 'mid', 90000, 130000, 'USD',
 ARRAY['full-time', 'contract'], 'hybrid', 'available', '2-weeks',
 'https://emilyrodriguez.tech', 'https://linkedin.com/in/emilyrodriguez', 'https://github.com/emilyrodriguez',
 ARRAY['Python', 'Java', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'], 
 ARRAY['English', 'Spanish'], ARRAY['AWS Solutions Architect', 'Oracle Java Certified'], 82, true),

(gen_random_uuid(), 'David Kim', 'david.kim@email.com', 'job_seeker', 'New York, NY', '+1 (555) 100-0004',
 'DevOps engineer with a strong background in cloud infrastructure and automation. I specialize in CI/CD pipelines, containerization, and infrastructure as code.',
 'DevOps Engineer', 'FinTech Solutions', 'Financial Services', 5, 'senior', 110000, 140000, 'USD',
 ARRAY['full-time'], 'hybrid', 'available', '1-month',
 'https://davidkim.devops', 'https://linkedin.com/in/davidkim', 'https://github.com/davidkim',
 ARRAY['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Python', 'Bash'], 
 ARRAY['English', 'Korean'], ARRAY['AWS DevOps Engineer', 'Kubernetes Administrator'], 88, true),

(gen_random_uuid(), 'Lisa Wang', 'lisa.wang@email.com', 'job_seeker', 'Boston, MA', '+1 (555) 100-0005',
 'Data scientist with expertise in machine learning, statistical analysis, and data visualization. I love turning complex data into actionable insights.',
 'Data Scientist', 'HealthTech Innovations', 'Healthcare', 3, 'mid', 95000, 125000, 'USD',
 ARRAY['full-time'], 'remote', 'available', '2-weeks',
 'https://lisawang.data', 'https://linkedin.com/in/lisawang', 'https://github.com/lisawang',
 ARRAY['Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Tableau'], 
 ARRAY['English', 'Mandarin'], ARRAY['Google Data Analytics Certificate', 'AWS Machine Learning'], 90, true),

(gen_random_uuid(), 'James Wilson', 'james.wilson@email.com', 'job_seeker', 'Chicago, IL', '+1 (555) 100-0006',
 'Product manager with a technical background and passion for building products that users love. I have experience leading cross-functional teams and driving product strategy.',
 'Product Manager', 'EduTech Global', 'Education', 4, 'senior', 100000, 140000, 'USD',
 ARRAY['full-time'], 'hybrid', 'available', '1-month',
 'https://jameswilson.pm', 'https://linkedin.com/in/jameswilson', 'https://github.com/jameswilson',
 ARRAY['Product Management', 'Agile', 'Scrum', 'Analytics', 'SQL', 'Figma'], 
 ARRAY['English'], ARRAY['Certified Scrum Product Owner', 'Google Analytics Certified'], 75, true),

(gen_random_uuid(), 'Maria Garcia', 'maria.garcia@email.com', 'job_seeker', 'Portland, OR', '+1 (555) 100-0007',
 'UX/UI designer with a focus on creating intuitive and accessible user experiences. I have experience with user research, prototyping, and design systems.',
 'UX/UI Designer', 'GreenTech Solutions', 'Clean Energy', 3, 'mid', 75000, 105000, 'USD',
 ARRAY['full-time', 'contract'], 'remote', 'available', '2-weeks',
 'https://mariagarcia.design', 'https://linkedin.com/in/mariagarcia', 'https://dribbble.com/mariagarcia',
 ARRAY['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'HTML', 'CSS'], 
 ARRAY['English', 'Spanish'], ARRAY['Google UX Design Certificate', 'Adobe Certified Expert'], 80, true),

(gen_random_uuid(), 'Alex Thompson', 'alex.thompson@email.com', 'job_seeker', 'Los Angeles, CA', '+1 (555) 100-0008',
 'Mobile app developer with experience in both native iOS/Android and cross-platform development. I love creating engaging mobile experiences.',
 'Mobile App Developer', 'RetailTech Pro', 'Retail', 3, 'mid', 85000, 115000, 'USD',
 ARRAY['full-time'], 'hybrid', 'available', '2-weeks',
 'https://alexthompson.mobile', 'https://linkedin.com/in/alexthompson', 'https://github.com/alexthompson',
 ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'JavaScript', 'Firebase'], 
 ARRAY['English'], ARRAY['Apple Developer Program', 'Google Play Console'], 77, true),

(gen_random_uuid(), 'Jessica Lee', 'jessica.lee@email.com', 'job_seeker', 'San Diego, CA', '+1 (555) 100-0009',
 'Game developer with a passion for creating immersive gaming experiences. I have experience with Unity, Unreal Engine, and web-based game development.',
 'Game Developer', 'GameStudio X', 'Gaming', 2, 'mid', 70000, 100000, 'USD',
 ARRAY['full-time', 'contract'], 'hybrid', 'available', '1-month',
 'https://jessicalee.games', 'https://linkedin.com/in/jessicalee', 'https://github.com/jessicalee',
 ARRAY['Unity', 'C#', 'JavaScript', 'HTML5', 'CSS3', 'Game Design'], 
 ARRAY['English', 'Korean'], ARRAY['Unity Certified Developer'], 72, true),

(gen_random_uuid(), 'Robert Brown', 'robert.brown@email.com', 'job_seeker', 'Washington, DC', '+1 (555) 100-0010',
 'Cybersecurity analyst with expertise in threat detection, incident response, and security compliance. I help organizations protect their digital assets.',
 'Cybersecurity Analyst', 'CyberSec Solutions', 'Cybersecurity', 3, 'mid', 90000, 120000, 'USD',
 ARRAY['full-time'], 'hybrid', 'available', '2-weeks',
 'https://robertbrown.security', 'https://linkedin.com/in/robertbrown', 'https://github.com/robertbrown',
 ARRAY['Cybersecurity', 'Network Security', 'Python', 'SIEM', 'Penetration Testing', 'Compliance'], 
 ARRAY['English'], ARRAY['CISSP', 'CEH', 'Security+'], 85, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE JOB-SKILL RELATIONSHIPS
-- ============================================================================

-- Create job-skill relationships for the sample jobs
WITH job_skills_data AS (
  SELECT 
    j.id as job_id,
    s.id as skill_id,
    CASE 
      WHEN s.name IN ('JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL') THEN true
      ELSE false
    END as is_required
  FROM jobs j
  CROSS JOIN skills s
  WHERE j.title = 'Senior Full Stack Developer'
    AND s.name IN ('JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'TypeScript', 'Git', 'Agile')
  
  UNION ALL
  
  SELECT 
    j.id as job_id,
    s.id as skill_id,
    CASE 
      WHEN s.name IN ('React', 'JavaScript', 'HTML5', 'CSS3') THEN true
      ELSE false
    END as is_required
  FROM jobs j
  CROSS JOIN skills s
  WHERE j.title = 'Frontend Developer'
    AND s.name IN ('React', 'JavaScript', 'HTML5', 'CSS3', 'TypeScript', 'Redux', 'Jest', 'Figma')
  
  UNION ALL
  
  SELECT 
    j.id as job_id,
    s.id as skill_id,
    CASE 
      WHEN s.name IN ('Python', 'Java', 'Node.js', 'PostgreSQL') THEN true
      ELSE false
    END as is_required
  FROM jobs j
  CROSS JOIN skills s
  WHERE j.title = 'Backend Engineer'
    AND s.name IN ('Python', 'Java', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'REST API')
  
  UNION ALL
  
  SELECT 
    j.id as job_id,
    s.id as skill_id,
    CASE 
      WHEN s.name IN ('Docker', 'Kubernetes', 'AWS', 'Python') THEN true
      ELSE false
    END as is_required
  FROM jobs j
  CROSS JOIN skills s
  WHERE j.title = 'DevOps Engineer'
    AND s.name IN ('Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform', 'Jenkins', 'Bash', 'Linux')
  
  UNION ALL
  
  SELECT 
    j.id as job_id,
    s.id as skill_id,
    CASE 
      WHEN s.name IN ('Python', 'SQL', 'Machine Learning') THEN true
      ELSE false
    END as is_required
  FROM jobs j
  CROSS JOIN skills s
  WHERE j.title = 'Data Scientist'
    AND s.name IN ('Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'Tableau', 'Statistics')
)
INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT job_id, skill_id, is_required
FROM job_skills_data
ON CONFLICT (job_id, skill_id) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sample Data Insertion Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added comprehensive sample data:';
    RAISE NOTICE '- 100+ skills across multiple categories';
    RAISE NOTICE '- 10 sample companies';
    RAISE NOTICE '- 10 diverse job postings';
    RAISE NOTICE '- 10 candidate profiles with realistic data';
    RAISE NOTICE '- Job-skill relationships';
    RAISE NOTICE 'Your database is now ready for demonstration!';
END $$;
