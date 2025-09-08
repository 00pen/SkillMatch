import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CompanyManagementWidget = ({ userProfile, companyProfile }) => {
  const navigate = useNavigate();

  const handleManageCompany = () => {
    navigate('/company-profile');
  };

  const handleCreateCompany = () => {
    navigate('/company-profile');
  };

  // If user has no company associated
  if (!userProfile?.company_id && !companyProfile) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
            <Icon name="Building" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">No Company Profile</h3>
            <p className="text-sm text-text-secondary">Create or associate with a company</p>
          </div>
        </div>
        
        <p className="text-sm text-text-secondary mb-4">
          You need to create or associate with a company profile to post jobs and manage applications effectively.
        </p>
        
        <Button
          variant="default"
          size="sm"
          fullWidth
          onClick={handleCreateCompany}
          iconName="Plus"
          iconPosition="left"
        >
          Create Company Profile
        </Button>
      </div>
    );
  }

  // If user has company associated
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          {companyProfile?.logo_url ? (
            <img 
              src={companyProfile.logo_url} 
              alt="Company Logo" 
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <Icon name="Building" size={20} className="text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary">
            {companyProfile?.name || userProfile?.company_name || 'Company Profile'}
          </h3>
          <p className="text-sm text-text-secondary">
            {companyProfile?.industry || userProfile?.industry || 'Manage your company information'}
          </p>
        </div>
      </div>
      
      {companyProfile?.description && (
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {companyProfile.description}
        </p>
      )}
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {companyProfile?.size && (
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xs text-text-secondary">Size</p>
            <p className="text-sm font-medium text-text-primary">{companyProfile.size}</p>
          </div>
        )}
        {companyProfile?.founded && (
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xs text-text-secondary">Founded</p>
            <p className="text-sm font-medium text-text-primary">{companyProfile.founded}</p>
          </div>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        fullWidth
        onClick={handleManageCompany}
        iconName="Settings"
        iconPosition="left"
      >
        Manage Company Profile
      </Button>
    </div>
  );
};

export default CompanyManagementWidget;
