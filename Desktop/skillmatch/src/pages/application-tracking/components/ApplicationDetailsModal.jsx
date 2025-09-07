import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
  // Disable body scroll when modal is open
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

  if (!isOpen || !application) return null;

  const handleOverlayClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <h2 className="text-xl font-semibold text-text-primary">Application Details</h2>
            <p className="text-sm text-text-secondary mt-1">
              {application?.jobTitle} at {application?.company}
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
          <div className="p-6 space-y-6">
            {/* Application Status */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Application Status</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Applied on {formatDate(application?.appliedDate)}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  application?.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                  application?.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                  application?.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                  application?.status === 'hired' ? 'bg-green-100 text-green-800' :
                  application?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {application?.status?.charAt(0)?.toUpperCase() + application?.status?.slice(1)}
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Cover Letter
              </label>
              <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted/20 min-h-[120px] overflow-hidden">
                <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                  {application?.coverLetter || 'No cover letter provided'}
                </p>
              </div>
            </div>

            {/* Resume */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Resume/CV
              </label>
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center space-x-3">
                  <Icon name="FileText" size={24} className="text-text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {application?.resumeFileName || 'resume.pdf'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Uploaded on {formatDate(application?.appliedDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio URL */}
            {application?.portfolioUrl && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Portfolio/Website URL
                </label>
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted/20">
                  <a 
                    href={application?.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-secondary hover:underline"
                  >
                    {application?.portfolioUrl}
                  </a>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Available Start Date
                </label>
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted/20">
                  <p className="text-sm text-text-primary">
                    {application?.availableStartDate ? formatDate(application?.availableStartDate) : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Salary Expectation
                </label>
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted/20">
                  <p className="text-sm text-text-primary">
                    {application?.salaryExpectation || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={application?.agreeToTerms ? "CheckCircle" : "XCircle"} 
                  size={16} 
                  className={application?.agreeToTerms ? "text-green-600" : "text-red-600"} 
                />
                <span className="text-sm text-text-primary">
                  Agreed to terms and conditions
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Icon 
                  name={application?.allowContact ? "CheckCircle" : "XCircle"} 
                  size={16} 
                  className={application?.allowContact ? "text-green-600" : "text-red-600"} 
                />
                <span className="text-sm text-text-primary">
                  Allow contact for similar opportunities
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted flex-shrink-0">
          <div className="text-sm text-text-secondary">
            Application submitted on {formatDate(application?.appliedDate)}
          </div>
          <Button
            variant="default"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
