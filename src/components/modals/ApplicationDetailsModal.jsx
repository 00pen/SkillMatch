import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const ApplicationDetailsModal = ({ isOpen, onClose, applicationId }) => {
  const { user } = useAuth();
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationDetails();
    }
  }, [isOpen, applicationId]);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db.getApplicationDetails(applicationId);
      if (error) throw error;
      setApplicationDetails(data);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (!isOpen) return null;

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

  if (!applicationDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl p-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Details</h3>
          <p className="text-text-secondary mb-4">Could not load application details.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const { application, job, company, messages, interviews } = applicationDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">Application Details</h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-medium text-text-primary">{job?.title}</h3>
                <p className="text-text-secondary">{company?.name}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application?.status)}`}>
                {getStatusLabel(application?.status)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'details', label: 'Application Details', icon: 'FileText' },
                { id: 'messages', label: 'Messages', icon: 'MessageSquare', count: messages?.length },
                { id: 'interviews', label: 'Interviews', icon: 'Calendar', count: interviews?.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Candidate Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-text-secondary">Name:</span> <span className="text-text-primary">{application?.full_name}</span></div>
                      <div><span className="text-text-secondary">Email:</span> <span className="text-text-primary">{application?.email}</span></div>
                      {application?.phone && (
                        <div><span className="text-text-secondary">Phone:</span> <span className="text-text-primary">{application?.phone}</span></div>
                      )}
                      {application?.location && (
                        <div><span className="text-text-secondary">Location:</span> <span className="text-text-primary">{application?.location}</span></div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Application Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-text-secondary">Applied:</span> <span className="text-text-primary">{formatDate(application?.created_at)}</span></div>
                      <div><span className="text-text-secondary">Last Updated:</span> <span className="text-text-primary">{formatDate(application?.updated_at)}</span></div>
                      {application?.salary_expectation && (
                        <div><span className="text-text-secondary">Salary Expectation:</span> <span className="text-text-primary">${application?.salary_expectation?.toLocaleString()}</span></div>
                      )}
                      {application?.available_start_date && (
                        <div><span className="text-text-secondary">Available Start:</span> <span className="text-text-primary">{new Date(application?.available_start_date).toLocaleDateString()}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {application?.cover_letter && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Cover Letter</h4>
                    <div className="bg-background p-4 rounded-lg border border-border">
                      <p className="text-text-primary whitespace-pre-wrap">{application?.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Files */}
                <div>
                  <h4 className="font-medium text-text-primary mb-3">Attachments</h4>
                  <div className="space-y-2">
                    {application?.resume_url && (
                      <div className="flex items-center space-x-2">
                        <Icon name="FileText" size={16} className="text-text-secondary" />
                        <a
                          href={application?.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Resume
                        </a>
                      </div>
                    )}
                    {application?.portfolio_url && (
                      <div className="flex items-center space-x-2">
                        <Icon name="ExternalLink" size={16} className="text-text-secondary" />
                        <a
                          href={application?.portfolio_url}
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
                {application?.notes && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">Additional Notes</h4>
                    <div className="bg-background p-4 rounded-lg border border-border">
                      <p className="text-text-primary whitespace-pre-wrap">{application?.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
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
                {interviews && interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <div key={interview.id} className="bg-background p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-text-primary">
                            {interview.interview_type === 'video' ? 'Video Interview' :
                             interview.interview_type === 'phone' ? 'Phone Interview' :
                             'In-Person Interview'}
                          </h5>
                          <p className="text-text-secondary text-sm">
                            {formatDate(interview.scheduled_at)}
                          </p>
                        </div>
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

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
