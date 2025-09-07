import React from 'react';
import Icon from '../../../components/AppIcon';

const ApplicationStatusBadge = ({ status, size = 'default', showIcon = true }) => {
  const statusConfig = {
    applied: {
      label: 'Applied',
      icon: 'Send',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    'under-review': {
      label: 'Under Review',
      icon: 'Clock',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    interview: {
      label: 'Interview',
      icon: 'Users',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    offer: {
      label: 'Offer',
      icon: 'Gift',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    hired: {
      label: 'Hired',
      icon: 'CheckCircle',
      className: 'bg-success/10 text-success border-success/20'
    },
    rejected: {
      label: 'Rejected',
      icon: 'XCircle',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.applied;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    default: 14,
    lg: 16
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config?.className} ${sizeClasses?.[size]}`}>
      {showIcon && (
        <Icon name={config?.icon} size={iconSizes?.[size]} />
      )}
      {config?.label}
    </span>
  );
};

export default ApplicationStatusBadge;