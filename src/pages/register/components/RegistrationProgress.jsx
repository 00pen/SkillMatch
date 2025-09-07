import React from 'react';
import Icon from '../../../components/AppIcon';

const RegistrationProgress = ({ currentStep = 1, totalSteps = 3, className = '' }) => {
  const steps = [
    { id: 1, label: 'Choose Role', icon: 'UserCheck' },
    { id: 2, label: 'Basic Info', icon: 'FileText' },
    { id: 3, label: 'Complete', icon: 'CheckCircle' }
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.id}>
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150 ${
                step?.id < currentStep 
                  ? 'bg-success text-white' 
                  : step?.id === currentStep 
                    ? 'bg-secondary text-white' :'bg-muted text-text-secondary'
              }`}>
                {step?.id < currentStep ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <Icon name={step?.icon} size={16} />
                )}
              </div>
              <span className={`text-xs font-medium ${
                step?.id <= currentStep ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {step?.label}
              </span>
            </div>
            
            {index < steps?.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step?.id < currentStep ? 'bg-success' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm text-text-secondary">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

export default RegistrationProgress;