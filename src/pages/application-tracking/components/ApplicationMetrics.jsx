import React from 'react';
import Icon from '../../../components/AppIcon';

const ApplicationMetrics = ({ applications = [] }) => {
  // Calculate metrics
  const totalApplications = applications?.length;
  const responseRate = totalApplications > 0 
    ? Math.round((applications?.filter(app => app?.status !== 'applied')?.length / totalApplications) * 100)
    : 0;

  const statusCounts = applications?.reduce((acc, app) => {
    acc[app.status] = (acc?.[app?.status] || 0) + 1;
    return acc;
  }, {});

  const metrics = [
    {
      label: 'Total Applications',
      value: totalApplications,
      icon: 'FileText',
      color: 'text-secondary',
      bgColor: 'bg-accent'
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Under Review',
      value: statusCounts?.['under-review'] || 0,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Interviews',
      value: statusCounts?.['interview'] || 0,
      icon: 'Users',
      color: 'text-info',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics?.map((metric, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                {metric?.label}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {metric?.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${metric?.bgColor} flex items-center justify-center`}>
              <Icon name={metric?.icon} size={24} className={metric?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationMetrics;