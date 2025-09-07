import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import QuickApplyModal from '../../components/modals/QuickApplyModal';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedJobs, savedJobIds, toggleSaveJob, isLoading, error } = useSavedJobs();
  const [selectedJobForQuickApply, setSelectedJobForQuickApply] = useState(null);

  const handleJobClick = (jobId) => {
    navigate(`/job-details?id=${jobId}`);
  };

  const handleQuickApply = (e, job) => {
    e?.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Transform the job data to match expected format
    const transformedJob = {
      id: job.job_id,
      title: job.title,
      company: { name: job.company, logo: null },
      location: job.location,
      salaryRange: { min: null, max: null },
      type: job.type,
      description: '',
      skills: []
    };
    setSelectedJobForQuickApply(transformedJob);
  };

  const handleUnsaveJob = async (e, jobId) => {
    e?.stopPropagation();
    
    try {
      await toggleSaveJob(jobId);
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="User" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary mb-6">Please log in to view your saved jobs.</p>
            <Button
              variant="default"
              onClick={() => navigate('/login')}
              iconName="LogIn"
              iconPosition="left"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-muted rounded w-2/3"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Bookmark" size={24} className="text-secondary" />
                <h1 className="text-2xl font-bold text-text-primary">Saved Jobs</h1>
                <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-sm font-medium">
                  {savedJobs?.length || 0}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/job-search-results')}
                iconName="Search"
                iconPosition="left"
              >
                Browse More Jobs
              </Button>
            </div>
            <p className="text-text-secondary mt-2">
              Jobs you've saved for later review
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          {savedJobs?.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-card hover:border-secondary/20 transition-all duration-150 cursor-pointer"
                  onClick={() => handleJobClick(job.job_id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                        <Icon name="Building2" size={20} className="text-secondary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-base sm:text-lg font-semibold text-text-primary hover:text-secondary transition-colors duration-150 line-clamp-2 break-words">
                            {job.title}
                          </h3>
                          <p className="text-sm text-text-secondary font-medium truncate">
                            {job.company}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleUnsaveJob(e, job.job_id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors duration-150 flex-shrink-0"
                          title="Remove from saved jobs"
                        >
                          <Icon 
                            name="BookmarkCheck" 
                            size={14} 
                            className="text-secondary hover:text-error" 
                          />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-text-secondary mb-3">
                        <div className="flex items-center space-x-1 min-w-0">
                          <Icon name="MapPin" size={12} className="flex-shrink-0" />
                          <span className="truncate">{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-1 min-w-0">
                          <Icon name="DollarSign" size={12} className="flex-shrink-0" />
                          <span className="truncate">{job.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1 min-w-0">
                          <Icon name="Clock" size={12} className="flex-shrink-0" />
                          <span className="capitalize truncate">{job.type || 'Full-time'}</span>
                        </div>
                        <div className="flex items-center space-x-1 min-w-0">
                          <Icon name="Calendar" size={12} className="flex-shrink-0" />
                          <span className="truncate">{getTimeAgo(job.postedDate)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-text-secondary mb-3">
                        <Icon name="Bookmark" size={12} className="text-secondary" />
                        <span>Saved {getTimeAgo(job.savedDate)}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/job-details?id=${job.job_id}`);
                            }}
                            iconName="Eye"
                            iconPosition="left"
                            className="flex-shrink-0 text-xs sm:text-sm px-3 py-1.5"
                          >
                            View Details
                          </Button>
                        </div>
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleQuickApply(e, job)}
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
              <Icon name="Bookmark" size={48} className="text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Saved Jobs Yet</h3>
              <p className="text-text-secondary mb-6">
                Start saving jobs you're interested in to keep track of them
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate('/job-search-results')}
                iconName="Search"
                iconPosition="left"
              >
                Browse Jobs
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={!!selectedJobForQuickApply}
        onClose={() => setSelectedJobForQuickApply(null)}
        job={selectedJobForQuickApply}
      />
    </div>
  );
};

export default SavedJobs;
