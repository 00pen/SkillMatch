import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RegistrationHeader = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={28} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">SkillMatch</h1>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">Join SkillMatch Today</h2>
        <p className="text-text-secondary max-w-md mx-auto">
          Connect with opportunities or find the perfect candidates. 
          Start your journey with us in just a few steps.
        </p>
      </div>

      {/* Login Link */}
      <div className="flex items-center justify-center space-x-2 text-sm">
        <span className="text-text-secondary">Already have an account?</span>
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate('/login')}
          className="p-0 h-auto font-medium"
        >
          Sign in here
        </Button>
      </div>
    </div>
  );
};

export default RegistrationHeader;