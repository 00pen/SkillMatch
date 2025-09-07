import React from 'react';
import Icon from '../../../components/AppIcon';

const ApplicationProgressIndicator = ({ currentStatus, className = '' }) => {
  const stages = [
    { key: 'applied', label: 'Applied', icon: 'Send' },
    { key: 'under-review', label: 'Under Review', icon: 'Clock' },
    { key: 'interview', label: 'Interview', icon: 'Users' },
    { key: 'offer', label: 'Offer', icon: 'Gift' },
    { key: 'hired', label: 'Hired', icon: 'CheckCircle' }
  ];

  // Handle rejected status
  if (currentStatus === 'rejected') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full">
          <Icon name="XCircle" size={14} />
          <span className="text-sm font-medium">Rejected</span>
        </div>
      </div>
    );
  }

  const currentIndex = stages?.findIndex(stage => stage?.key === currentStatus);
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {stages?.map((stage, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <React.Fragment key={stage?.key}>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
              isCompleted 
                ? isCurrent 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
            }`}>
              <Icon 
                name={stage?.icon} 
                size={12} 
                className={isCompleted ? (isCurrent ? 'text-secondary-foreground' : 'text-success') : 'text-muted-foreground'} 
              />
              <span className="hidden sm:inline">{stage?.label}</span>
            </div>
            {index < stages?.length - 1 && (
              <div className={`w-4 h-0.5 transition-colors duration-150 ${
                index < currentIndex ? 'bg-success' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ApplicationProgressIndicator;