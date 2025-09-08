import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, supabase } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ApplicationStatusModal from '../../components/modals/ApplicationStatusModal';
import InterviewScheduleModal from '../../components/modals/InterviewScheduleModal';
import ApplicationDetailsModal from '../../components/modals/ApplicationDetailsModal';
import ApplicationStatusBadge from '../application-tracking/components/ApplicationStatusBadge';

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const statusOptions = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'reviewed', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'offer_extended', label: 'Offer Extended' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    loadApplicationDetails();
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setIsLoading(true);
      
      // Use direct queries for reliable data fetching
      console.log('Loading application details for ID:', applicationId);
      
      // Get application data with job and company info
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(
            id,
            title,
            location,
            employment_type,
            salary_min,
            salary_max,
            companies!inner(
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('id', applicationId)
        .single();
        
      if (appError) {
        console.error('Error loading application:', appError);
        return;
      }
      
      console.log('Application data loaded:', appData);
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, phone, location, avatar_url')
        .eq('id', appData.user_id)
        .single();
      
      if (profileError) {
        console.error('Error loading profile:', profileError);
      }
      
      console.log('Profile data loaded:', profileData);
      
      // Get messages
      const { data: messagesData } = await supabase
        .from('application_messages')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
        
      // Get interviews
      const { data: interviewsData } = await supabase
        .from('interviews')
        .select('*')
        .eq('application_id', applicationId)
        .order('scheduled_at', { ascending: false });
      
      // Format the data with comprehensive fallbacks
      const formattedData = {
        ...appData,
        full_name: profileData?.full_name || 'Unknown Applicant',
        email: profileData?.email || 'No email provided',
        phone: profileData?.phone || null,
        location: profileData?.location || null,
        avatar_url: profileData?.avatar_url || null,
        jobTitle: appData.jobs?.title || 'Unknown Position',
        company: appData.jobs?.companies?.name || 'Unknown Company',
        job: {
          id: appData.jobs?.id,
          title: appData.jobs?.title || 'Unknown Position',
          location: appData.jobs?.location,
          employment_type: appData.jobs?.employment_type,
          company: {
            id: appData.jobs?.companies?.id,
            name: appData.jobs?.companies?.name || 'Unknown Company',
            logo_url: appData.jobs?.companies?.logo_url
          }
        }
      };
      
      console.log('Formatted application data:', formattedData);
      
      setApplication(formattedData);
      setMessages(messagesData || []);
      setInterviews(interviewsData || []);
      
      // Set job data
      setJob({
        id: appData.jobs?.id,
        title: appData.jobs?.title || 'Unknown Position',
        location: appData.jobs?.location,
        employment_type: appData.jobs?.employment_type,
        company: appData.jobs?.companies
      });
      
    } catch (error) {
      console.error('Error loading application details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (statusData) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await db.updateApplicationStatusWithMessage(
        applicationId,
        statusData.status,
        user.id,
        statusData
      );
      if (error) {
        console.error('Error updating status:', error);
        return;
      }
      
      // Reload application details to get updated data
      await loadApplicationDetails();
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleInterviewSchedule = async (interviewData) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await db.updateApplicationStatusWithMessage(
        applicationId,
        'interview_scheduled',
        user.id,
        {
          messageSubject: 'Interview Scheduled',
          messageContent: interviewData.messageContent,
          templateName: interviewData.templateName,
          interviewDate: interviewData.interviewDate,
          interviewType: interviewData.interviewType,
          interviewLocation: interviewData.interviewLocation
        }
      );
      if (error) {
        console.error('Error scheduling interview:', error);
        return;
      }
      
      // Reload application details to get updated data
      await loadApplicationDetails();
      setShowInterviewModal(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const canWithdraw = (status) => {
    return ['pending', 'reviewed'].includes(status);
  };

  const getNextActions = (status) => {
    switch (status) {
      case 'pending':
        return ['reviewed', 'rejected'];
      case 'reviewed':
        return ['interview_scheduled', 'rejected'];
      case 'interview_scheduled':
        return ['interviewed', 'rejected'];
      case 'interviewed':
        return ['offer_extended', 'rejected'];
      case 'offer_extended':
        return ['hired', 'rejected'];
      default:
        return [];
    }
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
                  <h1 className="text-2xl font-bold text-text-primary">
                    {application?.full_name || 'Unknown Applicant'}
                  </h1>
                  <p className="text-text-secondary mt-1">
                    Application for {job?.title || 'Unknown Position'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <ApplicationStatusBadge status={application.status} />
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/employer/applications`)}
                    iconName="ArrowLeft"
                    iconPosition="left"
                  >
                    Back to Applications
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
                      <span className="text-text-primary">{application?.email || 'No email provided'}</span>
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
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-text-secondary">Current Status:</span>
                        <ApplicationStatusBadge status={application.status} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowStatusModal(true)}
                          iconName="Edit"
                          iconPosition="left"
                          disabled={isUpdatingStatus}
                        >
                          Update Status
                        </Button>
                        {getNextActions(application.status).includes('interview_scheduled') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInterviewModal(true)}
                            iconName="Calendar"
                            iconPosition="left"
                            disabled={isUpdatingStatus}
                          >
                            Schedule Interview
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Recent Messages */}
                    {messages.length > 0 && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="font-medium text-text-primary mb-2">Recent Messages</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {messages.slice(0, 3).map((message) => (
                            <div key={message.id} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-text-primary">{message.subject}</span>
                                <span className="text-xs text-text-secondary">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-text-secondary truncate">{message.content}</p>
                            </div>
                          ))}
                        </div>
                        {messages.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetailsModal(true)}
                            className="mt-2 w-full"
                          >
                            View All Messages
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Interview Information */}
                    {interviews.length > 0 && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="font-medium text-text-primary mb-2">Scheduled Interviews</h4>
                        <div className="space-y-2">
                          {interviews.map((interview) => (
                            <div key={interview.id} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-text-primary">
                                  {interview.interview_type} Interview
                                </span>
                                <span className="text-xs text-text-secondary">
                                  {new Date(interview.interview_date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-text-secondary">
                                {new Date(interview.interview_date).toLocaleTimeString()} - {interview.location}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                {getNextActions(application.status).includes('hired') && (
                  <Button
                    variant="default"
                    onClick={() => {
                      setShowStatusModal(true);
                    }}
                    disabled={isUpdatingStatus}
                    iconName="UserCheck"
                    iconPosition="left"
                  >
                    Hire Candidate
                  </Button>
                )}
                {getNextActions(application.status).includes('interview_scheduled') && (
                  <Button
                    variant="outline"
                    onClick={() => setShowInterviewModal(true)}
                    disabled={isUpdatingStatus}
                    iconName="Calendar"
                    iconPosition="left"
                  >
                    Schedule Interview
                  </Button>
                )}
                {getNextActions(application.status).includes('rejected') && (
                  <Button
                    variant="outline"
                    onClick={() => setShowStatusModal(true)}
                    disabled={isUpdatingStatus}
                    iconName="X"
                    iconPosition="left"
                    className="text-error hover:text-error"
                  >
                    Reject Application
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setShowDetailsModal(true)}
                  iconName="MessageCircle"
                  iconPosition="left"
                >
                  View Messages
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showStatusModal && (
        <ApplicationStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          application={application}
          onStatusUpdate={handleStatusUpdate}
          isLoading={isUpdatingStatus}
        />
      )}
      
      {showInterviewModal && (
        <InterviewScheduleModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          application={application}
          onScheduleInterview={handleInterviewSchedule}
          isLoading={isUpdatingStatus}
        />
      )}
      
      {showDetailsModal && (
        <ApplicationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          application={application}
          messages={messages}
          interviews={interviews}
          isEmployer={true}
        />
      )}
    </div>
  );
};

export default ApplicationDetails;
