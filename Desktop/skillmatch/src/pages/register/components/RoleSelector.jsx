import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleSelector = ({ selectedRole, onRoleChange, className = '' }) => {
  const roles = [
    {
      id: 'job-seeker',
      label: 'Job Seeker',
      description: 'Looking for job opportunities',
      icon: 'User',
      features: ['Browse jobs', 'Apply to positions', 'Track applications', 'Build profile']
    },
    {
      id: 'employer',
      label: 'Employer',
      description: 'Hiring talented professionals',
      icon: 'Building2',
      features: ['Post job openings', 'Review applications', 'Manage candidates', 'Company profile']
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Choose Your Role</h3>
        <p className="text-text-secondary text-sm">Select how you'll be using SkillMatch</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles?.map((role) => (
          <div
            key={role?.id}
            onClick={() => onRoleChange(role?.id)}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-150 hover:shadow-card ${
              selectedRole === role?.id
                ? 'border-secondary bg-accent text-text-primary' :'border-border bg-card hover:border-secondary/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedRole === role?.id ? 'bg-secondary text-white' : 'bg-muted text-text-secondary'
              }`}>
                <Icon name={role?.icon} size={24} />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-1">{role?.label}</h4>
                <p className="text-sm text-text-secondary mb-3">{role?.description}</p>
                
                <ul className="space-y-1">
                  {role?.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-xs text-text-secondary">
                      <Icon name="Check" size={12} className="mr-2 text-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {selectedRole === role?.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} color="white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;