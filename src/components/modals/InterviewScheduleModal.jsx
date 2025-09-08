import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';

const InterviewScheduleModal = ({ isOpen, onClose, application, onScheduled }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    scheduledAt: '',
    interviewType: 'video',
    location: '',
    duration: 60,
    notes: ''
  });
  const [messageTemplate, setMessageTemplate] = useState('interview_invitation');
  const [customMessage, setCustomMessage] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      // Reset form
      setFormData({
        scheduledAt: '',
        interviewType: 'video',
        location: '',
        duration: 60,
        notes: ''
      });
      setUseTemplate(true);
      setCustomMessage('');
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await db.getMessageTemplates();
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert date string to ISO format
      const interviewDate = new Date(formData.scheduledAt).toISOString();

      const options = {
        templateName: useTemplate ? messageTemplate : null,
        messageSubject: !useTemplate ? 'Interview Invitation' : null,
        messageContent: !useTemplate ? customMessage : null,
        interviewDate,
        interviewType: formData.interviewType,
        interviewLocation: formData.location
      };

      const { data, error } = await db.updateApplicationStatusWithMessage(
        application.id,
        'interview_scheduled',
        user.id,
        options
      );

      if (error) throw error;

      onScheduled?.();
      onClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const interviewTemplates = templates.filter(t => t.message_type === 'interview_invite');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Schedule Interview</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interview Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary">Interview Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Interview Type *
                  </label>
                  <select
                    value={formData.interviewType}
                    onChange={(e) => handleInputChange('interviewType', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Location/Meeting Link
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={
                      formData.interviewType === 'video' ? 'Zoom/Teams link' :
                      formData.interviewType === 'phone' ? 'Phone number' :
                      'Office address'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    min="15"
                    max="240"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Interview Notes (Internal)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Internal notes about the interview..."
                />
              </div>
            </div>

            {/* Message Options */}
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
                  <select
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {interviewTemplates.map(template => (
                      <option key={template.id} value={template.name}>
                        {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
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
                disabled={isSubmitting}
                iconName={isSubmitting ? "Loader2" : "Calendar"}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
