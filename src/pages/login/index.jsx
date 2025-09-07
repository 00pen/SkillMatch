import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getErrorMessage } from '../../utils/errorHandler';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/AppIcon';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithOAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({});

  const from = location.state?.from || '/';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors({ submit: getErrorMessage(error) });
        return;
      }
      
      // Navigate to appropriate dashboard or return location
      if (from !== '/') {
        navigate(from);
      } else {
        // Wait a moment for AuthContext to load the user profile from database
        setTimeout(async () => {
          try {
            // Get the current user's profile to determine correct dashboard
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', currentUser.id)
                .single();
              
              // Navigate to appropriate dashboard based on actual role
              if (profile?.role === 'employer') {
                navigate('/employer-dashboard');
              } else {
                navigate('/job-seeker-dashboard');
              }
            } else {
              navigate('/job-seeker-dashboard');
            }
          } catch (error) {
            console.error('Error determining user role:', error);
            navigate('/job-seeker-dashboard');
          }
        }, 100);
      }
      
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      setErrors({ submit: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setOauthLoading(prev => ({ ...prev, [provider]: true }));
    
    try {
      const { data, error } = await signInWithOAuth(provider);
      
      if (error) {
        setErrors({ submit: getErrorMessage(error) });
        return;
      }
      
      // OAuth will redirect to callback page, so no need to navigate here
      
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setErrors({ submit: getErrorMessage(error) });
    } finally {
      setOauthLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      <div className="pt-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card border border-border rounded-lg shadow-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Icon name="Zap" size={28} color="white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h1>
              <p className="text-text-secondary">Sign in to your SkillMatch account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                required
              />

              {errors.submit && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">{errors.submit}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                loading={isLoading}
                iconName="LogIn"
                iconPosition="left"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-text-secondary">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  size="default"
                  fullWidth
                  loading={oauthLoading.google}
                  disabled={Object.values(oauthLoading).some(loading => loading)}
                  onClick={() => handleOAuthLogin('google')}
                  className="bg-white border-border text-text-primary hover:bg-muted transition-colors duration-150"
                  iconName="Chrome"
                  iconPosition="left"
                  iconSize={18}
                >
                  {oauthLoading.google ? 'Connecting...' : 'Continue with Google'}
                </Button>
                
                <Button
                  variant="outline"
                  size="default"
                  fullWidth
                  loading={oauthLoading.linkedin_oidc}
                  disabled={Object.values(oauthLoading).some(loading => loading)}
                  onClick={() => handleOAuthLogin('linkedin_oidc')}
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600 transition-colors duration-150"
                  iconName="Linkedin"
                  iconPosition="left"
                  iconSize={18}
                >
                  {oauthLoading.linkedin_oidc ? 'Connecting...' : 'Continue with LinkedIn'}
                </Button>
                
                <Button
                  variant="outline"
                  size="default"
                  fullWidth
                  loading={oauthLoading.github}
                  disabled={Object.values(oauthLoading).some(loading => loading)}
                  onClick={() => handleOAuthLogin('github')}
                  className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900 transition-colors duration-150"
                  iconName="Github"
                  iconPosition="left"
                  iconSize={18}
                >
                  {oauthLoading.github ? 'Connecting...' : 'Continue with GitHub'}
                </Button>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <span className="text-text-secondary text-sm">Don't have an account? </span>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/register')}
                className="p-0 h-auto font-medium"
              >
                Create one here
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;