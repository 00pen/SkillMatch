import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const JobSearchBar = ({ className = '' }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword?.trim()) params?.set('q', searchKeyword?.trim());
    if (searchLocation?.trim()) params?.set('location', searchLocation?.trim());
    
    navigate(`/job-search-results?${params?.toString()}`);
  };

  const handleKeywordChange = (e) => {
    setSearchKeyword(e?.target?.value);
  };

  const handleLocationChange = (e) => {
    setSearchLocation(e?.target?.value);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-card ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Search" size={20} className="text-secondary" />
        <h2 className="text-xl font-semibold text-text-primary">Find Your Next Job</h2>
      </div>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchKeyword}
            onChange={handleKeywordChange}
            className="flex-1"
          />
          <Input
            type="text"
            placeholder="City, state, or remote"
            value={searchLocation}
            onChange={handleLocationChange}
            className="flex-1"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            iconName="Search"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Search Jobs
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/job-search-results')}
            iconName="Grid3X3"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Browse All Jobs
          </Button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-text-secondary">Popular searches:</span>
        {['React Developer', 'Product Manager', 'Data Scientist', 'UX Designer']?.map((term) => (
          <button
            key={term}
            onClick={() => {
              setSearchKeyword(term);
              const params = new URLSearchParams();
              params?.set('q', term);
              navigate(`/job-search-results?${params?.toString()}`);
            }}
            className="text-sm text-secondary hover:text-secondary/80 hover:underline transition-colors duration-150"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JobSearchBar;