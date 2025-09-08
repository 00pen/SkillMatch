import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import ApplicationStatusModal from '../../components/modals/ApplicationStatusModal';
import InterviewScheduleModal from '../../components/modals/InterviewScheduleModal';
import ApplicationDetailsModal from '../../components/modals/ApplicationDetailsModal';
import ApplicationStatusBadge from '../application-tracking/components/ApplicationStatusBadge';

const EmployerApplicationManagement = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  useEffect(() => {
    if (user && userProfile) {
      loadApplications();
    }
  }, [user, userProfile]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // First get all jobs created by this employer
      const { data: jobsData, error: jobsError } = await db.getJobs({ createdBy: user.id });
      if (jobsError) throw jobsError;
      
      setJobs(jobsData || []);
      
      // Get applications for all jobs created by this employer
      const allApplications = [];
      for (const job of jobsData || []) {
        const { data: jobApplications, error: appError } = await db.getJobApplications(job.id);
        if (!appError && jobApplications) {
          const applicationsWithJobInfo = jobApplications.map(app => ({
            ...app,
            jobTitle: job.title,
            jobType: job.job_type,
            jobLocation: job.location,
            companyName: job.companies?.name || 'Unknown Company'
          }));
          allApplications.push(...applicationsWithJobInfo);
        }
      }
      
      setApplications(allApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = (application) => {
    setSelectedApplication(application);
    setIsStatusModalOpen(true);
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setIsInterviewModalOpen(true);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  const onStatusUpdated = () => {
    loadApplications();
    setIsStatusModalOpen(false);
    setSelectedApplication(null);
  };

  const onInterviewScheduled = () => {
    loadApplications();
    setIsInterviewModalOpen(false);
    setSelectedApplication(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedJob !== 'all' && app.job_id !== selectedJob) return false;
    if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;
    return true;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                <p className="text-text-secondary">Loading applications...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Application Management</h1>
                <p className="mt-2 text-text-secondary">
                  Review and manage applications for your job postings
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/employer-dashboard')}
                  iconName="LayoutDashboard"
                >
                  Dashboard
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/job-posting')}
                  iconName="Plus"
                >
                  Post Job
                </Button>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {[
              { status: 'all', label: 'All', count: applications.length },
              { status: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
              { status: 'reviewed', label: 'Reviewed', count: statusCounts.reviewed || 0 },
              { status: 'interview_scheduled', label: 'Interview', count: statusCounts.interview_scheduled || 0 },
              { status: 'interviewed', label: 'Interviewed', count: statusCounts.interviewed || 0 },
              { status: 'offer_extended', label: 'Offers', count: statusCounts.offer_extended || 0 },
              { status: 'hired', label: 'Hired', count: statusCounts.hired || 0 }
            ].map((item) => (
              <button
                key={item.status}
                onClick={() => setSelectedStatus(item.status)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedStatus === item.status
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card text-text-secondary hover:text-text-primary hover:border-primary/50'
                }`}
              >
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Filter by Job
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.application_count || 0} applications)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            {filteredApplications.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Job Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-text-primary">
                                {application.full_name}
                              </div>
                              <div className="text-sm text-text-secondary">
                                {application.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-text-primary">
                                {application.jobTitle}
                              </div>
                              <div className="text-sm text-text-secondary">
                                {application.jobType} • {application.jobLocation}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-text-primary">
                              {formatDate(application.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ApplicationStatusBadge status={application.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-text-secondary">
                              {getTimeAgo(application.updated_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(application)}
                                iconName="Eye"
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(application)}
                                iconName="Edit"
                              >
                                Update
                              </Button>
                              {application.status === 'reviewed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleScheduleInterview(application)}
                                  iconName="Calendar"
                                  className="text-primary hover:text-primary"
                                >
                                  Interview
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="border-b border-border p-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-text-primary">
                            {application.full_name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {application.jobTitle}
                          </p>
                          <p className="text-xs text-text-secondary">
                            Applied: {formatDate(application.created_at)}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={application.status} size="sm" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                          iconName="Eye"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application)}
                          iconName="Edit"
                        >
                          Update Status
                        </Button>
                        {application.status === 'reviewed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleInterview(application)}
                            iconName="Calendar"
                            className="col-span-2"
                          >
                            Schedule Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No Applications Found</h3>
                <p className="text-text-secondary mb-4">
                  {selectedJob !== 'all' || selectedStatus !== 'all'
                    ? 'No applications match your current filters.'
                    : 'You haven\'t received any applications yet.'}
                </p>
                {selectedJob !== 'all' || selectedStatus !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedJob('all');
                      setSelectedStatus('all');
                    }}
                    iconName="X"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => navigate('/job-posting')}
                    iconName="Plus"
                  >
                    Post a Job
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplicationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onStatusUpdated={onStatusUpdated}
      />

      <InterviewScheduleModal
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onScheduled={onInterviewScheduled}
      />

      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApplication(null);
        }}
        applicationId={selectedApplication?.id}
      />
    </div>
  );
};

export default EmployerApplicationManagement;
