import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

const EditJobModal = ({ job, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    location: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    is_remote: false,
    application_deadline: '',
    education_requirements: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' }
  ];

  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities || '',
        benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
        location: job.location || '',
        job_type: job.job_type || '',
        experience_level: job.experience_level || '',
        salary_min: job.salary_min?.toString() || '',
        salary_max: job.salary_max?.toString() || '',
        salary_currency: job.salary_currency || 'USD',
        is_remote: job.is_remote || false,
        application_deadline: job.application_deadline ? job.application_deadline.split('T')[0] : '',
        education_requirements: job.education_requirements || ''
      });
      setErrors({});
    }
  }, [job, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        is_remote: formData.is_remote,
        application_deadline: formData.application_deadline || null,
        education_requirements: formData.education_requirements || null,
        responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').filter(r => r.trim()) : [],
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : []
      };

      const { error } = await db.updateJob(job.id, updateData);
      
      if (error) {
        setErrors({ submit: error.message });
        return;
      }
      
      onSave({ ...job, ...updateData });
      onClose();
      
    } catch (error) {
      console.error('Job update error:', error);
      setErrors({ submit: 'Failed to update job. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Edit Job Posting</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <Icon name="X" size={20} />
          </Button>
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
            
            <Input
              label="Job Description"
              type="textarea"
              placeholder="Describe the role, company culture, and what makes this position exciting..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              rows={4}
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
              
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  label="Remote Position"
                  checked={formData.is_remote}
                  onChange={(checked) => handleInputChange('is_remote', checked)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Job Details</h3>
            
            <Input
              label="Requirements"
              type="textarea"
              placeholder="List the key requirements (one per line)..."
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              rows={4}
            />
            
            <Input
              label="Responsibilities"
              type="textarea"
              placeholder="List the main responsibilities (one per line)..."
              value={formData.responsibilities}
              onChange={(e) => handleInputChange('responsibilities', e.target.value)}
              rows={4}
            />
            
            <Input
              label="Benefits"
              type="textarea"
              placeholder="List the benefits and perks (one per line)..."
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              rows={3}
            />
            
            <Input
              label="Education Requirements"
              type="textarea"
              placeholder="e.g., Bachelor's degree in Computer Science or equivalent experience"
              value={formData.education_requirements}
              onChange={(e) => handleInputChange('education_requirements', e.target.value)}
              rows={2}
            />
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

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Timeline</h3>
            
            <Input
              label="Application Deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => handleInputChange('application_deadline', e.target.value)}
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-sm text-error">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
