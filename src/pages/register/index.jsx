import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import RegistrationHeader from './components/RegistrationHeader';
import RegistrationProgress from './components/RegistrationProgress';
import RoleSelector from './components/RoleSelector';
import RegistrationForm from './components/RegistrationForm';
import SocialRegistration from './components/SocialRegistration';
import Icon from '../../components/AppIcon';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user came from a specific role context
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params?.get('role');
    if (roleParam && ['job-seeker', 'employer']?.includes(roleParam)) {
      setSelectedRole(roleParam);
      setCurrentStep(2);
    }
  }, [location?.search]);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setCurrentStep(2);
    
    // Update URL with role parameter
    const params = new URLSearchParams(location.search);
    params?.set('role', role);
    navigate(`${location?.pathname}?${params?.toString()}`, { replace: true });
  };

  const handleRegistrationSubmit = async (userData) => {
    setIsSubmitting(true);
    setCurrentStep(3);
    
    try {
      console.log('Registering user:', userData);
      
      // Registration will be handled by RegistrationForm component
      // This is just for displaying success state
      
      // Show success state briefly
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigation will be handled by auth state change in AuthContext
      
    } catch (error) {
      console.error('Registration failed:', error);
      setCurrentStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole('');
    setCurrentStep(1);
    
    // Remove role parameter from URL
    const params = new URLSearchParams(location.search);
    params?.delete('role');
    const newSearch = params?.toString();
    navigate(`${location?.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Header and Progress */}
            <div className="lg:col-span-1 space-y-6">
              <RegistrationHeader />
              
              <div className="hidden lg:block">
                <RegistrationProgress 
                  currentStep={currentStep} 
                  totalSteps={3}
                />
              </div>
              
              {/* Benefits Section */}
              <div className="hidden lg:block bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-text-primary mb-4">Why Choose SkillMatch?</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'Target', text: 'AI-powered job matching' },
                    { icon: 'Users', text: 'Connect with top employers' },
                    { icon: 'TrendingUp', text: 'Career growth opportunities' },
                    { icon: 'Shield', text: 'Secure and private' }
                  ]?.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                        <Icon name={benefit?.icon} size={16} className="text-secondary" />
                      </div>
                      <span className="text-sm text-text-secondary">{benefit?.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg shadow-card">
                <div className="p-6 sm:p-8">
                  {/* Mobile Progress */}
                  <div className="lg:hidden mb-6">
                    <RegistrationProgress 
                      currentStep={currentStep} 
                      totalSteps={3}
                    />
                  </div>
                  
                  {/* Step 1: Role Selection */}
                  {currentStep === 1 && (
                    <RoleSelector
                      selectedRole={selectedRole}
                      onRoleChange={handleRoleSelection}
                    />
                  )}
                  
                  {/* Step 2: Registration Form */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      {/* Back Button */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleBackToRoleSelection}
                          className="flex items-center space-x-2 text-text-secondary hover:text-secondary transition-colors duration-150"
                        >
                          <Icon name="ArrowLeft" size={16} />
                          <span className="text-sm">Back to role selection</span>
                        </button>
                        
                        <div className="flex items-center space-x-2 text-sm text-text-secondary">
                          <Icon name={selectedRole === 'job-seeker' ? 'User' : 'Building2'} size={16} />
                          <span className="capitalize">{selectedRole?.replace('-', ' ')}</span>
                        </div>
                      </div>
                      
                      <RegistrationForm
                        selectedRole={selectedRole}
                        onSubmit={handleRegistrationSubmit}
                      />
                      
                      <SocialRegistration selectedRole={selectedRole} />
                    </div>
                  )}
                  
                  {/* Step 3: Success State */}
                  {currentStep === 3 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Check" size={32} color="white" />
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        Account Created Successfully!
                      </h3>
                      <p className="text-text-secondary mb-6">
                        Welcome to SkillMatch. Redirecting you to your dashboard...
                      </p>
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer Links */}
              <div className="mt-6 text-center text-sm text-text-secondary">
                <p>
                  Need help?{' '}
                  <button className="text-secondary hover:underline">Contact Support</button>
                  {' '}or{' '}
                  <button className="text-secondary hover:underline">View FAQ</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;