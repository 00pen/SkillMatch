import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';

const JobPosting = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    location: '',
    job_type: '',
    employment_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    is_remote: false,
    skills_required: [],
    company_id: '',
    department: '',
    application_deadline: '',
    start_date: '',
    is_urgent: false,
    application_instructions: '',
    contact_email: '',
    contact_phone: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'manager', label: 'Manager' },
    { value: 'director', label: 'Director' },
    { value: 'executive', label: 'Executive' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' }
  ];

  const industries = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    // Pre-fill company information if available
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        contact_email: user?.email || '',
        location: userProfile.location || ''
      }));
    }
  }, [user, userProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.job_type) {
      newErrors.job_type = 'Job type is required';
    }
    
    if (!formData.experience_level) {
      newErrors.experience_level = 'Experience level is required';
    }
    
    if (formData.salary_min && formData.salary_max && 
        parseInt(formData.salary_min) > parseInt(formData.salary_max)) {
      newErrors.salary_max = 'Maximum salary must be greater than minimum salary';
    }
    
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      let companyId = userProfile?.company_id;
      
      // If no company exists, create one
      if (!companyId) {
        const companyData = {
          name: userProfile?.company_name || 'My Company',
          description: 'Company description',
          industry: userProfile?.industry || 'Technology',
          size: 'Small',
          created_by: user.id
        };
        
        const { data: companyResult, error: companyError } = await db.createCompany(companyData);
        
        if (companyError) {
          setErrors({ submit: `Failed to create company: ${companyError.message}` });
          return;
        }
        
        companyId = companyResult.id;
        
        // Update user profile with company_id
        await db.updateUserProfile(user.id, { company_id: companyId });
      }

      const jobData = {
        ...formData,
        created_by: user.id,
        company_id: companyId,
        status: 'active',
        application_count: 0,
        view_count: 0,
        posted_date: new Date().toISOString(),
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        // Convert text fields to arrays for database compatibility
        responsibilities: formData.responsibilities ? [formData.responsibilities] : [],
        requirements: formData.requirements ? [formData.requirements] : [],
        benefits: formData.benefits ? [formData.benefits] : []
      };

      const { data, error } = await db.createJob(jobData);
      
      if (error) {
        setErrors({ submit: error.message });
        return;
      }
      
      setSuccessMessage('Job posted successfully!');
      setTimeout(() => {
        navigate(`/job-details/${data.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Job creation error:', error);
      setErrors({ submit: 'Failed to create job posting. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || userProfile?.role !== 'employer') {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Briefcase" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary mb-6">Only employers can create job postings.</p>
            <Button
              variant="default"
              onClick={() => navigate('/login')}
              iconName="LogIn"
              iconPosition="left"
            >
              Sign In as Employer
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="bg-card border border-border rounded-lg shadow-card">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-text-primary">Create Job Posting</h1>
              <p className="text-text-secondary mt-1">
                Post a new job opening to attract qualified candidates
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
                
                <Input
                  label="Job Title"
                  type="text"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    type="text"
                    placeholder="City, State or Remote"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    error={errors.location}
                    required
                  />
                  
                  <Input
                    label="Department"
                    type="text"
                    placeholder="e.g., Engineering, Marketing"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Job Type"
                    placeholder="Select job type"
                    options={jobTypes}
                    value={formData.job_type}
                    onChange={(value) => handleInputChange('job_type', value)}
                    error={errors.job_type}
                    required
                  />
                  
                  <Select
                    label="Experience Level"
                    placeholder="Select experience level"
                    options={experienceLevels}
                    value={formData.experience_level}
                    onChange={(value) => handleInputChange('experience_level', value)}
                    error={errors.experience_level}
                    required
                  />
                  
                  <div className="flex items-end">
                    <Checkbox
                      label="Remote Position"
                      checked={formData.is_remote}
                      onChange={(checked) => handleInputChange('is_remote', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Job Details</h3>
                
                <Input
                  label="Job Description"
                  type="textarea"
                  placeholder="Provide a detailed description of the role, company, and what makes this opportunity exciting..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  rows={6}
                  required
                />
                
                <Input
                  label="Key Responsibilities"
                  type="textarea"
                  placeholder="List the main responsibilities and day-to-day tasks..."
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                  rows={4}
                />
                
                <Input
                  label="Requirements & Qualifications"
                  type="textarea"
                  placeholder="List required skills, experience, education, and qualifications..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={4}
                />
                
                <Input
                  label="Benefits & Perks"
                  type="textarea"
                  placeholder="Describe compensation, benefits, perks, and company culture..."
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Skills & Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Skills & Requirements</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Required Skills
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Add a skill (e.g., React, Python, Project Management)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                      iconName="Plus"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skills_required.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-primary hover:text-primary-dark"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Compensation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Minimum Salary"
                    type="number"
                    placeholder="50000"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                  />
                  
                  <Input
                    label="Maximum Salary"
                    type="number"
                    placeholder="80000"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    error={errors.salary_max}
                  />
                  
                  <Select
                    label="Currency"
                    options={currencies}
                    value={formData.salary_currency}
                    onChange={(value) => handleInputChange('salary_currency', value)}
                  />
                </div>
              </div>

              {/* Timeline & Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Timeline & Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Application Deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                  />
                  
                  <Input
                    label="Expected Start Date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Email"
                    type="email"
                    placeholder="hiring@company.com"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    error={errors.contact_email}
                    required
                  />
                  
                  <Input
                    label="Contact Phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  />
                </div>
                
                <Input
                  label="Application Instructions"
                  type="textarea"
                  placeholder="Provide specific instructions for applicants (e.g., portfolio requirements, cover letter topics)..."
                  value={formData.application_instructions}
                  onChange={(e) => handleInputChange('application_instructions', e.target.value)}
                  rows={3}
                />
                
                <div className="flex items-center space-x-4">
                  <Checkbox
                    label="Mark as Urgent Hiring"
                    checked={formData.is_urgent}
                    onChange={(checked) => handleInputChange('is_urgent', checked)}
                  />
                </div>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm text-success">{successMessage}</span>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">{errors.submit}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isLoading}
                  iconName="Send"
                  iconPosition="left"
                >
                  {isLoading ? 'Publishing...' : 'Publish Job'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPosting;