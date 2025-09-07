import React, { useState, useEffect } from 'react';


const StatusIndicator = ({ 
  status = 'pending', 
  count = 0, 
  showCount = true, 
  size = 'default',
  position = 'top-right',
  className = '',
  animate = true,
  onClick = null
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for smooth animation
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [count]);

  // Status color mapping
  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    success: 'bg-success text-success-foreground',
    error: 'bg-error text-error-foreground',
    info: 'bg-secondary text-secondary-foreground',
    new: 'bg-secondary text-secondary-foreground',
    active: 'bg-success text-success-foreground',
    inactive: 'bg-muted text-muted-foreground',
    urgent: 'bg-error text-error-foreground'
  };

  // Size variants
  const sizeVariants = {
    sm: 'w-4 h-4 text-xs',
    default: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  // Position variants
  const positionVariants = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  const baseClasses = `
    absolute rounded-full flex items-center justify-center font-medium
    ${sizeVariants?.[size]}
    ${statusColors?.[status]}
    ${positionVariants?.[position]}
    ${animate ? 'transition-all duration-150 ease-out' : ''}
    ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
    ${onClick ? 'cursor-pointer hover:scale-110' : ''}
    ${className}
  `;

  if (!showCount && count === 0) {
    return null;
  }

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e?.key === 'Enter' || e?.key === ' ') {
          e?.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {showCount && count > 0 ? (
        <span>{count > 99 ? '99+' : count}</span>
      ) : (
        <div className="w-2 h-2 rounded-full bg-current" />
      )}
    </div>
  );
};

// Specialized status indicators for common use cases
export const ApplicationStatusIndicator = ({ applications = [] }) => {
  const pendingCount = applications?.filter(app => app?.status === 'pending')?.length;
  const newCount = applications?.filter(app => app?.status === 'new')?.length;
  
  if (pendingCount === 0 && newCount === 0) return null;

  return (
    <StatusIndicator
      status={newCount > 0 ? 'new' : 'pending'}
      count={newCount + pendingCount}
      showCount={true}
    />
  );
};

export const MessageStatusIndicator = ({ unreadCount = 0 }) => {
  return (
    <StatusIndicator
      status="info"
      count={unreadCount}
      showCount={true}
      animate={true}
    />
  );
};

export const NotificationStatusIndicator = ({ notifications = [] }) => {
  const unreadCount = notifications?.filter(notif => !notif?.read)?.length;
  const hasUrgent = notifications?.some(notif => !notif?.read && notif?.priority === 'urgent');
  
  return (
    <StatusIndicator
      status={hasUrgent ? 'urgent' : 'info'}
      count={unreadCount}
      showCount={true}
      animate={true}
    />
  );
};

// Multi-status indicator for complex states
export const MultiStatusIndicator = ({ statuses = [], className = '' }) => {
  if (statuses?.length === 0) return null;

  return (
    <div className={`flex -space-x-1 ${className}`}>
      {statuses?.map((statusItem, index) => (
        <StatusIndicator
          key={index}
          status={statusItem?.status}
          count={statusItem?.count}
          showCount={statusItem?.showCount !== false}
          size="sm"
          position="static"
          className="relative top-0 right-0 border-2 border-background"
        />
      ))}
    </div>
  );
};

// Progress status indicator with steps
export const ProgressStatusIndicator = ({ 
  currentStep = 0, 
  totalSteps = 1, 
  status = 'pending',
  className = '' 
}) => {
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className={`relative ${className}`}>
      <StatusIndicator
        status={status}
        count={progress}
        showCount={true}
        size="lg"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">
          {progress}%
        </span>
      </div>
    </div>
  );
};

// Connection status indicator
export const ConnectionStatusIndicator = ({ isOnline = true, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-error'}`} />
        {isOnline && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping opacity-75" />
        )}
      </div>
      <span className="text-sm text-text-secondary">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default StatusIndicator;