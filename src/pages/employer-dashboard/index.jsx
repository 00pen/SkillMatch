import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import JobPostingCard from './components/JobPostingCard';
import MetricsWidget from './components/MetricsWidget';
import ActivityFeed from './components/ActivityFeed';
import CompanyProfileWidget from './components/CompanyProfileWidget';
import CompanyProfileCompletionWidget from './components/CompanyProfileCompletionWidget';
import CompanyManagementWidget from './components/CompanyManagementWidget';
import QuickActions from './components/QuickActions';
import EditJobModal from '../../components/modals/EditJobModal';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [companyProfile, setCompanyProfile] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  
  // Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userProfile && userProfile.role !== 'employer') {
      navigate('/job-seeker-dashboard');
      return;
    }
  }, [user, userProfile, navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load company jobs - only if user has a company_id
      if (userProfile?.company_id) {
        const { data: jobsData, error: jobsError } = await db.getCompanyJobs(userProfile.company_id);
        if (!jobsError && jobsData) {
          setJobs(jobsData);
        }
      } else {
        // If no company_id, set empty jobs array
        setJobs([]);
      }
      
      // Load job statistics
      const { data: statsData, error: statsError } = await db.getJobStats(user.id);
      if (!statsError && statsData) {
        setStats(statsData);
      }

      // Load company profile if user has company_id
      if (userProfile?.company_id) {
        const { data: companyData, error: companyError } = await db.getCompanyById(userProfile.company_id);
        if (!companyError && companyData) {
          setCompanyProfile(companyData);
        }
      }

      // Load recent activities
      const { data: activitiesData, error: activitiesError } = await db.getRecentActivities(user.id);
      if (!activitiesError && activitiesData) {
        setActivities(activitiesData);
      } else {
        // Use default activities as fallback
        setActivities(defaultActivities);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && userProfile) {
      loadDashboardData();
    }
  }, [user, userProfile]);

  // Add effect to refresh data when returning from company profile
  useEffect(() => {
    const handleFocus = () => {
      if (user && userProfile) {
        loadDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, userProfile]);

  // Dynamic metrics data based on real stats
  const metricsData = [
    {
      title: "Total Applications",
      value: stats?.totalApplications?.toString() || "0",
      change: stats?.applicationChange || "0%",
      changeType: stats?.applicationChangeType || "neutral",
      icon: "FileText",
      color: "secondary"
    },
    {
      title: "Positions Filled",
      value: stats?.positionsFilled?.toString() || "0",
      change: stats?.positionsFilledChange || "0",
      changeType: stats?.positionsFilledChangeType || "neutral",
      icon: "CheckCircle",
      color: "success"
    },
    {
      title: "Avg. Time to Hire",
      value: stats?.avgTimeToHire || "N/A",
      change: stats?.timeToHireChange || "0 days",
      changeType: stats?.timeToHireChangeType || "neutral",
      icon: "Clock",
      color: "warning"
    },
    {
      title: "Active Job Posts",
      value: stats?.activeJobs?.toString() || "0",
      change: stats?.activeJobsChange || "0",
      changeType: stats?.activeJobsChangeType || "neutral",
      icon: "Briefcase",
      color: "secondary"
    }
  ];

  // Default activities for fallback
  const defaultActivities = [
    {
      id: 1,
      type: 'application',
      message: 'Application received for Senior Developer position',
      time: '2 hours ago',
      icon: 'FileText'
    },
    {
      id: 2,
      type: 'job_posted',
      message: 'Job posting "UI/UX Designer" went live',
      time: '1 day ago',
      icon: 'Briefcase'
    },
    {
      id: 3,
      type: 'interview',
      message: 'Interview scheduled with John Smith',
      time: '2 days ago',
      icon: 'Calendar'
    }
  ];

  const filteredJobs = jobs?.filter(job => {
    if (selectedFilter === 'all') return true;
    return job?.status === selectedFilter;
  });

  const handlePostNewJob = () => {
    navigate('/job-posting');
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleSaveJob = (updatedJob) => {
    setJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const { error } = await db.deleteJob(jobId);
        if (error) {
          console.error('Error deleting job:', error);
          return;
        }
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleViewAllJobs = () => {
    navigate('/job-search-results', { state: { mode: 'employer' } });
  };

  const handleManageApplications = () => {
    navigate('/employer/applications');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center flex-1">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <RoleAdaptiveNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome, {userProfile?.full_name ? userProfile.full_name.split(' ')[0] : 'HR Manager'}! 👋
            </h1>
            <p className="text-text-secondary">
              Manage your job posts and applicants here. {stats?.totalApplications > 0 ? `You have ${stats.totalApplications} applications to review.` : ''}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button
              variant="default"
              onClick={handlePostNewJob}
              iconName="Plus"
              iconPosition="left"
              iconSize={20}
              className="w-full lg:w-auto"
            >
              Post New Job
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions
            onPostJob={handlePostNewJob}
            onViewAllJobs={handleViewAllJobs}
            onManageApplications={handleManageApplications}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData?.map((metric, index) => (
            <MetricsWidget
              key={index}
              title={metric?.title}
              value={metric?.value}
              change={metric?.change}
              changeType={metric?.changeType}
              icon={metric?.icon}
              color={metric?.color}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Postings Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg shadow-card">
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-text-primary mb-4 sm:mb-0">
                    Active Job Postings
                  </h2>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e?.target?.value)}
                      className="px-3 py-2 border border-border rounded-md text-sm bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="all">All Jobs</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {filteredJobs?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredJobs.map((job) => (
                      <JobPostingCard
                        key={job.id}
                        job={job}
                        onEdit={handleEditJob}
                        onDelete={handleDeleteJob}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Briefcase" size={48} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">No job postings yet</h3>
                    <p className="text-text-secondary mb-6">
                      {selectedFilter === 'all' 
                        ? 'Create your first job posting to start attracting top talent.' 
                        : `No jobs found with status "${selectedFilter}".`
                      }
                    </p>
                    <Button
                      variant="default"
                      onClick={handlePostNewJob}
                      iconName="Plus"
                      iconPosition="left"
                      iconSize={16}
                    >
                      Post Your First Job
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Management Widget */}
            <CompanyManagementWidget 
              userProfile={userProfile} 
              companyProfile={companyProfile} 
            />
            
            {/* Company Profile Completion Widget - only show if company exists */}
            {userProfile?.company_id && (
              <CompanyProfileCompletionWidget 
                userProfile={userProfile} 
                companyProfile={companyProfile} 
              />
            )}
            
            {/* Company Profile Widget */}
            {companyProfile && <CompanyProfileWidget profileData={companyProfile} />}
            
            {/* Activity Feed */}
            <ActivityFeed activities={activities.length > 0 ? activities : defaultActivities} />
          </div>
        </div>
      </div>
      
      {/* Edit Job Modal */}
      <EditJobModal
        job={editingJob}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
      />
    </div>
  );
};

export default EmployerDashboard;