import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ApplicationModal = ({ isOpen, onClose, job, onSubmit }) => {
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeFile: null,
    portfolioUrl: '',
    availableStartDate: '',
    salaryExpectation: '',
    agreeToTerms: false,
    allowContact: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Disable body scroll when modal is open - hook must be called unconditionally
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes?.includes(file?.type)) {
        setErrors(prev => ({
          ...prev,
          resumeFile: 'Please upload a PDF or Word document'
        }));
        return;
      }
      
      if (file?.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          resumeFile: 'File size must be less than 5MB'
        }));
        return;
      }
      
      handleInputChange('resumeFile', file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!applicationData?.coverLetter?.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (applicationData?.coverLetter?.length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters';
    }
    
    if (!applicationData?.resumeFile) {
      newErrors.resumeFile = 'Resume is required';
    }
    
    if (!applicationData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        jobId: job?.id,
        ...applicationData,
        submittedAt: new Date()?.toISOString()
      });
      
      // Reset form
      setApplicationData({
        coverLetter: '',
        resumeFile: null,
        portfolioUrl: '',
        availableStartDate: '',
        salaryExpectation: '',
        agreeToTerms: false,
        allowContact: true
      });
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Apply for Position</h2>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Cover Letter *
              </label>
              <textarea
                value={applicationData?.coverLetter}
                onChange={(e) => handleInputChange('coverLetter', e?.target?.value)}
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
                  errors?.coverLetter ? 'border-error' : 'border-border'
                }`}
              />
              {errors?.coverLetter && (
                <p className="text-sm text-error mt-1">{errors?.coverLetter}</p>
              )}
              <p className="text-xs text-text-secondary mt-1">
                {applicationData?.coverLetter?.length}/500 characters (minimum 100)
              </p>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Resume/CV *
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                errors?.resumeFile ? 'border-error' : 'border-border hover:border-secondary'
              } transition-colors duration-150`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Icon name="Upload" size={32} className="mx-auto text-text-secondary mb-2" />
                  <p className="text-sm font-medium text-text-primary">
                    {applicationData?.resumeFile ? applicationData?.resumeFile?.name : 'Click to upload resume'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    PDF, DOC, or DOCX (max 5MB)
                  </p>
                </label>
              </div>
              {errors?.resumeFile && (
                <p className="text-sm text-error mt-1">{errors?.resumeFile}</p>
              )}
            </div>

            {/* Portfolio URL */}
            <Input
              label="Portfolio/Website URL"
              type="url"
              placeholder="https://your-portfolio.com"
              value={applicationData?.portfolioUrl}
              onChange={(e) => handleInputChange('portfolioUrl', e?.target?.value)}
              description="Optional: Share your portfolio or personal website"
            />

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Available Start Date"
                type="date"
                value={applicationData?.availableStartDate}
                onChange={(e) => handleInputChange('availableStartDate', e?.target?.value)}
              />
              
              <Input
                label="Salary Expectation"
                type="text"
                placeholder="e.g., $80,000 - $100,000"
                value={applicationData?.salaryExpectation}
                onChange={(e) => handleInputChange('salaryExpectation', e?.target?.value)}
                description="Optional"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <Checkbox
                label="I agree to the terms and conditions and privacy policy"
                checked={applicationData?.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
                error={errors?.agreeToTerms}
                required
              />
              
              <Checkbox
                label="Allow the employer to contact me about similar opportunities"
                checked={applicationData?.allowContact}
                onChange={(e) => handleInputChange('allowContact', e?.target?.checked)}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted flex-shrink-0">
          <div className="text-sm text-text-secondary">
            Your application will be sent directly to {job?.company?.name}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              loading={isSubmitting}
              iconName="Send"
              iconPosition="right"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;