import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../hooks/useApplications';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';

const QuickApplyModal = ({ isOpen, onClose, job }) => {
  const { user, userProfile } = useAuth();
  const { createApplication } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    coverLetter: '',
    expectedSalary: '',
    availableStartDate: '',
    portfolioUrl: ''
  });

  // Auto-fill profile data when modal opens
  useEffect(() => {
    if (isOpen && user && userProfile) {
      setApplicationData({
        fullName: userProfile.full_name || '',
        email: user.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        coverLetter: '',
        expectedSalary: '',
        availableStartDate: '',
        portfolioUrl: userProfile.portfolio_url || ''
      });
    }
  }, [isOpen, user, userProfile]);

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!applicationData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!applicationData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(applicationData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!applicationData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!applicationData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (applicationData.expectedSalary && (isNaN(applicationData.expectedSalary) || applicationData.expectedSalary < 0)) {
      newErrors.expectedSalary = 'Please enter a valid salary amount';
    }

    if (applicationData.availableStartDate && new Date(applicationData.availableStartDate) < new Date()) {
      newErrors.availableStartDate = 'Start date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await createApplication({
        job_id: job.id,
        full_name: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        location: applicationData.location,
        cover_letter: applicationData.coverLetter || `I am interested in the ${job.title} position at ${job.company?.name}. I believe my skills and experience make me a great fit for this role. I would welcome the opportunity to discuss my qualifications further.`,
        portfolio_url: applicationData.portfolioUrl,
        salary_expectation: applicationData.expectedSalary ? parseInt(applicationData.expectedSalary) : null,
        available_start_date: applicationData.availableStartDate || null,
        notes: 'Applied via Quick Apply'
      });

      if (error) {
        console.error('Application submission failed:', error);
        setErrors({ submit: 'Failed to submit application. Please try again.' });
        return;
      }

      // Show success message
      alert('Application submitted successfully! You can track its progress in your Applications page.');
      
      // Reset form and close modal
      setApplicationData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        coverLetter: '',
        expectedSalary: '',
        availableStartDate: '',
        portfolioUrl: ''
      });
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Application submission failed:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const checkProfileCompletion = () => {
    const requiredFields = ['full_name', 'phone', 'location'];
    const missingFields = requiredFields.filter(field => !userProfile?.[field]);
    return {
      isComplete: missingFields.length === 0,
      missingFields: missingFields.map(field => {
        const labels = {
          full_name: 'Full Name',
          phone: 'Phone Number',
          location: 'Location'
        };
        return labels[field];
      })
    };
  };

  if (!isOpen) return null;

  const profileCheck = checkProfileCompletion();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Quick Apply</h2>
            <p className="text-sm text-text-secondary mt-1">
              {job?.title} at {job?.company?.name}
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
          {!profileCheck.isComplete ? (
            <div className="p-6">
              <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-warning mt-0.5" />
                  <div>
                    <h3 className="font-medium text-text-primary">Complete Your Profile</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Please complete the following fields in your profile before applying:
                    </p>
                    <ul className="list-disc list-inside text-sm text-text-secondary mt-2">
                      {profileCheck.missingFields.map(field => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/profile'}
                  iconName="User"
                  iconSize={16}
                >
                  Complete Profile
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Auto-filled Profile Information */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-text-primary mb-3 flex items-center">
                  <Icon name="User" size={16} className="mr-2" />
                  Profile Information (Auto-filled)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    value={applicationData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    required
                  />
                  <Input
                    label="Location"
                    type="text"
                    value={applicationData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    error={errors.location}
                    required
                  />
                </div>
              </div>

              {/* Optional Application Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-text-primary flex items-center">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Application Details (Optional)
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Cover Letter / Why are you interested?
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Leave blank for a default message
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Expected Salary (Annual USD)"
                    type="number"
                    value={applicationData.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    placeholder="e.g., 75000"
                    error={errors.expectedSalary}
                  />
                  <Input
                    label="Available Start Date"
                    type="date"
                    value={applicationData.availableStartDate}
                    onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                    error={errors.availableStartDate}
                  />
                </div>

                <Input
                  label="Portfolio/GitHub URL"
                  type="url"
                  value={applicationData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="https://yourportfolio.com or https://github.com/username"
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-error/10 border border-error rounded-lg p-3">
                  <p className="text-sm text-error">{errors.submit}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isSubmitting}
                  iconName={isSubmitting ? "Loader2" : "Send"}
                  iconSize={16}
                  className={isSubmitting ? "animate-spin" : ""}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default QuickApplyModal;