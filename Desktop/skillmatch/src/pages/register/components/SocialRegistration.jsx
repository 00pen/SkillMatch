import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandler';
import Button from '../../../components/ui/Button';

const SocialRegistration = ({ selectedRole, className = '' }) => {
  const { signInWithOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState({});
  const [error, setError] = useState('');

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'bg-white border-border text-text-primary hover:bg-muted'
    },
    {
      id: 'linkedin_oidc',
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'Github',
      color: 'bg-gray-900 text-white hover:bg-gray-800'
    }
  ];

  const handleSocialLogin = async (providerId) => {
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }

    setIsLoading(prev => ({ ...prev, [providerId]: true }));
    setError('');
    
    try {
      const { data, error: oauthError } = await signInWithOAuth(providerId, { role: selectedRole });
      
      if (oauthError) {
        setError(getErrorMessage(oauthError));
        return;
      }
      
      // OAuth will redirect to callback page, so no need to navigate here
      
    } catch (error) {
      console.error(`${providerId} registration failed:`, error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(prev => ({ ...prev, [providerId]: false }));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-text-secondary">Or continue with</span>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.id}
            variant="outline"
            size="default"
            fullWidth
            loading={isLoading?.[provider?.id]}
            disabled={!selectedRole || Object.values(isLoading)?.some(loading => loading)}
            onClick={() => handleSocialLogin(provider?.id)}
            className={`${provider?.color} transition-colors duration-150`}
            iconName={provider?.icon}
            iconPosition="left"
            iconSize={18}
          >
            {isLoading?.[provider?.id] 
              ? `Connecting to ${provider?.name}...` 
              : `Continue with ${provider?.name}`
            }
          </Button>
        ))}
      </div>
      {!selectedRole && (
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Please select your role first to continue with social registration
          </p>
        </div>
      )}
      <div className="text-center text-xs text-text-secondary">
        <p>
          By continuing, you agree to our{' '}
          <button className="text-secondary hover:underline">Terms of Service</button>
          {' '}and{' '}
          <button className="text-secondary hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
};

export default SocialRegistration;