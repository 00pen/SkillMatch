import React, { useState } from 'react';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const SearchFilters = ({ filters, onFiltersChange, onClearFilters, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const jobTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead/Principal' },
    { value: 'executive', label: 'Executive' }
  ];

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' }
  ];

  const companySizeOptions = [
    { value: 'startup', label: 'Startup (1-50)' },
    { value: 'small', label: 'Small (51-200)' },
    { value: 'medium', label: 'Medium (201-1000)' },
    { value: 'large', label: 'Large (1000+)' }
  ];

  const locationOptions = [
    { value: 'new-york', label: 'New York, NY' },
    { value: 'san-francisco', label: 'San Francisco, CA' },
    { value: 'los-angeles', label: 'Los Angeles, CA' },
    { value: 'chicago', label: 'Chicago, IL' },
    { value: 'boston', label: 'Boston, MA' },
    { value: 'seattle', label: 'Seattle, WA' },
    { value: 'austin', label: 'Austin, TX' },
    { value: 'denver', label: 'Denver, CO' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleJobTypeChange = (type, checked) => {
    const currentTypes = filters?.jobTypes || [];
    const updatedTypes = checked
      ? [...currentTypes, type]
      : currentTypes?.filter(t => t !== type);
    
    handleFilterChange('jobTypes', updatedTypes);
  };

  const handleSalaryChange = (key, value) => {
    handleFilterChange('salary', {
      ...filters?.salary,
      [key]: parseInt(value) || 0
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Main Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          type="search"
          placeholder="Job title, keywords, or company"
          value={filters?.keywords || ''}
          onChange={(e) => handleFilterChange('keywords', e?.target?.value)}
          className="md:col-span-2"
        />
        
        <Select
          placeholder="Select location"
          options={locationOptions}
          value={filters?.location || ''}
          onChange={(value) => handleFilterChange('location', value)}
          searchable
          clearable
        />
      </div>
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Checkbox
          label="Remote only"
          checked={filters?.remoteOnly || false}
          onChange={(e) => handleFilterChange('remoteOnly', e?.target?.checked)}
        />
        
        <Checkbox
          label="Posted today"
          checked={filters?.postedToday || false}
          onChange={(e) => handleFilterChange('postedToday', e?.target?.checked)}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
        >
          {isExpanded ? 'Less Filters' : 'More Filters'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          iconName="X"
          iconSize={14}
        >
          Clear All
        </Button>
      </div>
      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-border pt-6 space-y-6 animate-fade-in">
          {/* Job Types */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Job Type</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jobTypeOptions?.map((type) => (
                <Checkbox
                  key={type?.value}
                  label={type?.label}
                  checked={(filters?.jobTypes || [])?.includes(type?.value)}
                  onChange={(e) => handleJobTypeChange(type?.value, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Salary Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Minimum ($)"
                placeholder="50,000"
                value={filters?.salary?.min || ''}
                onChange={(e) => handleSalaryChange('min', e?.target?.value)}
              />
              <Input
                type="number"
                label="Maximum ($)"
                placeholder="150,000"
                value={filters?.salary?.max || ''}
                onChange={(e) => handleSalaryChange('max', e?.target?.value)}
              />
            </div>
          </div>

          {/* Experience Level & Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Experience Level"
              placeholder="Select experience level"
              options={experienceLevelOptions}
              value={filters?.experienceLevel || ''}
              onChange={(value) => handleFilterChange('experienceLevel', value)}
              clearable
            />
            
            <Select
              label="Industry"
              placeholder="Select industry"
              options={industryOptions}
              value={filters?.industry || ''}
              onChange={(value) => handleFilterChange('industry', value)}
              clearable
            />
          </div>

          {/* Company Size */}
          <Select
            label="Company Size"
            placeholder="Select company size"
            options={companySizeOptions}
            value={filters?.companySize || ''}
            onChange={(value) => handleFilterChange('companySize', value)}
            clearable
          />
        </div>
      )}
    </div>
  );
};

export default SearchFilters;