import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CompanyProfileCompletionWidget = ({ userProfile, companyProfile }) => {
  const navigate = useNavigate();

  const calculateCompletionPercentage = () => {
    if (!userProfile) return 0;
    
    const fields = [
      userProfile?.full_name,
      userProfile?.company_name,
      userProfile?.industry,
      userProfile?.website_url,
      userProfile?.phone,
      companyProfile?.description,
      companyProfile?.logo_url,
      companyProfile?.headquarters,
      companyProfile?.size,
      companyProfile?.founded
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim());
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const getMissingFields = () => {
    const fieldLabels = [];
    
    if (!userProfile?.full_name) fieldLabels.push('Full Name');
    if (!userProfile?.company_name) fieldLabels.push('Company Name');
    if (!userProfile?.industry) fieldLabels.push('Industry');
    if (!userProfile?.website_url) fieldLabels.push('Company Website');
    if (!userProfile?.phone) fieldLabels.push('Contact Phone');
    if (!companyProfile?.description) fieldLabels.push('Company Description');
    if (!companyProfile?.logo_url) fieldLabels.push('Company Logo');
    if (!companyProfile?.headquarters) fieldLabels.push('Company Location');
    if (!companyProfile?.size) fieldLabels.push('Company Size');
    if (!companyProfile?.founded) fieldLabels.push('Founded Year');
    
    return fieldLabels;
  };

  const completionPercentage = calculateCompletionPercentage();
  const missingFields = getMissingFields();

  const handleCompleteProfile = () => {
    navigate('/company-profile');
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

  const getCompletionMessage = (percentage) => {
    if (percentage >= 80) return "Your company profile looks great!";
    if (percentage >= 50) return "Almost there! Complete a few more fields.";
    return "Complete your company profile to attract top talent.";
  };

  if (completionPercentage >= 100) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Profile Complete!</h3>
            <p className="text-sm text-text-secondary">Your company profile is 100% complete</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleCompleteProfile}
          iconName="Settings"
          iconPosition="left"
        >
          Manage Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Company Profile</h3>
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
      
      <p className="text-sm text-text-secondary mb-4">
        {getCompletionMessage(completionPercentage)}
      </p>
      
      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-2">Complete these sections:</p>
          <div className="space-y-2">
            {missingFields.slice(0, 3).map((field, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="text-text-primary">{field}</span>
              </div>
            ))}
            {missingFields.length > 3 && (
              <p className="text-xs text-text-secondary">
                +{missingFields.length - 3} more items
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
        iconName="Building"
        iconPosition="left"
      >
        Complete Company Profile
      </Button>
    </div>
  );
};

export default CompanyProfileCompletionWidget;