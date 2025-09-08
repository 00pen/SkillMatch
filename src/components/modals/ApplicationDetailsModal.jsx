import React, { useState, useEffect } from 'react';
import { db, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import ApplicationProgressIndicator from '../../pages/application-tracking/components/ApplicationProgressIndicator';
import ApplicationStatusBadge from '../../pages/application-tracking/components/ApplicationStatusBadge';

const ApplicationDetailsModal = ({ isOpen, onClose, application, messages = [], interviews = [], isEmployer = false }) => {
  const [applicationData, setApplicationData] = useState(null);
  const [applicationMessages, setApplicationMessages] = useState([]);
  const [applicationInterviews, setApplicationInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (isOpen && application?.id && !isEmployer) {
      loadApplicationDetails();
    } else if (application) {
      setApplicationData(application);
      setApplicationMessages(messages);
      setApplicationInterviews(interviews);
    }
  }, [isOpen, application, isEmployer]);

  const loadApplicationDetails = async () => {
    try {
      setIsLoading(true);
      
      // Try RPC function first, fallback to direct queries if it fails
      const { data: rpcData, error: rpcError } = await db.getApplicationDetails(application.id);
      
      if (rpcError || !rpcData) {
        console.log('RPC failed, using fallback method:', rpcError);
        
        // Fallback: Direct table queries
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            jobs!inner(
              id,
              title,
              companies!inner(
                id,
                name
              )
            ),
            user_profiles!inner(
              id,
              full_name,
              email,
              phone,
              location
            )
          `)
          .eq('id', application.id)
          .single();
          
        if (appError) {
          console.error('Error loading application with fallback:', appError);
          return;
        }
        
        // Get messages
        const { data: messagesData } = await supabase
          .from('application_messages')
          .select('*')
          .eq('application_id', application.id)
          .order('created_at', { ascending: false });
          
        // Get interviews
        const { data: interviewsData } = await supabase
          .from('interviews')
          .select('*')
          .eq('application_id', application.id)
          .order('scheduled_at', { ascending: false });
        
        // Format the data to match expected structure
        const formattedData = {
          ...appData,
          full_name: appData.user_profiles?.full_name,
          email: appData.user_profiles?.email,
          phone: appData.user_profiles?.phone,
          location: appData.user_profiles?.location,
          jobTitle: appData.jobs?.title,
          company: appData.jobs?.companies?.name,
          job: {
            title: appData.jobs?.title,
            company: {
              name: appData.jobs?.companies?.name
            }
          },
          messages: messagesData || [],
          interviews: interviewsData || []
        };
        
        setApplicationData(formattedData);
        setApplicationMessages(messagesData || []);
        setApplicationInterviews(interviewsData || []);
      } else {
        setApplicationData(rpcData);
        setApplicationMessages(rpcData.messages || []);
        setApplicationInterviews(rpcData.interviews || []);
      }
    } catch (error) {
      console.error('Error loading application details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'interviewed':
        return 'bg-indigo-100 text-indigo-800';
      case 'offer_extended':
        return 'bg-orange-100 text-orange-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'reviewed':
        return 'Under Review';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'interviewed':
        return 'Interviewed';
      case 'offer_extended':
        return 'Offer Extended';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (!application && !applicationData) return null;

  const currentApplication = applicationData || application;
  const currentMessages = applicationMessages.length > 0 ? applicationMessages : messages;
  const currentInterviews = applicationInterviews.length > 0 ? applicationInterviews : interviews;
  // Debug logging
  console.log('ApplicationDetailsModal props:', { isOpen, currentApplication, isEmployer });
  console.log('Modal should render:', isOpen && currentApplication);
  console.log('Modal DOM element will render:', !!(isOpen && currentApplication));
  console.log('Current application data:', currentApplication);
  console.log('Available fields:', Object.keys(currentApplication || {}));
  console.log('Name fields check:', {
    full_name: currentApplication?.full_name,
    candidateName: currentApplication?.candidateName,
    email: currentApplication?.email
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-text-primary">Loading application details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return null;
  }

  if (!currentApplication) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl p-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
          <h2 className="text-xl font-semibold text-text-primary">
            No Application Data
          </h2>
          <p className="text-text-secondary mt-1">
            Unable to load application details.
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl flex flex-col animate-scale-in max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Application Details</h2>
              <p className="text-sm text-text-secondary mt-1">
                {currentApplication.jobTitle || currentApplication.job?.title} at {
                  typeof currentApplication.company === 'string' 
                    ? currentApplication.company 
                    : currentApplication.company?.name || 
                      (currentApplication.job?.company ? currentApplication.job.company.name : 'Unknown Company')
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Status Badge */}
            <div className="p-6 border-b border-border">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentApplication.status)}`}>
                {getStatusLabel(currentApplication.status)}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6">
              {[
                { id: 'details', label: 'Application Details', icon: 'FileText' },
                { id: 'messages', label: 'Messages', icon: 'MessageSquare', count: currentMessages.length },
                { id: 'interviews', label: 'Interviews', icon: 'Calendar', count: currentInterviews.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-muted'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-muted text-text-secondary px-2 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Contact Information (for employers) */}
                {isEmployer && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                      <Icon name="User" size={20} className="mr-2" />
                      Candidate Information
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">Name:</span>
                          <p className="text-text-primary">{currentApplication.full_name || currentApplication.candidateName || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary">Email:</span>
                          <p className="text-text-primary">{currentApplication.email || 'N/A'}</p>
                        </div>
                        {currentApplication.phone && (
                          <div>
                            <span className="text-text-secondary">Phone:</span>
                            <p className="text-text-primary">{currentApplication.phone}</p>
                          </div>
                        )}
                        {currentApplication.location && (
                          <div>
                            <span className="text-text-secondary">Location:</span>
                            <p className="text-text-primary">{currentApplication.location}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Application Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-text-secondary">Applied:</span> <span className="text-text-primary">{formatDate(currentApplication.created_at)}</span></div>
                      <div><span className="text-text-secondary">Last Updated:</span> <span className="text-text-primary">{formatDate(currentApplication.updated_at)}</span></div>
                      {currentApplication.salary_expectation && (
                        <div><span className="text-text-secondary">Salary Expectation:</span> <span className="text-text-primary">${currentApplication.salary_expectation?.toLocaleString()}</span></div>
                      )}
                      {currentApplication.available_start_date && (
                        <div><span className="text-text-secondary">Available Start:</span> <span className="text-text-primary">{new Date(currentApplication.available_start_date).toLocaleDateString()}</span></div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Job Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-text-secondary">Job Title:</span> <span className="text-text-primary">{currentApplication.jobTitle || currentApplication.job?.title}</span></div>
                      <div><span className="text-text-secondary">Company:</span> <span className="text-text-primary">{
                        typeof currentApplication.company === 'string' 
                          ? currentApplication.company 
                          : currentApplication.company?.name || 
                            (currentApplication.job?.company ? currentApplication.job.company.name : 'Unknown Company')
                      }</span></div>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {currentApplication.cover_letter && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Cover Letter</h4>
                    <div className="bg-background p-4 rounded-lg border border-border">
                      <p className="text-text-primary whitespace-pre-wrap">{currentApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Application Progress */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <Icon name="TrendingUp" size={20} className="mr-2" />
                    Application Progress
                  </h3>
                  <ApplicationProgressIndicator currentStatus={currentApplication.status} />
                </div>

                {/* Files */}
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Attachments</h4>
                  <div className="space-y-2">
                    {currentApplication.resume_url && (
                      <div className="flex items-center space-x-2">
                        <Icon name="FileText" size={16} className="text-text-secondary" />
                        <a
                          href={currentApplication.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Resume
                        </a>
                      </div>
                    )}
                    {currentApplication.portfolio_url && (
                      <div className="flex items-center space-x-2">
                        <Icon name="ExternalLink" size={16} className="text-text-secondary" />
                        <a
                          href={currentApplication.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Portfolio
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {currentApplication.notes && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Additional Notes</h4>
                    <div className="bg-background p-4 rounded-lg border border-border">
                      <p className="text-text-primary whitespace-pre-wrap">{currentApplication.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {currentMessages.length > 0 ? (
                  currentMessages.map((message) => (
                    <div key={message.id} className="bg-background p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            message.sender_type === 'employer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {message.sender_type === 'employer' ? 'Employer' : 'Candidate'}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            message.message_type === 'interview_invite' ? 'bg-purple-100 text-purple-800' :
                            message.message_type === 'rejection' ? 'bg-red-100 text-red-800' :
                            message.message_type === 'offer' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.message_type.replace('_', ' ')}
                          </div>
                        </div>
                        <span className="text-xs text-text-secondary">{formatDate(message.created_at)}</span>
                      </div>
                      <h5 className="font-medium text-text-primary mb-2">{message.subject}</h5>
                      <p className="text-text-primary whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon name="MessageSquare" size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No messages yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className="space-y-4">
                {currentInterviews.length > 0 ? (
                  currentInterviews.map((interview) => (
                    <div key={interview.id} className="bg-background p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="font-medium text-text-primary">
                          {interview.interview_type === 'video' ? 'Video Interview' :
                           interview.interview_type === 'phone' ? 'Phone Interview' :
                           'In-Person Interview'}
                        </h5>
                        <p className="text-text-secondary text-sm">
                          {formatDate(interview.scheduled_at)}
                        </p>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                          interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status}
                        </div>
                      </div>
                      
                      {interview.location && (
                        <div className="mb-2">
                          <span className="text-text-secondary text-sm">Location: </span>
                          <span className="text-text-primary text-sm">{interview.location}</span>
                        </div>
                      )}
                      
                      {interview.interviewer_notes && (
                        <div className="mt-3">
                          <h6 className="text-sm font-medium text-text-primary mb-1">Notes:</h6>
                          <p className="text-sm text-text-primary whitespace-pre-wrap">{interview.interviewer_notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Calendar" size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No interviews scheduled</p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
