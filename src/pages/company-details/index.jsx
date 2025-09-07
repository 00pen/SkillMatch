import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setIsLoading(true);
      // Mock company data
      const mockCompany = {
        id: parseInt(id),
        name: 'TechCorp Inc.',
        logo_url: null,
        industry: 'Technology',
        size: '100-500',
        description: 'Leading technology company focused on innovative solutions for modern businesses. We specialize in cloud computing, AI, and enterprise software solutions that help companies scale and modernize their operations.',
        website: 'https://techcorp.com',
        founded: '2010',
        headquarters: 'San Francisco, CA',
        locations: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote'],
        employees_count: 350,
        company_culture: 'Innovation-driven, collaborative, results-oriented environment where creativity meets technology.',
        mission: 'To empower businesses worldwide with cutting-edge technology solutions that drive growth and innovation.',
        values: [
          'Innovation: We constantly push the boundaries of what\'s possible',
          'Collaboration: We achieve more when we work together',
          'Excellence: We strive for the highest quality in everything we do',
          'Integrity: We build trust through transparency and honesty',
          'Growth: We invest in our people and their professional development'
        ],
        benefits: [
          'Competitive salary and equity packages',
          'Comprehensive health, dental, and vision insurance',
          'Flexible PTO and sabbatical options',
          'Remote work and flexible scheduling',
          '401k matching up to 6%',
          '$3,000 annual professional development budget',
          'Modern office spaces with state-of-the-art equipment',
          'Regular team building events and company retreats',
          'Free meals and snacks',
          'Gym membership reimbursement',
          'Parental leave and family support',
          'Mental health and wellness programs'
        ],
        tech_stack: [
          'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
          'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis',
          'GraphQL', 'Microservices', 'CI/CD', 'Terraform'
        ],
        departments: [
          { name: 'Engineering', count: 120 },
          { name: 'Product', count: 35 },
          { name: 'Design', count: 25 },
          { name: 'Marketing', count: 30 },
          { name: 'Sales', count: 40 },
          { name: 'Operations', count: 50 },
          { name: 'HR', count: 15 },
          { name: 'Finance', count: 12 }
        ],
        contact_email: 'careers@techcorp.com',
        contact_phone: '+1 (555) 123-4567',
        social_links: {
          linkedin: 'https://linkedin.com/company/techcorp',
          twitter: 'https://twitter.com/techcorp',
          github: 'https://github.com/techcorp'
        },
        recent_news: [
          {
            title: 'TechCorp Raises $50M Series C',
            date: '2024-01-10',
            summary: 'Funding will accelerate AI product development and international expansion.'
          },
          {
            title: 'Named Best Places to Work 2024',
            date: '2024-01-05',
            summary: 'Recognized for outstanding company culture and employee satisfaction.'
          }
        ]
      };

      const mockJobs = [
        {
          id: 1,
          title: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          job_type: 'full-time',
          experience_level: 'senior',
          salary_min: 120000,
          salary_max: 150000,
          is_remote: true,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 4,
          title: 'Frontend Developer',
          location: 'New York, NY',
          job_type: 'full-time',
          experience_level: 'mid',
          salary_min: 90000,
          salary_max: 120000,
          is_remote: false,
          created_at: '2024-01-12T14:20:00Z'
        }
      ];
      
      setCompany(mockCompany);
      setCompanyJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalaryRange = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (!max) return `$${min?.toLocaleString()}+`;
    if (!min) return `Up to $${max?.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-border rounded mb-4"></div>
              <div className="h-6 bg-border rounded mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-40 bg-border rounded"></div>
                  <div className="h-60 bg-border rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-40 bg-border rounded"></div>
                  <div className="h-40 bg-border rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Building2" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Company Not Found</h1>
            <p className="text-text-secondary mb-6">The company you're looking for doesn't exist.</p>
            <Button
              variant="default"
              onClick={() => navigate('/job-search-results')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Header */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Building2" size={32} className="text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-text-primary mb-2">
                        {company.name}
                      </h1>
                      <div className="flex items-center space-x-4 text-text-secondary">
                        <div className="flex items-center">
                          <Icon name="MapPin" size={16} className="mr-1" />
                          {company.headquarters}
                        </div>
                        <div className="flex items-center">
                          <Icon name="Users" size={16} className="mr-1" />
                          {company.employees_count} employees
                        </div>
                        <div className="flex items-center">
                          <Icon name="Calendar" size={16} className="mr-1" />
                          Founded {company.founded}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {company.website && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(company.website, '_blank')}
                        iconName="ExternalLink"
                      >
                        Website
                      </Button>
                    )}
                    {company.social_links?.linkedin && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(company.social_links.linkedin, '_blank')}
                        iconName="Linkedin"
                      />
                    )}
                  </div>
                </div>

                <p className="text-text-secondary mb-6">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">{company.employees_count}</div>
                    <div className="text-sm text-text-secondary">Employees</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">{companyJobs.length}</div>
                    <div className="text-sm text-text-secondary">Open Positions</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">{company.locations.length}</div>
                    <div className="text-sm text-text-secondary">Locations</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">{new Date().getFullYear() - parseInt(company.founded)}</div>
                    <div className="text-sm text-text-secondary">Years in Business</div>
                  </div>
                </div>
              </div>

              {/* Mission & Values */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Mission & Values</h3>
                <div className="mb-6">
                  <h4 className="font-medium text-text-primary mb-2">Our Mission</h4>
                  <p className="text-text-secondary">{company.mission}</p>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Our Values</h4>
                  <div className="space-y-2">
                    {company.values.map((value, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Open Positions */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-text-primary">Open Positions</h3>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/job-search-results')}
                    iconName="ExternalLink"
                    size="sm"
                  >
                    View All Jobs
                  </Button>
                </div>
                <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 border border-border rounded-lg hover:bg-card-secondary cursor-pointer transition-colors"
                      onClick={() => navigate(`/job-details/${job.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-text-primary">{job.title}</h4>
                        <span className="text-sm text-text-secondary">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                        <div className="flex items-center">
                          <Icon name="MapPin" size={14} className="mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Icon name="Briefcase" size={14} className="mr-1" />
                          {job.job_type}
                        </div>
                        <div className="flex items-center">
                          <Icon name="TrendingUp" size={14} className="mr-1" />
                          {job.experience_level}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-primary">
                          {formatSalaryRange(job.salary_min, job.salary_max)}
                        </span>
                        {job.is_remote && (
                          <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {company.tech_stack.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Company Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary block">Industry</span>
                    <span className="text-text-primary font-medium">{company.industry}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block">Company Size</span>
                    <span className="text-text-primary font-medium">{company.size} employees</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block">Founded</span>
                    <span className="text-text-primary font-medium">{company.founded}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary block">Headquarters</span>
                    <span className="text-text-primary font-medium">{company.headquarters}</span>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Locations</h3>
                <div className="space-y-2">
                  {company.locations.map((location, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="MapPin" size={14} className="text-text-secondary" />
                      <span className="text-text-primary">{location}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Departments</h3>
                <div className="space-y-2">
                  {company.departments.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-text-primary">{dept.name}</span>
                      <span className="text-text-secondary text-sm">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={16} className="text-text-secondary" />
                    <a
                      href={`mailto:${company.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {company.contact_email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={16} className="text-text-secondary" />
                    <span className="text-text-primary">{company.contact_phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;