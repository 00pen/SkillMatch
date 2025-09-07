// Sample data for demonstration purposes
export const sampleJobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    description: 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for building scalable web applications and leading technical initiatives. This is an excellent opportunity to work with cutting-edge technologies and make a significant impact on our product.',
    requirements: 'Bachelor\'s degree in Computer Science or related field. 5+ years of experience with React, Node.js, and cloud technologies. Strong problem-solving skills and experience with agile development methodologies.',
    responsibilities: 'Lead development of new features, mentor junior developers, collaborate with product team, ensure code quality and best practices, participate in architecture decisions, and drive technical innovation.',
    benefits: 'Competitive salary, equity package, comprehensive health insurance, 401k matching, flexible PTO, remote work options, professional development budget, and modern office space.',
    location: 'San Francisco, CA',
    job_type: 'full-time',
    employment_type: 'full-time',
    experience_level: 'senior',
    salary_min: 120000,
    salary_max: 150000,
    salary_currency: 'USD',
    is_remote: true,
    skills_required: ['React', 'Node.js', 'JavaScript', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
    application_deadline: '2024-03-01',
    start_date: '2024-03-15',
    contact_email: 'hiring@techcorp.com',
    contact_phone: '+1 (555) 123-4567',
    is_urgent: false,
    application_instructions: 'Please include your portfolio and a brief cover letter explaining your interest in the role.',
    created_at: '2024-01-15T10:00:00Z',
    status: 'active',
    application_count: 23,
    view_count: 156,
    companies: {
      id: 1,
      name: 'TechCorp Inc.',
      logo_url: null,
      industry: 'technology',
      size: '100-500',
      description: 'Leading technology company focused on innovative solutions for modern businesses.',
      website: 'https://techcorp.com',
      founded: '2010',
      headquarters: 'San Francisco, CA'
    }
  },
  {
    id: 2,
    title: 'Product Marketing Manager',
    description: 'Join our marketing team to drive product growth and user engagement. You will be responsible for developing go-to-market strategies, creating compelling product messaging, and working closely with product and sales teams.',
    requirements: 'Bachelor\'s degree in Marketing, Business, or related field. 3+ years of product marketing experience, preferably in SaaS or tech companies. Strong analytical skills and experience with marketing automation tools.',
    responsibilities: 'Develop product positioning and messaging, create marketing campaigns, analyze market trends, collaborate with product team on feature launches, manage content creation, and support sales enablement.',
    benefits: 'Competitive salary, performance bonus, health insurance, 401k, flexible work arrangements, professional development opportunities, and team building events.',
    location: 'New York, NY',
    job_type: 'full-time',
    employment_type: 'full-time',
    experience_level: 'mid',
    salary_min: 90000,
    salary_max: 110000,
    salary_currency: 'USD',
    is_remote: false,
    skills_required: ['Product Marketing', 'Analytics', 'A/B Testing', 'Salesforce', 'HubSpot', 'Content Marketing'],
    application_deadline: '2024-02-28',
    start_date: '2024-03-10',
    contact_email: 'marketing@startupxyz.com',
    contact_phone: '+1 (555) 987-6543',
    is_urgent: true,
    application_instructions: 'Please provide examples of successful marketing campaigns you have led.',
    created_at: '2024-01-14T15:30:00Z',
    status: 'active',
    application_count: 18,
    view_count: 89,
    companies: {
      id: 2,
      name: 'StartupXYZ',
      logo_url: null,
      industry: 'technology',
      size: '50-100',
      description: 'Fast-growing startup revolutionizing the e-commerce experience.',
      website: 'https://startupxyz.com',
      founded: '2020',
      headquarters: 'New York, NY'
    }
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    description: 'We are seeking a talented UX/UI Designer to create intuitive and visually appealing user experiences. You will work closely with product managers and developers to design user-centric interfaces.',
    requirements: 'Bachelor\'s degree in Design, HCI, or related field. 3+ years of UX/UI design experience. Proficiency in Figma, Sketch, and Adobe Creative Suite. Strong portfolio showcasing design process and results.',
    responsibilities: 'Create wireframes and prototypes, conduct user research, design user interfaces, collaborate with development team, maintain design systems, and iterate based on user feedback.',
    benefits: 'Competitive salary, health insurance, creative workspace, latest design tools, conference attendance budget, and collaborative team environment.',
    location: 'Austin, TX',
    job_type: 'full-time',
    employment_type: 'full-time',
    experience_level: 'mid',
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: 'USD',
    is_remote: true,
    skills_required: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
    application_deadline: '2024-03-05',
    start_date: '2024-03-20',
    contact_email: 'design@designco.com',
    contact_phone: '+1 (555) 456-7890',
    is_urgent: false,
    application_instructions: 'Please submit your portfolio showcasing your design process and case studies.',
    created_at: '2024-01-13T09:15:00Z',
    status: 'active',
    application_count: 31,
    view_count: 203,
    companies: {
      id: 3,
      name: 'DesignCo',
      logo_url: null,
      industry: 'technology',
      size: '25-50',
      description: 'Creative design agency specializing in digital experiences.',
      website: 'https://designco.com',
      founded: '2018',
      headquarters: 'Austin, TX'
    }
  }
];

export const sampleCandidates = [
  {
    id: 1,
    full_name: 'John Smith',
    current_job_title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    industry: 'Technology',
    years_experience: '5-10',
    remote_work_preference: 'Hybrid',
    bio: 'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies. Passionate about building scalable applications and leading development teams. Proven track record of delivering high-quality software solutions.',
    skills: ['React', 'Node.js', 'JavaScript', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL', 'TypeScript', 'Kubernetes'],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Conversational' },
      { language: 'French', proficiency: 'Basic' }
    ],
    availability: 'Available immediately',
    notice_period: '2 weeks',
    expected_salary_min: 120000,
    expected_salary_max: 150000,
    salary_currency: 'USD',
    linkedin_url: 'https://linkedin.com/in/johnsmith',
    github_url: 'https://github.com/johnsmith',
    portfolio_url: 'https://johnsmith.dev',
    resume_url: 'john_smith_resume.pdf',
    education: [
      {
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Computer Science',
        start_date: '2016',
        end_date: '2018',
        gpa: '3.8'
      },
      {
        institution: 'UC Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Engineering',
        start_date: '2012',
        end_date: '2016',
        gpa: '3.6'
      }
    ],
    work_experience: [
      {
        company: 'TechCorp Inc.',
        position: 'Senior Software Engineer',
        start_date: '2020',
        end_date: 'Present',
        description: 'Lead a team of 5 developers building scalable web applications. Implemented microservices architecture resulting in 40% performance improvement. Mentored junior developers and established code review processes.',
        technologies: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
      },
      {
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        start_date: '2018',
        end_date: '2020',
        description: 'Built end-to-end web applications from concept to deployment. Worked directly with founders to define product requirements. Implemented CI/CD pipelines and automated testing.',
        technologies: ['Vue.js', 'Python', 'PostgreSQL', 'Redis', 'Jenkins']
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2021',
        credential_id: 'AWS-12345'
      },
      {
        name: 'Certified Kubernetes Administrator',
        issuer: 'Cloud Native Computing Foundation',
        date: '2020',
        credential_id: 'CKA-67890'
      }
    ],
    employment_type_preferences: ['full-time', 'contract'],
    date_of_birth: '1990-05-15',
    nationality: 'American',
    gender: 'male'
  },
  {
    id: 2,
    full_name: 'Sarah Johnson',
    current_job_title: 'Product Marketing Manager',
    location: 'New York, NY',
    phone: '+1 (555) 987-6543',
    email: 'sarah.johnson@email.com',
    industry: 'Technology',
    years_experience: '3-5',
    remote_work_preference: 'Remote',
    bio: 'Strategic marketing professional with a track record of launching successful products. Expert in data-driven marketing campaigns and cross-functional collaboration. Passionate about driving growth through innovative marketing strategies.',
    skills: ['Product Marketing', 'Analytics', 'A/B Testing', 'Salesforce', 'HubSpot', 'Content Marketing', 'SEO', 'Social Media Marketing'],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'German', proficiency: 'Fluent' }
    ],
    availability: '2 weeks notice',
    notice_period: '2 weeks',
    expected_salary_min: 90000,
    expected_salary_max: 110000,
    salary_currency: 'USD',
    linkedin_url: 'https://linkedin.com/in/sarahjohnson',
    portfolio_url: 'https://sarahjohnson.com',
    resume_url: 'sarah_johnson_resume.pdf',
    education: [
      {
        institution: 'Columbia University',
        degree: 'Master of Business Administration',
        field: 'Marketing',
        start_date: '2018',
        end_date: '2020',
        gpa: '3.9'
      }
    ],
    work_experience: [
      {
        company: 'MarketingPro',
        position: 'Product Marketing Manager',
        start_date: '2021',
        end_date: 'Present',
        description: 'Led go-to-market strategies for 3 major product launches. Increased user acquisition by 65% through targeted campaigns. Managed marketing budget of $2M annually.',
        technologies: ['HubSpot', 'Salesforce', 'Google Analytics', 'Mailchimp']
      }
    ],
    certifications: [
      {
        name: 'Google Analytics Certified',
        issuer: 'Google',
        date: '2021',
        credential_id: 'GA-54321'
      }
    ],
    employment_type_preferences: ['full-time', 'contract'],
    date_of_birth: '1992-08-22',
    nationality: 'American',
    gender: 'female'
  }
];

export const sampleCompanies = [
  {
    id: 1,
    name: 'TechCorp Inc.',
    logo_url: null,
    industry: 'technology',
    size: '100-500',
    description: 'Leading technology company focused on innovative solutions for modern businesses. We specialize in cloud computing, AI, and enterprise software solutions.',
    website: 'https://techcorp.com',
    founded: '2010',
    headquarters: 'San Francisco, CA',
    locations: ['San Francisco, CA', 'New York, NY', 'Austin, TX'],
    employees_count: 350,
    company_culture: 'Innovation-driven, collaborative, results-oriented',
    benefits: [
      'Competitive salary and equity',
      'Comprehensive health insurance',
      'Flexible PTO',
      'Remote work options',
      '401k matching',
      'Professional development budget',
      'Modern office spaces',
      'Team building events'
    ],
    contact_email: 'careers@techcorp.com',
    contact_phone: '+1 (555) 123-4567'
  },
  {
    id: 2,
    name: 'StartupXYZ',
    logo_url: null,
    industry: 'technology',
    size: '50-100',
    description: 'Fast-growing startup revolutionizing the e-commerce experience through innovative technology and customer-centric solutions.',
    website: 'https://startupxyz.com',
    founded: '2020',
    headquarters: 'New York, NY',
    locations: ['New York, NY', 'Remote'],
    employees_count: 75,
    company_culture: 'Fast-paced, entrepreneurial, data-driven',
    benefits: [
      'Equity participation',
      'Health insurance',
      'Flexible work arrangements',
      'Learning stipend',
      'Catered meals',
      'Stock options',
      'Unlimited PTO'
    ],
    contact_email: 'jobs@startupxyz.com',
    contact_phone: '+1 (555) 987-6543'
  }
];

export const initializeSampleData = () => {
  // Store sample data in localStorage for development
  if (!localStorage.getItem('mockJobs')) {
    localStorage.setItem('mockJobs', JSON.stringify(sampleJobs));
  }
  
  if (!localStorage.getItem('mockCandidates')) {
    localStorage.setItem('mockCandidates', JSON.stringify(sampleCandidates));
  }
  
  if (!localStorage.getItem('mockCompanies')) {
    localStorage.setItem('mockCompanies', JSON.stringify(sampleCompanies));
  }
  
  console.log('Sample data initialized for development');
};