import React from 'react';
import Icon from '../../../components/AppIcon';

const ApplicationStatusBadge = ({ status, size = 'default', showIcon = true }) => {
  const statusConfig = {
    pending: {
      label: 'Pending Review',
      icon: 'Clock',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    reviewed: {
      label: 'Under Review',
      icon: 'Eye',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    interview_scheduled: {
      label: 'Interview Scheduled',
      icon: 'Calendar',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    interviewed: {
      label: 'Interviewed',
      icon: 'Users',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    offer_extended: {
      label: 'Offer Extended',
      icon: 'Gift',
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    hired: {
      label: 'Hired',
      icon: 'CheckCircle',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: {
      label: 'Rejected',
      icon: 'XCircle',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    withdrawn: {
      label: 'Withdrawn',
      icon: 'X',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    // Legacy status support
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
    }
  };

  const config = statusConfig?.[status] || statusConfig?.pending;
  
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