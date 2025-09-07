import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavedJobsWidget = ({ savedJobsCount = 0, recentSavedJobs = [] }) => {
  const navigate = useNavigate();

  const handleViewSavedJobs = () => {
    navigate('/saved-jobs');
  };

  const handleJobClick = (jobId) => {
    navigate(`/job-details?id=${jobId}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Saved Jobs</h3>
        <div className="flex items-center space-x-1">
          <Icon name="Bookmark" size={16} className="text-secondary" />
          <span className="text-sm font-medium text-secondary">
            {savedJobsCount}
          </span>
        </div>
      </div>
      {recentSavedJobs?.length > 0 ? (
        <div className="space-y-3 mb-4">
          {recentSavedJobs?.slice(0, 2)?.map((job) => (
            <div 
              key={job?.id} 
              className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors duration-150"
              onClick={() => handleJobClick(job?.job_id)}
            >
              <h4 className="text-sm font-medium text-text-primary truncate mb-1">
                {job?.title}
              </h4>
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary truncate">
                  {job?.company}
                </p>
                <span className="text-xs text-secondary font-medium">
                  {job?.salary}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Icon name="Bookmark" size={32} className="text-text-secondary mx-auto mb-2" />
          <p className="text-sm text-text-secondary mb-4">No saved jobs yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/job-search-results')}
            iconName="Search"
            iconPosition="left"
          >
            Browse Jobs
          </Button>
        </div>
      )}
      {savedJobsCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={handleViewSavedJobs}
          iconName="ArrowRight"
          iconPosition="right"
        >
          View All Saved Jobs ({savedJobsCount})
        </Button>
      )}
      
    </div>
  );
};

export default SavedJobsWidget;