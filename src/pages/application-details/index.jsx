import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statusOptions = [
    { value: 'applied', label: 'New Application', color: 'bg-blue-100 text-blue-800' },
    { value: 'under-review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'interview', label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'offer', label: 'Offer Extended', color: 'bg-green-100 text-green-800' },
    { value: 'hired', label: 'Hired', color: 'bg-success/10 text-success' },
    { value: 'rejected', label: 'Rejected', color: 'bg-error/10 text-error' }
  ];

  useEffect(() => {
    loadApplicationDetails();
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setIsLoading(true);
      
      // Load application details
      const { data: appData, error: appError } = await db.getApplicationById(applicationId);
      if (appError) {
        console.error('Error loading application:', appError);
        return;
      }
      setApplication(appData);

      // Load job details
      if (appData?.job_id) {
        const { data: jobData, error: jobError } = await db.getJobById(appData.job_id);
        if (jobError) {
          console.error('Error loading job:', jobError);
        } else {
          setJob(jobData);
        }
      }
      
    } catch (error) {
      console.error('Error loading application details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await db.updateApplicationStatus(applicationId, newStatus);
      if (error) {
        console.error('Error updating status:', error);
        return;
      }
      
      setApplication(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const handleDownloadResume = () => {
    if (application?.resume_url) {
      window.open(application.resume_url, '_blank');
    }
  };

  if (!user || userProfile?.role !== 'employer') {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Shield" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary">Only employers can view application details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader" size={48} className="mx-auto text-text-secondary mb-4 animate-spin" />
            <p className="text-text-secondary">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Application Not Found</h1>
            <p className="text-text-secondary mb-4">The application you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/employer-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs 
            items={[
              { label: 'Dashboard', href: '/employer-dashboard' },
              { label: job?.title || 'Job Details', href: `/job-details/${job?.id}` },
              { label: 'Applicants', href: `/employer/job/${job?.id}/applicants` },
              { label: application?.full_name || 'Application', href: '#' }
            ]} 
          />
          
          <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">{application.full_name}</h1>
                  <p className="text-text-secondary mt-1">
                    Application for {job?.title}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/employer/job/${job?.id}/applicants`)}
                    iconName="ArrowLeft"
                    iconPosition="left"
                  >
                    Back to Applicants
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Icon name="Mail" size={16} className="text-text-secondary" />
                      <span className="text-text-primary">{application.email}</span>
                    </div>
                    {application.phone && (
                      <div className="flex items-center space-x-3">
                        <Icon name="Phone" size={16} className="text-text-secondary" />
                        <span className="text-text-primary">{application.phone}</span>
                      </div>
                    )}
                    {application.location && (
                      <div className="flex items-center space-x-3">
                        <Icon name="MapPin" size={16} className="text-text-secondary" />
                        <span className="text-text-primary">{application.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Icon name="Calendar" size={16} className="text-text-secondary" />
                      <span className="text-text-primary">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Application Status</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((status) => (
                        <Button
                          key={status.value}
                          variant={application.status === status.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusUpdate(status.value)}
                          disabled={isUpdatingStatus}
                          className="justify-start"
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Section */}
              {application.resume_url && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Resume</h3>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Icon name="FileText" size={20} className="text-text-secondary" />
                      <div>
                        <p className="font-medium text-text-primary">Resume.pdf</p>
                        <p className="text-sm text-text-secondary">Click to view or download</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDownloadResume}
                      iconName="Download"
                      iconPosition="left"
                    >
                      View Resume
                    </Button>
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {application.cover_letter && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Cover Letter</h3>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                      {application.cover_letter}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(application.experience_years || application.skills) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.experience_years && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="font-medium text-text-primary mb-2">Experience</h4>
                        <p className="text-text-secondary">{application.experience_years} years</p>
                      </div>
                    )}
                    {application.skills && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="font-medium text-text-primary mb-2">Skills</h4>
                        <p className="text-text-secondary">{application.skills}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate('hired')}
                  disabled={isUpdatingStatus || application.status === 'hired'}
                  iconName="UserCheck"
                  iconPosition="left"
                >
                  Hire Candidate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('interview')}
                  disabled={isUpdatingStatus || application.status === 'interview'}
                  iconName="Calendar"
                  iconPosition="left"
                >
                  Schedule Interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdatingStatus || application.status === 'rejected'}
                  iconName="X"
                  iconPosition="left"
                  className="text-error hover:text-error"
                >
                  Reject Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
