import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegistrationForm = ({ selectedRole, onSubmit, className = '' }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    currentJobTitle: '',
    companyName: '',
    industry: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const industries = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' }
  ];

  const validatePassword = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[A-Z]/?.test(password)) strength++;
    if (/[a-z]/?.test(password)) strength++;
    if (/[0-9]/?.test(password)) strength++;
    if (/[^A-Za-z0-9]/?.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time password strength validation
    if (field === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (selectedRole === 'job-seeker' && !formData?.location?.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (selectedRole === 'employer') {
      if (!formData?.companyName?.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData?.industry) {
        newErrors.industry = 'Industry selection is required';
      }
    }
    
    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare user data for Supabase
      const userData = {
        fullName: formData?.fullName,
        role: selectedRole,
        ...(selectedRole === 'job-seeker' && {
          location: formData?.location,
          currentJobTitle: formData?.currentJobTitle
        }),
        ...(selectedRole === 'employer' && {
          companyName: formData?.companyName,
          industry: formData?.industry
        }),
        subscribeNewsletter: formData?.subscribeNewsletter
      };
      
      // Sign up with Supabase
      const { data, error } = await signUp(formData?.email, formData?.password, userData);
      
      if (error) {
        setErrors({ submit: error.message });
        return;
      }
      
      // Call parent onSubmit for any additional handling
      if (onSubmit) {
        try {
          onSubmit({ ...userData, id: data.user?.id });
        } catch (onSubmitError) {
          console.error('Error in onSubmit callback:', onSubmitError);
        }
      }
      
      // Navigate to appropriate dashboard based on role
      const dashboardRoute = selectedRole === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard';
      setTimeout(() => {
        try {
          navigate(dashboardRoute);
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }, 2000); // Small delay to show success message
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-error';
    if (passwordStrength <= 3) return 'bg-warning';
    return 'bg-success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
        
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData?.fullName}
          onChange={(e) => handleInputChange('fullName', e?.target?.value)}
          error={errors?.fullName}
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />
        
        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
          />
          
          {formData?.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength <= 2 ? 'text-error' : 
                  passwordStrength <= 3 ? 'text-warning' : 'text-success'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData?.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
          error={errors?.confirmPassword}
          required
        />
      </div>
      {/* Role-specific fields */}
      {selectedRole === 'job-seeker' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Job Seeker Details</h3>
          
          <Input
            label="Location"
            type="text"
            placeholder="City, State or Country"
            value={formData?.location}
            onChange={(e) => handleInputChange('location', e?.target?.value)}
            error={errors?.location}
            required
          />
          
          <Input
            label="Current Job Title"
            type="text"
            placeholder="Your current or most recent position (optional)"
            value={formData?.currentJobTitle}
            onChange={(e) => handleInputChange('currentJobTitle', e?.target?.value)}
          />
        </div>
      )}
      {selectedRole === 'employer' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Company Details</h3>
          
          <Input
            label="Company Name"
            type="text"
            placeholder="Enter your company name"
            value={formData?.companyName}
            onChange={(e) => handleInputChange('companyName', e?.target?.value)}
            error={errors?.companyName}
            required
          />
          
          <Select
            label="Industry"
            placeholder="Select your industry"
            options={industries}
            value={formData?.industry}
            onChange={(value) => handleInputChange('industry', value)}
            error={errors?.industry}
            required
          />
        </div>
      )}
      {/* Terms and Newsletter */}
      <div className="space-y-4">
        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={formData?.agreeToTerms}
          onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
          error={errors?.agreeToTerms}
          required
        />
        
        <Checkbox
          label="Subscribe to newsletter for job alerts and updates"
          description="Get the latest opportunities delivered to your inbox"
          checked={formData?.subscribeNewsletter}
          onChange={(e) => handleInputChange('subscribeNewsletter', e?.target?.checked)}
        />
      </div>
      {/* Submit Error */}
      {errors?.submit && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <span className="text-sm text-error">{errors?.submit}</span>
          </div>
        </div>
      )}
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={!selectedRole}
        iconName="UserPlus"
        iconPosition="left"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegistrationForm;