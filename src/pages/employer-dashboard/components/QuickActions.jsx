import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onPostJob, onViewAllJobs, onManageApplications }) => {
  const navigate = useNavigate();

  const quickActionItems = [
    {
      title: 'Post New Job',
      description: 'Create a new job posting to attract candidates',
      icon: 'Plus',
      variant: 'default',
      onClick: onPostJob
    },
    {
      title: 'View All Jobs',
      description: 'Manage your existing job postings',
      icon: 'Briefcase',
      variant: 'outline',
      onClick: onViewAllJobs
    },
    {
      title: 'Browse Candidates',
      description: 'Search for potential candidates',
      icon: 'Search',
      variant: 'outline',
      onClick: () => navigate('/candidates')
    },
    {
      title: 'Manage Applications',
      description: 'Review and process applications',
      icon: 'FileText',
      variant: 'outline',
      onClick: onManageApplications
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActionItems?.map((action, index) => (
        <Button
          key={index}
          variant={action?.variant}
          onClick={action?.onClick}
          className="h-auto p-4 flex flex-col items-center text-center space-y-2"
          iconName={action?.icon}
          iconSize={24}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="font-medium">{action?.title}</span>
            <span className="text-xs opacity-80">{action?.description}</span>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;