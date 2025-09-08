import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const ApplicationStatusModal = ({ isOpen, onClose, application, onStatusUpdated }) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState([]);

  const statusOptions = [
    { value: 'pending', label: 'Pending Review', description: 'Application received, awaiting review' },
    { value: 'reviewed', label: 'Under Review', description: 'Application is being reviewed' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', description: 'Interview has been scheduled' },
    { value: 'interviewed', label: 'Interviewed', description: 'Interview completed' },
    { value: 'offer_extended', label: 'Offer Extended', description: 'Job offer has been made' },
    { value: 'hired', label: 'Hired', description: 'Candidate has been hired' },
    { value: 'rejected', label: 'Rejected', description: 'Application has been rejected' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSelectedStatus(application?.status || '');
      setUseTemplate(true);
      setCustomMessage('');
      setMessageTemplate('');
    }
  }, [isOpen, application]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await db.getMessageTemplates();
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const getTemplatesForStatus = (status) => {
    switch (status) {
      case 'reviewed':
        return templates.filter(t => t.name === 'application_reviewed');
      case 'rejected':
        return templates.filter(t => t.message_type === 'rejection');
      case 'offer_extended':
        return templates.filter(t => t.message_type === 'offer');
      case 'hired':
        return templates.filter(t => t.name === 'candidate_hired');
      default:
        return templates.filter(t => t.message_type === 'status_update');
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    
    // Auto-select appropriate template
    const availableTemplates = getTemplatesForStatus(status);
    if (availableTemplates.length > 0) {
      setMessageTemplate(availableTemplates[0].name);
    } else {
      setMessageTemplate('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const options = {
        templateName: useTemplate ? messageTemplate : null,
        messageSubject: !useTemplate ? getDefaultSubject(selectedStatus) : null,
        messageContent: !useTemplate ? customMessage : null
      };

      const { data, error } = await db.updateApplicationStatusWithMessage(
        application.id,
        selectedStatus,
        user.id,
        options
      );

      if (error) throw error;

      onStatusUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultSubject = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return `Application Update - ${statusObj?.label || 'Status Changed'}`;
  };

  if (!isOpen) return null;

  const availableTemplates = getTemplatesForStatus(selectedStatus);
  const currentStatus = statusOptions.find(s => s.value === application?.status);
  const newStatus = statusOptions.find(s => s.value === selectedStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Update Application Status</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Status */}
            <div className="bg-background p-4 rounded-lg border border-border">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Current Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentStatus?.value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  currentStatus?.value === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  currentStatus?.value === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
                  currentStatus?.value === 'interviewed' ? 'bg-indigo-100 text-indigo-800' :
                  currentStatus?.value === 'offer_extended' ? 'bg-orange-100 text-orange-800' :
                  currentStatus?.value === 'hired' ? 'bg-green-100 text-green-800' :
                  currentStatus?.value === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentStatus?.label || 'Unknown'}
                </div>
              </div>
            </div>

            {/* New Status Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary">Select New Status</h3>
              <div className="grid grid-cols-1 gap-3">
                {statusOptions.map((status) => (
                  <label
                    key={status.value}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStatus === status.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{status.label}</div>
                      <div className="text-sm text-text-secondary">{status.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Message Options */}
            {selectedStatus && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-text-primary">Candidate Notification</h3>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useTemplate}
                      onChange={() => setUseTemplate(true)}
                      className="mr-2"
                    />
                    <span className="text-text-primary">Use template</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useTemplate}
                      onChange={() => setUseTemplate(false)}
                      className="mr-2"
                    />
                    <span className="text-text-primary">Custom message</span>
                  </label>
                </div>

                {useTemplate ? (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Message Template
                    </label>
                    {availableTemplates.length > 0 ? (
                      <select
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select a template...</option>
                        {availableTemplates.map(template => (
                          <option key={template.id} value={template.name}>
                            {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-text-secondary p-3 bg-background border border-border rounded-lg">
                        No templates available for this status. Please use a custom message.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Custom Message
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Write a custom message to the candidate..."
                      required={!useTemplate}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting || !selectedStatus}
                iconName={isSubmitting ? "Loader2" : "Check"}
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatusModal;
