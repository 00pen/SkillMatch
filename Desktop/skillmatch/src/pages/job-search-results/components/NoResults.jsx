import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NoResults = ({ onClearFilters, hasFilters = false }) => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Search" size={48} className="text-text-secondary" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-3">
        No jobs found
      </h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        {hasFilters 
          ? "We couldn't find any jobs matching your current filters. Try adjusting your search criteria or clearing some filters." :"We couldn't find any jobs matching your search. Try different keywords or browse all available positions."
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            iconName="X"
            iconSize={16}
          >
            Clear All Filters
          </Button>
        )}
        
        <Button
          variant="default"
          onClick={() => window.location?.reload()}
          iconName="RefreshCw"
          iconSize={16}
        >
          Browse All Jobs
        </Button>
      </div>
      <div className="mt-8 p-4 bg-accent rounded-lg max-w-md mx-auto">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-secondary mt-0.5" />
          <div className="text-left">
            <h4 className="font-medium text-text-primary mb-1">Search Tips</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Try broader keywords</li>
              <li>• Check spelling and try synonyms</li>
              <li>• Remove location filters</li>
              <li>• Consider remote opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoResults;