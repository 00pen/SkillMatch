import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';

const Profile = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfile, deleteAccount } = useAuth();
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: '',
    location: '',
    phone: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    
    // Professional Information
    current_job_title: '',
    company_name: '',
    industry: '',
    years_experience: '',
    expected_salary_min: '',
    expected_salary_max: '',
    salary_currency: 'USD',
    employment_type_preferences: [],
    remote_work_preference: '',
    availability: '',
    notice_period: '',
    
    // Social Links
    website_url: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    
    // Skills & Qualifications
    skills: [],
    languages: [],
    certifications: [],
    
    // Education
    education: [],
    
    // Work Experience
    work_experience: [],
    
    // Documents
    resume_url: '',
    cover_letter_url: '',
    portfolio_files: [],
    
    // Profile Picture
    profile_picture_url: ''
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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
  
  const employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' }
  ];
  
  const remotePreferences = [
    { value: 'on-site', label: 'On-site only' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Remote only' },
    { value: 'flexible', label: 'Flexible' }
  ];
  
  const experienceLevels = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ];
  
  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' }
  ];
  
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'User' },
    { id: 'professional', label: 'Professional', icon: 'Briefcase' },
    { id: 'skills', label: 'Skills & Education', icon: 'BookOpen' },
    { id: 'experience', label: 'Experience', icon: 'Clock' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings' }
  ];

  useEffect(() => {
    if (userProfile) {
      setFormData({
        // Basic Information
        full_name: userProfile.full_name || '',
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
        date_of_birth: userProfile.date_of_birth || '',
        gender: userProfile.gender || '',
        nationality: userProfile.nationality || '',
        
        // Professional Information
        current_job_title: userProfile.current_job_title || '',
        company_name: userProfile.company_name || '',
        industry: userProfile.industry || '',
        years_experience: userProfile.years_experience || '',
        expected_salary_min: userProfile.expected_salary_min || '',
        expected_salary_max: userProfile.expected_salary_max || '',
        salary_currency: userProfile.salary_currency || 'USD',
        employment_type_preferences: userProfile.employment_type_preferences || [],
        remote_work_preference: userProfile.remote_work_preference || '',
        availability: userProfile.availability || '',
        notice_period: userProfile.notice_period || '',
        
        // Social Links
        website_url: userProfile.website_url || '',
        linkedin_url: userProfile.linkedin_url || '',
        github_url: userProfile.github_url || '',
        portfolio_url: userProfile.portfolio_url || '',
        
        // Skills & Qualifications
        skills: userProfile.skills || [],
        languages: userProfile.languages || [],
        certifications: userProfile.certifications || [],
        
        // Education
        education: userProfile.education || [],
        
        // Work Experience
        work_experience: userProfile.work_experience || [],
        
        // Documents
        resume_url: userProfile.resume_url || '',
        cover_letter_url: userProfile.cover_letter_url || '',
        portfolio_files: userProfile.portfolio_files || [],
        
        // Profile Picture
        profile_picture_url: userProfile.profile_picture_url || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const addArrayItem = (arrayField, newItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: [...prev[arrayField], newItem]
    }));
  };
  
  const updateArrayItem = (arrayField, index, updatedItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: prev[arrayField].map((item, i) => i === index ? updatedItem : item)
    }));
  };
  
  const removeArrayItem = (arrayField, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: prev[arrayField].filter((_, i) => i !== index)
    }));
  };
  
  const handleEmploymentTypeChange = (type, checked) => {
    if (checked) {
      handleInputChange('employment_type_preferences', [...formData.employment_type_preferences, type]);
    } else {
      handleInputChange('employment_type_preferences', formData.employment_type_preferences.filter(t => t !== type));
    }
  };
  
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    try {
      setIsLoading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Determine the appropriate bucket based on file type
      let bucket;
      if (type === 'resume') {
        bucket = 'user-resumes';
      } else if (type === 'cover_letter') {
        bucket = 'user-resumes'; // Store cover letters in the same bucket as resumes
      } else if (type === 'portfolio') {
        bucket = 'user-portfolios';
      } else if (type === 'profile_picture') {
        bucket = 'profile-pictures';
      } else {
        bucket = 'user-files'; // Default bucket
      }
      
      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await db.uploadFile(file, bucket, filePath);
      
      if (uploadError) {
        console.error('File upload error:', uploadError);
        setErrors({ submit: `Failed to upload file: ${uploadError.message}` });
        return;
      }
      
      // Get the public URL
      const fileUrl = uploadData.publicUrl;
      
      // Store file reference
      if (type === 'resume') {
        setResumeFile(file);
        handleInputChange('resume_url', fileUrl);
      } else if (type === 'cover_letter') {
        setCoverLetterFile(file);
        handleInputChange('cover_letter_url', fileUrl);
      } else if (type === 'portfolio') {
        setPortfolioFile(file);
        handleInputChange('portfolio_url', fileUrl);
      } else if (type === 'profile_picture') {
        setProfilePictureFile(file);
        handleInputChange('profile_picture_url', fileUrl);
      }
      
      console.log(`File uploaded successfully: ${fileName}`, { fileUrl, bucket });
      
      // Show success message
      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('File upload error:', error);
      setErrors({ submit: 'Failed to upload file. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileRemove = async (type) => {
    try {
      // Get current file URL from form data
      let currentFileUrl;
      if (type === 'resume') {
        currentFileUrl = formData.resume_url;
      } else if (type === 'cover_letter') {
        currentFileUrl = formData.cover_letter_url;
      } else if (type === 'portfolio') {
        currentFileUrl = formData.portfolio_url;
      }

      if (currentFileUrl) {
        // Extract file path from URL
        const urlParts = currentFileUrl.split('/');
        const bucket = urlParts[3]; // Extract bucket name from URL
        const filePath = urlParts.slice(4).join('/'); // Extract file path
        
        // Delete file from storage
        const { error: deleteError } = await db.deleteFile(bucket, filePath);
        if (deleteError) {
          console.error('File deletion error:', deleteError);
        }
      }

      // Clear file state and form data
      if (type === 'resume') {
        setResumeFile(null);
        handleInputChange('resume_url', '');
      } else if (type === 'cover_letter') {
        setCoverLetterFile(null);
        handleInputChange('cover_letter_url', '');
      } else if (type === 'portfolio') {
        setPortfolioFile(null);
        handleInputChange('portfolio_url', '');
      } else if (type === 'profile_picture') {
        setProfilePictureFile(null);
        handleInputChange('profile_picture_url', '');
      }
      
    } catch (error) {
      console.error('File removal error:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (formData.website_url && !/^https?:\/\/.+/.test(formData.website_url)) {
      newErrors.website_url = 'Please enter a valid URL';
    }
    
    if (formData.linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(formData.linkedin_url)) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }
    
    if (formData.github_url && !/^https?:\/\/(www\.)?github\.com\/.+/.test(formData.github_url)) {
      newErrors.github_url = 'Please enter a valid GitHub URL';
    }
    
    if (formData.portfolio_url && !/^https?:\/\/.+/.test(formData.portfolio_url)) {
      newErrors.portfolio_url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Clean up form data before sending to database
      const cleanedFormData = { ...formData };
      
      // Convert empty strings to null for integer fields
      const integerFields = ['years_experience', 'expected_salary_min', 'expected_salary_max'];
      integerFields.forEach(field => {
        if (cleanedFormData[field] === '' || cleanedFormData[field] === undefined) {
          cleanedFormData[field] = null;
        } else if (typeof cleanedFormData[field] === 'string') {
          cleanedFormData[field] = parseInt(cleanedFormData[field]) || null;
        }
      });
      
      // Convert empty strings to null for text fields
      const textFields = ['full_name', 'location', 'phone', 'bio', 'current_job_title', 'company_name', 'industry'];
      textFields.forEach(field => {
        if (cleanedFormData[field] === '') {
          cleanedFormData[field] = null;
        }
      });
      
      const { error } = await updateProfile(cleanedFormData);
      
      if (error) {
        setErrors({ submit: error.message });
        return;
      }
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete:\\n\\n• Your profile and personal information\\n• All job applications\\n• Saved jobs\\n• Account history\\n\\nYou will be logged out immediately and unable to login with this account again.'
    );
    
    if (confirmDelete) {
      const finalConfirm = window.prompt('Type "DELETE" to permanently delete your account:');
      if (finalConfirm === 'DELETE') {
        setIsLoading(true);
        try {
          const { data, error } = await deleteAccount();
          if (error) {
            console.error('Account deletion error:', error);
            alert(`Failed to delete account: ${error.message || 'Please try again or contact support.'}`);
          } else {
            alert('Your account has been permanently deleted. You have been logged out.');
            // Navigate to home page - user should be logged out
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Account deletion error:', error);
          alert(`Failed to delete account: ${error.message || 'Please try again or contact support.'}`);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="User" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary mb-6">Please log in to view your profile.</p>
            <Button
              variant="default"
              onClick={() => navigate('/login')}
              iconName="LogIn"
              iconPosition="left"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="bg-card border border-border rounded-lg shadow-card">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
              <p className="text-text-secondary mt-1">
                Manage your account information and preferences
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Tab Navigation */}
              <div className="border-b border-border mb-6">
                <nav className="flex space-x-8">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                        ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                        }
                      `}
                    >
                      <Icon name={tab.icon} size={16} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
                  
                  {/* Profile Picture Section */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Picture</h3>
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 rounded-full bg-background border-2 border-border flex items-center justify-center overflow-hidden">
                        {formData.profile_picture_url ? (
                          <img 
                            src={formData.profile_picture_url} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="User" size={32} className="text-text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <FileUpload
                          label="Upload Profile Picture"
                          acceptedFileTypes=".jpg,.jpeg,.png,.gif,.webp,.svg"
                          maxFileSize={5 * 1024 * 1024}
                          onFileSelect={(file) => handleFileUpload(file, 'profile_picture')}
                          currentFile={profilePictureFile}
                          helperText="Upload a profile picture (JPG, PNG, GIF, WebP, SVG - max 5MB)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      error={errors.full_name}
                      required
                    />
                    
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Location"
                      type="text"
                      placeholder="City, State or Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                    
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                    
                    <Select
                      label="Gender"
                      placeholder="Select gender"
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                      ]}
                      value={formData.gender}
                      onChange={(value) => handleInputChange('gender', value)}
                    />
                  </div>
                  
                  <Input
                    label="Nationality"
                    type="text"
                    placeholder="Your nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                  
                  <Input
                    label="Bio"
                    type="textarea"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Professional Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Current Job Title"
                        type="text"
                        placeholder="Your current position"
                        value={formData.current_job_title}
                        onChange={(e) => handleInputChange('current_job_title', e.target.value)}
                      />
                      
                      <Input
                        label="Company Name"
                        type="text"
                        placeholder="Your current company"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Industry"
                        placeholder="Select your industry"
                        options={industries}
                        value={formData.industry}
                        onChange={(value) => handleInputChange('industry', value)}
                      />
                      
                      <Select
                        label="Years of Experience"
                        placeholder="Select experience level"
                        options={experienceLevels}
                        value={formData.years_experience}
                        onChange={(value) => handleInputChange('years_experience', value)}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-text-primary">Social Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Website URL"
                          type="url"
                          placeholder="https://your-website.com"
                          value={formData.website_url}
                          onChange={(e) => handleInputChange('website_url', e.target.value)}
                          error={errors.website_url}
                        />
                        
                        <Input
                          label="LinkedIn URL"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          error={errors.linkedin_url}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="GitHub URL"
                          type="url"
                          placeholder="https://github.com/yourusername"
                          value={formData.github_url}
                          onChange={(e) => handleInputChange('github_url', e.target.value)}
                          error={errors.github_url}
                        />
                        
                        <div className="space-y-4">
                          <Input
                            label="Portfolio URL"
                            type="url"
                            placeholder="https://your-portfolio.com"
                            value={formData.portfolio_url}
                            onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                            error={errors.portfolio_url}
                          />
                          
                          <div className="text-sm text-text-secondary">
                            <p className="mb-2">Or upload portfolio files:</p>
                            <FileUpload
                              label="Portfolio Files"
                              description="Upload your portfolio files (PDF, images, ZIP)"
                              acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.gif,.zip"
                              currentFile={portfolioFile}
                              onFileSelect={(file) => file ? handleFileUpload(file, 'portfolio') : handleFileRemove('portfolio')}
                              maxFileSize={50 * 1024 * 1024} // 50MB
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills & Education Tab */}
              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Skills & Qualifications</h3>
                    
                    {/* Skills Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-text-primary">Technical Skills</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('skills', { name: '', proficiency: 'intermediate', yearsExperience: 1 })}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Add Skill
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Input
                              placeholder="e.g., JavaScript, React, Python"
                              value={skill.name}
                              onChange={(e) => updateArrayItem('skills', index, { ...skill, name: e.target.value })}
                              className="flex-1"
                            />
                            <Select
                              placeholder="Proficiency"
                              options={[
                                { value: 'beginner', label: 'Beginner' },
                                { value: 'intermediate', label: 'Intermediate' },
                                { value: 'advanced', label: 'Advanced' },
                                { value: 'expert', label: 'Expert' }
                              ]}
                              value={skill.proficiency}
                              onChange={(value) => updateArrayItem('skills', index, { ...skill, proficiency: value })}
                              className="w-32"
                            />
                            <Input
                              type="number"
                              placeholder="Years"
                              value={skill.yearsExperience}
                              onChange={(e) => updateArrayItem('skills', index, { ...skill, yearsExperience: parseInt(e.target.value) })}
                              className="w-20"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem('skills', index)}
                              iconName="Trash2"
                              className="text-error hover:text-error"
                            />
                          </div>
                        ))}
                        
                        {formData.skills.length === 0 && (
                          <p className="text-text-secondary text-sm">No skills added yet. Click "Add Skill" to get started.</p>
                        )}
                      </div>
                    </div>

                    {/* Languages Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-text-primary">Languages</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('languages', { name: '', proficiency: 'conversational' })}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Add Language
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.languages.map((language, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Input
                              placeholder="e.g., English, Spanish, French"
                              value={language.name}
                              onChange={(e) => updateArrayItem('languages', index, { ...language, name: e.target.value })}
                              className="flex-1"
                            />
                            <Select
                              placeholder="Proficiency"
                              options={[
                                { value: 'basic', label: 'Basic' },
                                { value: 'conversational', label: 'Conversational' },
                                { value: 'fluent', label: 'Fluent' },
                                { value: 'native', label: 'Native' }
                              ]}
                              value={language.proficiency}
                              onChange={(value) => updateArrayItem('languages', index, { ...language, proficiency: value })}
                              className="w-36"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem('languages', index)}
                              iconName="Trash2"
                              className="text-error hover:text-error"
                            />
                          </div>
                        ))}
                        
                        {formData.languages.length === 0 && (
                          <p className="text-text-secondary text-sm">No languages added yet. Click "Add Language" to get started.</p>
                        )}
                      </div>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-text-primary">Education</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('education', { 
                            institution: '', 
                            degree: '', 
                            field: '', 
                            startDate: '', 
                            endDate: '', 
                            gpa: '',
                            description: '' 
                          })}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Add Education
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {formData.education.map((edu, index) => (
                          <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Institution"
                                placeholder="University/School name"
                                value={edu.institution}
                                onChange={(e) => updateArrayItem('education', index, { ...edu, institution: e.target.value })}
                              />
                              <Input
                                label="Degree"
                                placeholder="e.g., Bachelor of Science"
                                value={edu.degree}
                                onChange={(e) => updateArrayItem('education', index, { ...edu, degree: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Field of Study"
                                placeholder="e.g., Computer Science"
                                value={edu.field}
                                onChange={(e) => updateArrayItem('education', index, { ...edu, field: e.target.value })}
                              />
                              <Input
                                label="GPA (optional)"
                                placeholder="e.g., 3.8"
                                value={edu.gpa}
                                onChange={(e) => updateArrayItem('education', index, { ...edu, gpa: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Start Date"
                                type="date"
                                value={edu.startDate}
                                onChange={(e) => updateArrayItem('education', index, { ...edu, startDate: e.target.value })}
                              />
                              <Input
                                label="End Date"
                                type="date"
                                value={edu.endDate}
                                onChange={(e) => updateArrayItem('education', index, { ...edu, endDate: e.target.value })}
                              />
                            </div>
                            
                            <Input
                              label="Description (optional)"
                              type="textarea"
                              placeholder="Relevant coursework, achievements, etc."
                              value={edu.description}
                              onChange={(e) => updateArrayItem('education', index, { ...edu, description: e.target.value })}
                              rows={2}
                            />
                            
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItem('education', index)}
                                iconName="Trash2"
                                iconPosition="left"
                                className="text-error hover:text-error"
                              >
                                Remove Education
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {formData.education.length === 0 && (
                          <p className="text-text-secondary text-sm">No education records added yet. Click "Add Education" to get started.</p>
                        )}
                      </div>
                    </div>

                    {/* Certifications Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-text-primary">Certifications</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('certifications', { 
                            name: '', 
                            issuer: '', 
                            issueDate: '', 
                            expiryDate: '', 
                            credentialId: '',
                            url: '' 
                          })}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Add Certification
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {formData.certifications.map((cert, index) => (
                          <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Certification Name"
                                placeholder="e.g., AWS Certified Solutions Architect"
                                value={cert.name}
                                onChange={(e) => updateArrayItem('certifications', index, { ...cert, name: e.target.value })}
                              />
                              <Input
                                label="Issuing Organization"
                                placeholder="e.g., Amazon Web Services"
                                value={cert.issuer}
                                onChange={(e) => updateArrayItem('certifications', index, { ...cert, issuer: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Issue Date"
                                type="date"
                                value={cert.issueDate}
                                onChange={(e) => updateArrayItem('certifications', index, { ...cert, issueDate: e.target.value })}
                              />
                              <Input
                                label="Expiry Date (optional)"
                                type="date"
                                value={cert.expiryDate}
                                onChange={(e) => updateArrayItem('certifications', index, { ...cert, expiryDate: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Credential ID (optional)"
                                placeholder="Certificate ID or number"
                                value={cert.credentialId}
                                onChange={(e) => updateArrayItem('certifications', index, { ...cert, credentialId: e.target.value })}
                              />
                              <Input
                                label="Verification URL (optional)"
                                type="url"
                                placeholder="https://..."
                                value={cert.url}
                                onChange={(e) => updateArrayItem('certifications', index, { ...cert, url: e.target.value })}
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItem('certifications', index)}
                                iconName="Trash2"
                                iconPosition="left"
                                className="text-error hover:text-error"
                              >
                                Remove Certification
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {formData.certifications.length === 0 && (
                          <p className="text-text-secondary text-sm">No certifications added yet. Click "Add Certification" to get started.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-text-primary">Work Experience</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('work_experience', { 
                          company: '', 
                          position: '', 
                          startDate: '', 
                          endDate: '', 
                          current: false,
                          location: '',
                          description: '',
                          achievements: []
                        })}
                        iconName="Plus"
                        iconPosition="left"
                      >
                        Add Experience
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {formData.work_experience.map((exp, index) => (
                        <div key={index} className="p-6 border border-border rounded-lg space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Company"
                              placeholder="e.g., Google Inc."
                              value={exp.company}
                              onChange={(e) => updateArrayItem('work_experience', index, { ...exp, company: e.target.value })}
                            />
                            <Input
                              label="Position"
                              placeholder="e.g., Senior Software Engineer"
                              value={exp.position}
                              onChange={(e) => updateArrayItem('work_experience', index, { ...exp, position: e.target.value })}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              label="Location"
                              placeholder="e.g., San Francisco, CA"
                              value={exp.location}
                              onChange={(e) => updateArrayItem('work_experience', index, { ...exp, location: e.target.value })}
                            />
                            <Input
                              label="Start Date"
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => updateArrayItem('work_experience', index, { ...exp, startDate: e.target.value })}
                            />
                            <div className="space-y-2">
                              <Input
                                label="End Date"
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => updateArrayItem('work_experience', index, { ...exp, endDate: e.target.value })}
                                disabled={exp.current}
                              />
                              <Checkbox
                                label="Currently working here"
                                checked={exp.current}
                                onChange={(checked) => updateArrayItem('work_experience', index, { ...exp, current: checked, endDate: checked ? '' : exp.endDate })}
                              />
                            </div>
                          </div>
                          
                          <Input
                            label="Job Description"
                            type="textarea"
                            placeholder="Describe your role and responsibilities..."
                            value={exp.description}
                            onChange={(e) => updateArrayItem('work_experience', index, { ...exp, description: e.target.value })}
                            rows={4}
                          />
                          
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem('work_experience', index)}
                              iconName="Trash2"
                              iconPosition="left"
                              className="text-error hover:text-error"
                            >
                              Remove Experience
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {formData.work_experience.length === 0 && (
                        <div className="text-center py-8">
                          <Icon name="Briefcase" size={48} className="mx-auto text-text-secondary mb-4" />
                          <h4 className="text-lg font-medium text-text-primary mb-2">No work experience added yet</h4>
                          <p className="text-text-secondary mb-4">Add your work experience to showcase your professional background</p>
                          <Button
                            type="button"
                            variant="default"
                            onClick={() => addArrayItem('work_experience', { 
                              company: '', 
                              position: '', 
                              startDate: '', 
                              endDate: '', 
                              current: false,
                              location: '',
                              description: '',
                              achievements: []
                            })}
                            iconName="Plus"
                            iconPosition="left"
                          >
                            Add Your First Experience
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Documents & Files</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUpload
                        label="Resume/CV"
                        description="Upload your resume or CV (PDF, DOC, DOCX)"
                        acceptedFileTypes=".pdf,.doc,.docx"
                        currentFile={resumeFile}
                        onFileSelect={(file) => file ? handleFileUpload(file, 'resume') : handleFileRemove('resume')}
                        required
                      />
                      
                      <FileUpload
                        label="Cover Letter"
                        description="Upload your cover letter (PDF, DOC, DOCX)"
                        acceptedFileTypes=".pdf,.doc,.docx"
                        currentFile={coverLetterFile}
                        onFileSelect={(file) => file ? handleFileUpload(file, 'cover_letter') : handleFileRemove('cover_letter')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Job Preferences</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                          Employment Type Preferences
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {employmentTypes.map(type => (
                            <Checkbox
                              key={type.value}
                              label={type.label}
                              checked={formData.employment_type_preferences.includes(type.value)}
                              onChange={(checked) => handleEmploymentTypeChange(type.value, checked)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <Select
                        label="Remote Work Preference"
                        placeholder="Select remote work preference"
                        options={remotePreferences}
                        value={formData.remote_work_preference}
                        onChange={(value) => handleInputChange('remote_work_preference', value)}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Expected Salary (Min)"
                          type="number"
                          placeholder="50000"
                          value={formData.expected_salary_min}
                          onChange={(e) => handleInputChange('expected_salary_min', e.target.value)}
                        />
                        
                        <Input
                          label="Expected Salary (Max)"
                          type="number"
                          placeholder="80000"
                          value={formData.expected_salary_max}
                          onChange={(e) => handleInputChange('expected_salary_max', e.target.value)}
                        />
                        
                        <Select
                          label="Currency"
                          options={currencies}
                          value={formData.salary_currency}
                          onChange={(value) => handleInputChange('salary_currency', value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Availability"
                          type="text"
                          placeholder="e.g., Available immediately"
                          value={formData.availability}
                          onChange={(e) => handleInputChange('availability', e.target.value)}
                        />
                        
                        <Input
                          label="Notice Period"
                          type="text"
                          placeholder="e.g., 2 weeks, 1 month"
                          value={formData.notice_period}
                          onChange={(e) => handleInputChange('notice_period', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm text-success">{successMessage}</span>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">{errors.submit}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isLoading}
                  iconName="Save"
                  iconPosition="left"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Danger Zone - Delete Account */}
          <div className="bg-card border border-error rounded-lg shadow-card mt-8">
            <div className="p-6 border-b border-error">
              <h2 className="text-xl font-bold text-error">Danger Zone</h2>
              <p className="text-text-secondary mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-medium text-text-primary mb-1">Delete Account</h3>
                  <p className="text-text-secondary text-sm">
                    Permanently delete your account, profile, and all associated data including job applications and saved jobs.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  iconName="Trash2"
                  iconPosition="left"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;