import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileCompletionWidget = ({ userProfile }) => {
  const navigate = useNavigate();

  const calculateProfileCompletion = () => {
    if (!userProfile) return { percentage: 0, missingFields: [] };
    
    const fields = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'location', label: 'Location' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'bio', label: 'Bio' },
      { key: 'current_job_title', label: 'Current Job Title' },
      { key: 'industry', label: 'Industry' },
      { key: 'linkedin_url', label: 'LinkedIn Profile' },
      { key: 'github_url', label: 'GitHub Profile' },
      { key: 'portfolio_url', label: 'Portfolio URL' },
      { key: 'skills', label: 'Skills' },
      { key: 'education', label: 'Education' },
      { key: 'work_experience', label: 'Work Experience' }
    ];
    
    const completedFields = fields.filter(field => {
      const value = userProfile[field.key];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim();
    });
    
    const missingFields = fields.filter(field => {
      const value = userProfile[field.key];
      if (Array.isArray(value)) return value.length === 0;
      return !value || !value.toString().trim();
    }).map(field => field.label);
    
    const percentage = Math.round((completedFields.length / fields.length) * 100);
    
    return { percentage, missingFields };
  };

  const { percentage: completionPercentage, missingFields } = calculateProfileCompletion();

  const handleCompleteProfile = () => {
    navigate('/profile');
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Profile Completion</h3>
        <div className={`text-2xl font-bold ${getCompletionColor(completionPercentage)}`}>
          {completionPercentage}%
        </div>
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(completionPercentage)}`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      {/* Missing Fields */}
      {missingFields?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-2">Complete these sections:</p>
          <div className="space-y-2">
            {missingFields?.slice(0, 3)?.map((field, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="text-text-primary">{field}</span>
              </div>
            ))}
            {missingFields?.length > 3 && (
              <p className="text-xs text-text-secondary">
                +{missingFields?.length - 3} more items
              </p>
            )}
          </div>
        </div>
      )}
      <Button
        variant="secondary"
        size="sm"
        fullWidth
        onClick={handleCompleteProfile}
        iconName="User"
        iconPosition="left"
      >
        Complete Profile
      </Button>
    </div>
  );
};

export default ProfileCompletionWidget;