import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSavedJobs } from '../../../hooks/useSavedJobs';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import QuickApplyModal from '../../../components/modals/QuickApplyModal';

const RecommendedJobsSection = ({ recommendedJobs = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedJobIds, toggleSaveJob } = useSavedJobs();
  const [selectedJobForQuickApply, setSelectedJobForQuickApply] = useState(null);

  const handleJobClick = (jobId) => {
    navigate(`/job-details/${jobId}`);
  };

  const handleQuickApply = (e, jobId) => {
    e?.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('Quick apply to job:', jobId);
    
    // Find the job details for the modal
    const job = recommendedJobs.find(j => j.id === jobId);
    if (job) {
      // Transform the job data to match expected format
      const transformedJob = {
        id: job.id,
        title: job.title,
        company: { name: job.company, logo: job.companyLogo },
        location: job.location,
        salaryRange: { min: job.salaryMin, max: job.salaryMax },
        type: job.type,
        description: job.description,
        skills: job.skills
      };
      setSelectedJobForQuickApply(transformedJob);
    }
  };

  const handleSaveJob = async (e, jobId) => {
    e?.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    console.log('Save job:', jobId);
    
    try {
      await toggleSaveJob(jobId);
    } catch (err) {
      console.error('Error toggling saved job:', err);
    }
  };

  const formatSalary = (min, max) => {
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })?.format(amount);
    };
    
    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    }
    return 'Competitive';
  };

  const getTimeAgo = (postedDate) => {
    const now = new Date();
    const posted = new Date(postedDate);
    const diffInDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Target" size={20} className="text-secondary" />
          <h2 className="text-xl font-semibold text-text-primary">Recommended for You</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/job-search-results')}
          iconName="ArrowRight"
          iconPosition="right"
        >
          View All
        </Button>
      </div>
      {recommendedJobs?.length > 0 ? (
        <div className="space-y-4">
          {recommendedJobs?.map((job) => (
            <div
              key={job?.id}
              className="border border-border rounded-lg p-4 hover:shadow-card hover:border-secondary/20 transition-all duration-150 cursor-pointer"
              onClick={() => handleJobClick(job?.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={job?.companyLogo}
                    alt={`${job?.company} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary hover:text-secondary transition-colors duration-150 line-clamp-2 break-words">
                        {job?.title}
                      </h3>
                      <p className="text-sm text-text-secondary font-medium truncate">
                        {job?.company}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleSaveJob(e, job?.id)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors duration-150 flex-shrink-0"
                    >
                      <Icon 
                        name={savedJobIds?.has(job?.id) ? "BookmarkCheck" : "Bookmark"} 
                        size={14} 
                        className={savedJobIds?.has(job?.id) ? "text-secondary" : "text-text-secondary hover:text-secondary"} 
                      />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-text-secondary mb-3">
                    <div className="flex items-center space-x-1 min-w-0">
                      <Icon name="MapPin" size={12} className="flex-shrink-0" />
                      <span className="truncate">{job?.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 min-w-0">
                      <Icon name="DollarSign" size={12} className="flex-shrink-0" />
                      <span className="truncate">{formatSalary(job?.salaryMin, job?.salaryMax)}</span>
                    </div>
                    <div className="flex items-center space-x-1 min-w-0">
                      <Icon name="Clock" size={12} className="flex-shrink-0" />
                      <span className="capitalize truncate">{job?.type}</span>
                    </div>
                    <div className="flex items-center space-x-1 min-w-0">
                      <Icon name="Calendar" size={12} className="flex-shrink-0" />
                      <span className="truncate">{getTimeAgo(job?.postedDate)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-text-primary mb-3 line-clamp-2 break-words">
                    {job?.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                    {job?.skills?.slice(0, 3)?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-accent text-secondary truncate max-w-[80px] sm:max-w-[100px]"
                        title={skill}
                      >
                        {skill}
                      </span>
                    ))}
                    {job?.skills?.length > 3 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-text-secondary flex-shrink-0">
                        +{job?.skills?.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Icon name="Users" size={12} className="text-text-secondary" />
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {job?.applicants || 0} applicants
                        </span>
                      </div>
                      {job?.matchPercentage && (
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Icon name="Target" size={12} className="text-success" />
                          <span className="text-xs text-success font-medium whitespace-nowrap">
                            {job?.matchPercentage}% match
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleQuickApply(e, job?.id)}
                      iconName="Send"
                      iconPosition="left"
                      className="flex-shrink-0 w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5"
                    >
                      Quick Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Target" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Recommendations Yet</h3>
          <p className="text-text-secondary mb-6">
            Complete your profile to get personalized job recommendations
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/profile')}
            iconName="User"
            iconPosition="left"
          >
            Complete Profile
          </Button>
        </div>
      )}
      
      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={!!selectedJobForQuickApply}
        onClose={() => setSelectedJobForQuickApply(null)}
        job={selectedJobForQuickApply}
      />
    </div>
  );
};

export default RecommendedJobsSection;