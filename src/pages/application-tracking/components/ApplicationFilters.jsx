import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ApplicationFilters = ({ onFilterChange, applications = [] }) => {
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    dateRange: '',
    positionType: '',
    searchQuery: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Extract unique companies and position types from applications
  const companies = [...new Set(applications.map(app => app.company))]?.map(company => ({
    value: company,
    label: company
  }));

  const positionTypes = [...new Set(applications.map(app => app.positionType))]?.map(type => ({
    value: type,
    label: type
  }));

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '180', label: 'Last 6 months' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      company: '',
      dateRange: '',
      positionType: '',
      searchQuery: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6 shadow-card">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          iconName={showFilters ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </div>
      {/* Search Bar - Always Visible */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search by job title, company, or keywords..."
          value={filters?.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Filter Controls */}
      <div className={`space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 ${showFilters || window.innerWidth >= 768 ? 'block' : 'hidden'}`}>
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="All Statuses"
        />

        <Select
          label="Company"
          options={[{ value: '', label: 'All Companies' }, ...companies]}
          value={filters?.company}
          onChange={(value) => handleFilterChange('company', value)}
          placeholder="All Companies"
          searchable={companies?.length > 10}
        />

        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          placeholder="All Time"
        />

        <Select
          label="Position Type"
          options={[{ value: '', label: 'All Types' }, ...positionTypes]}
          value={filters?.positionType}
          onChange={(value) => handleFilterChange('positionType', value)}
          placeholder="All Types"
        />
      </div>
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApplicationFilters;