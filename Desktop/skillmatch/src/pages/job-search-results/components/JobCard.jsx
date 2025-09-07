import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const JobCard = ({ job, onSaveJob, onQuickApply, isSaved = false, userRole = 'job-seeker' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleViewDetails = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate(`/job-details/${job?.id}`);
  };

  const handleSaveJob = async (e) => {
    e?.stopPropagation();
    setIsLoading(true);
    try {
      await onSaveJob(job?.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApply = async (e) => {
    e?.stopPropagation();
    setIsApplying(true);
    try {
      if (onQuickApply) {
        await onQuickApply(job?.id);
      } else {
        // Navigate to job details for full application
        navigate(`/job-details/${job?.id}`);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
    if (min) return `From $${min?.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-card transition-shadow duration-150 group cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <Image
              src={job?.company?.logo}
              alt={`${job?.company?.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-text-primary mb-1 group-hover:text-secondary transition-colors duration-150 line-clamp-2">
              {job?.title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-text-secondary font-medium mb-2 truncate">{job?.company?.name}</p>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-text-secondary mb-2 sm:mb-3">
              <div className="flex items-center space-x-1 min-w-0">
                <Icon name="MapPin" size={10} className="sm:w-[12px] sm:h-[12px] lg:w-[14px] lg:h-[14px] flex-shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-none">{job?.location}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={10} className="sm:w-[12px] sm:h-[12px] lg:w-[14px] lg:h-[14px] flex-shrink-0" />
                <span className="whitespace-nowrap">{getTimeAgo(job?.postedDate)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Icon name="Briefcase" size={10} className="sm:w-[12px] sm:h-[12px] lg:w-[14px] lg:h-[14px] flex-shrink-0" />
                <span className="capitalize whitespace-nowrap">{job?.type}</span>
              </div>
              
              {job?.remote && (
                <div className="flex items-center space-x-1">
                  <Icon name="Wifi" size={10} className="sm:w-[12px] sm:h-[12px] lg:w-[14px] lg:h-[14px] flex-shrink-0" />
                  <span className="whitespace-nowrap">Remote</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile salary display - show on mobile only */}
        <div className="flex sm:hidden items-center justify-between mt-1">
          <div className="text-xs font-semibold text-text-primary truncate flex-1 mr-2 min-w-0">
            {formatSalary(job?.salaryRange?.min, job?.salaryRange?.max)}
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {userRole === 'job-seeker' && (
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveJob(e);
                }}
                loading={isLoading}
                className="text-text-secondary hover:text-secondary p-1 min-w-[28px] h-7"
                title={isSaved ? "Remove from saved jobs" : "Save job"}
              >
                <Icon 
                  name={isSaved ? "Heart" : "Heart"} 
                  size={12}
                  className={isSaved ? "fill-current text-secondary" : ""}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop layout - hidden on mobile */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-text-primary">
            {formatSalary(job?.salaryRange?.min, job?.salaryRange?.max)}
          </div>
          
          <div className="flex items-center space-x-2">
            {userRole === 'job-seeker' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveJob}
                  loading={isLoading}
                  className="text-text-secondary hover:text-secondary"
                  title={isSaved ? "Remove from saved jobs" : "Save job"}
                >
                  <Icon 
                    name={isSaved ? "Heart" : "Heart"} 
                    size={18}
                    className={isSaved ? "fill-current text-secondary" : ""}
                  />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickApply(e);
                  }}
                  loading={isApplying}
                  iconName="Send"
                  iconSize={14}
                  iconPosition="left"
                >
                  {isApplying ? 'Applying...' : 'Quick Apply'}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              iconName="ExternalLink"
              iconSize={14}
              iconPosition="right"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
      
      {/* Description and Skills */}
      <div className="border-t border-border pt-2 sm:pt-3 lg:pt-4">
        <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
          {job?.description}
        </p>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-0">
          {job?.requiredSkills && Array.isArray(job.requiredSkills) ? job.requiredSkills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-accent text-accent-foreground text-xs rounded-md font-medium truncate"
            >
              {skill}
            </span>
          )) : null}
          {job?.requiredSkills && Array.isArray(job.requiredSkills) && job.requiredSkills.length > 3 && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{job.requiredSkills.length - 3} more
            </span>
          )}
        </div>
        
        {/* Mobile action buttons */}
        <div className="flex sm:hidden space-x-1.5 sm:space-x-2 mt-2 sm:mt-3">
          {userRole === 'job-seeker' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickApply(e);
              }}
              loading={isApplying}
              iconName="Send"
              iconSize={10}
              iconPosition="left"
              className="flex-1 text-xs px-2 py-1.5 h-7 min-h-[1.75rem] whitespace-nowrap overflow-hidden"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(e);
            }}
            iconName="ExternalLink"
            iconSize={10}
            iconPosition="right"
            className="flex-1 text-xs px-2 py-1.5 h-7 min-h-[1.75rem] whitespace-nowrap overflow-hidden"
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;