import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CompanyProfileWidget = ({ profileData }) => {
  const navigate = useNavigate();

  const completionItems = [
    { key: 'logo', label: 'Company Logo', completed: !!profileData?.logo },
    { key: 'description', label: 'Company Description', completed: !!profileData?.description },
    { key: 'industry', label: 'Industry Information', completed: !!profileData?.industry },
    { key: 'website', label: 'Website URL', completed: !!profileData?.website },
    { key: 'location', label: 'Company Location', completed: !!profileData?.location },
    { key: 'benefits', label: 'Employee Benefits', completed: profileData?.benefits?.length > 0 }
  ];

  const completedCount = completionItems?.filter(item => item?.completed)?.length;
  const completionPercentage = Math.round((completedCount / completionItems?.length) * 100);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-error';
  };

  const handleCompleteProfile = () => {
    navigate('/profile', { state: { section: 'company' } });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Profile Completion</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-text-primary">{completionPercentage}%</span>
          <div className="w-12 h-12 relative">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getProgressColor(completionPercentage)}
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeLinecap="round"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="Building" size={16} className="text-text-secondary" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {completionItems?.map((item) => (
          <div key={item?.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                item?.completed ? 'bg-success' : 'bg-muted'
              }`}>
                {item?.completed && <Icon name="Check" size={12} className="text-white" />}
              </div>
              <span className={`text-sm ${
                item?.completed ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {item?.label}
              </span>
            </div>
            {item?.completed && (
              <Icon name="CheckCircle" size={16} className="text-success" />
            )}
          </div>
        ))}
      </div>
      {completionPercentage < 100 && (
        <div className="bg-accent rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={20} className="text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-text-primary mb-1">Improve Your Visibility</h4>
              <p className="text-sm text-text-secondary">
                Complete your profile to attract more qualified candidates and improve your company's credibility.
              </p>
            </div>
          </div>
        </div>
      )}
      <Button
        variant={completionPercentage < 100 ? "default" : "outline"}
        fullWidth
        onClick={handleCompleteProfile}
        iconName="Settings"
        iconPosition="left"
        iconSize={16}
      >
        {completionPercentage < 100 ? 'Complete Profile' : 'Manage Profile'}
      </Button>
    </div>
  );
};

export default CompanyProfileWidget;