import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const SortControls = ({ sortBy, onSortChange, resultsCount, isLoading = false }) => {
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Most Recent' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' },
    { value: 'company', label: 'Company A-Z' },
    { value: 'title', label: 'Job Title A-Z' }
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <Icon name="Search" size={16} className="text-text-secondary" />
        <span className="text-text-secondary">
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <span>Searching...</span>
            </span>
          ) : (
            `${resultsCount?.toLocaleString()} jobs found`
          )}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-text-secondary whitespace-nowrap">Sort by:</span>
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          className="min-w-[180px]"
        />
      </div>
    </div>
  );
};

export default SortControls;