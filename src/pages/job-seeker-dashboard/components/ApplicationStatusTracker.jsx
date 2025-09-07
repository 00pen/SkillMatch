import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApplicationStatusTracker = ({ applications = [] }) => {
  const navigate = useNavigate();

  const statusConfig = {
    'applied': { color: 'text-secondary', bgColor: 'bg-accent', icon: 'Send' },
    'under-review': { color: 'text-warning', bgColor: 'bg-warning/10', icon: 'Eye' },
    'interview': { color: 'text-info', bgColor: 'bg-blue-100', icon: 'Users' },
    'offer': { color: 'text-success', bgColor: 'bg-success/10', icon: 'Gift' },
    'hired': { color: 'text-success', bgColor: 'bg-success/10', icon: 'CheckCircle' },
    'rejected': { color: 'text-error', bgColor: 'bg-error/10', icon: 'XCircle' }
  };

  const getStatusDisplay = (status) => {
    return status?.split('-')?.map(word => 
      word?.charAt(0)?.toUpperCase() + word?.slice(1)
    )?.join(' ');
  };

  const handleViewAllApplications = () => {
    navigate('/application-tracking');
  };

  const recentApplications = applications?.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Recent Applications</h3>
        <div className="flex items-center space-x-1">
          <Icon name="FileText" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-text-secondary">
            {applications?.length} Total
          </span>
        </div>
      </div>
      {recentApplications?.length > 0 ? (
        <div className="space-y-3 mb-4">
          {recentApplications?.map((application) => {
            const config = statusConfig?.[application?.status] || statusConfig?.['applied'];
            return (
              <div key={application?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary truncate">
                    {application?.jobTitle}
                  </h4>
                  <p className="text-xs text-text-secondary truncate">
                    {application?.company}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config?.bgColor}`}>
                    <Icon name={config?.icon} size={12} className={config?.color} />
                    <span className={`text-xs font-medium ${config?.color}`}>
                      {getStatusDisplay(application?.status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Icon name="FileText" size={32} className="text-text-secondary mx-auto mb-2" />
          <p className="text-sm text-text-secondary mb-4">No applications yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/job-search-results')}
            iconName="Search"
            iconPosition="left"
          >
            Find Jobs
          </Button>
        </div>
      )}
      {recentApplications?.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={handleViewAllApplications}
          iconName="ArrowRight"
          iconPosition="right"
        >
          View All Applications
        </Button>
      )}
    </div>
  );
};

export default ApplicationStatusTracker;