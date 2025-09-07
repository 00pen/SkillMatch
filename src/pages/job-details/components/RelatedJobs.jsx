import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RelatedJobs = ({ jobs = [], currentJobId }) => {
  const navigate = useNavigate();

  const filteredJobs = jobs && Array.isArray(jobs) ? jobs.filter(job => job?.id !== currentJobId).slice(0, 3) : [];

  if (filteredJobs?.length === 0) {
    return null;
  }

  const formatSalary = (min, max) => {
    if (min && max) {
      return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
    } else if (min) {
      return `$${min?.toLocaleString()}+`;
    }
    return 'Competitive';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date?.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleJobClick = (jobId) => {
    // In a real app, this would navigate to the job details with the new job ID
    // For now, we'll just scroll to top to simulate navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-6 shadow-card">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="Briefcase" size={16} className="sm:w-5 sm:h-5" />
          Related Jobs
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/job-search-results')}
          iconName="ArrowRight"
          iconPosition="right"
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
        </Button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {filteredJobs && Array.isArray(filteredJobs) ? filteredJobs.map((job) => (
          <div
            key={job?.id}
            className="border border-border rounded-lg p-3 sm:p-4 hover:shadow-card transition-shadow duration-150 cursor-pointer"
            onClick={() => handleJobClick(job?.id)}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
                <Image
                  src={job?.company?.logo}
                  alt={`${job?.company?.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-text-primary mb-1 line-clamp-1">
                  {job?.title}
                </h4>
                <div className="text-xs sm:text-sm text-text-secondary mb-2">
                  {job?.company?.name}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-text-secondary mb-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <Icon name="MapPin" size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="truncate">{job?.location}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <Icon name="Clock" size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(job?.postedDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <Icon name="DollarSign" size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="truncate">{formatSalary(job?.salaryRange?.min, job?.salaryRange?.max)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-accent rounded-full text-xs font-medium">
                      {job?.type}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-muted rounded-full text-xs font-medium">
                      {job?.experienceLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-secondary">
                    <Icon name="TrendingUp" size={10} className="sm:w-3 sm:h-3" />
                    <span>{job?.matchScore || 85}% match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : null}
      </div>
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/job-search-results')}
          iconName="Search"
          iconPosition="left"
          className="text-xs sm:text-sm py-2 sm:py-3"
        >
          Explore More Jobs
        </Button>
      </div>
    </div>
  );
};

export default RelatedJobs;