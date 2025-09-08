import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfile } = useAuth();
  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    founded: '',
    headquarters: '',
    website: '',
    logo_url: ''
  });
  const [existingCompanies, setExistingCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
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

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  useEffect(() => {
    loadExistingCompanies();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (companySearchTerm.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const { data, error } = await db.searchCompanies(companySearchTerm);
          if (!error && data) {
            setSearchResults(data);
            setShowSearchResults(true);
          }
        } catch (error) {
          console.error('Company search error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [companySearchTerm]);

  useEffect(() => {
    loadCurrentCompany();
  }, [userProfile]);

  const loadExistingCompanies = async () => {
    try {
      // Get companies created by this user
      const { data, error } = await db.getCompanyJobs(user.id);
      if (!error && data) {
        const companies = data.map(job => job.companies).filter(Boolean);
        const uniqueCompanies = companies.reduce((acc, company) => {
          if (!acc.find(c => c.id === company.id)) {
            acc.push(company);
          }
          return acc;
        }, []);
        setExistingCompanies(uniqueCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadCurrentCompany = async () => {
    if (userProfile?.company_id) {
      try {
        const { data, error } = await db.getCompanyById(userProfile.company_id);
        if (!error && data) {
          setCompanyData(data);
          setSelectedCompanyId(data.id);
        }
      } catch (error) {
        console.error('Error loading current company:', error);
      }
    } else if (userProfile?.company_name) {
      // Pre-fill with profile data if no company is associated
      setCompanyData(prev => ({
        ...prev,
        name: userProfile.company_name,
        industry: userProfile.industry || '',
        website: userProfile.website_url || ''
      }));
      setIsCreatingNew(true);
    }
  };

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCompanySearch = (value) => {
    setCompanySearchTerm(value);
    setIsCreatingNew(false);
    setSelectedCompanyId('');
  };

  const handleCompanySelect = (company) => {
    setSelectedCompanyId(company.id);
    setCompanySearchTerm(company.name);
    setShowSearchResults(false);
    setIsCreatingNew(false);
    
    // Auto-fill form with company data
    setCompanyData({
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      size: company.size || '',
      founded: company.founded ? company.founded.toString() : '',
      headquarters: company.headquarters || '',
      website: company.website || '',
      logo_url: company.logo_url || ''
    });
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedCompanyId('');
    setCompanySearchTerm('');
    setShowSearchResults(false);
    
    // Clear form for new company
    setCompanyData({
      name: '',
      description: '',
      industry: '',
      size: '',
      founded: '',
      headquarters: '',
      website: '',
      logo_url: ''
    });
  };

  const handleCompanySelection = async (companyId) => {
    if (companyId === 'new') {
      setIsCreatingNew(true);
      setSelectedCompanyId('');
      setCompanyData({
        name: userProfile?.company_name || '',
        description: '',
        industry: userProfile?.industry || '',
        size: '',
        founded: '',
        headquarters: '',
        website: userProfile?.website_url || '',
        logo_url: ''
      });
    } else {
      setIsCreatingNew(false);
      setSelectedCompanyId(companyId);
      
      try {
        const { data, error } = await db.getCompanyById(companyId);
        if (!error && data) {
          setCompanyData(data);
        }
      } catch (error) {
        console.error('Error loading selected company:', error);
      }
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    try {
      setIsLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `company_logo_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await db.uploadFile(file, 'company-logos', filePath);
      
      if (uploadError) {
        setErrors({ logo: `Failed to upload logo: ${uploadError.message}` });
        return;
      }
      
      setLogoFile(file);
      handleInputChange('logo_url', uploadData.publicUrl);
      setSuccessMessage('Logo uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Logo upload error:', error);
      setErrors({ logo: 'Failed to upload logo. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!companyData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!companyData.industry) {
      newErrors.industry = 'Industry is required';
    }
    
    if (companyData.website && !/^https?:\/\/.+/.test(companyData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    if (companyData.founded && (isNaN(companyData.founded) || companyData.founded < 1800 || companyData.founded > new Date().getFullYear())) {
      newErrors.founded = 'Please enter a valid founding year';
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
      let companyId = selectedCompanyId;
      
      if (isCreatingNew || !companyId) {
        // Create new company
        const { data: newCompany, error: createError } = await db.createCompany({
          ...companyData,
          created_by: user.id,
          founded: companyData.founded ? parseInt(companyData.founded) : null
        });
        
        if (createError) {
          setErrors({ submit: createError.message });
          return;
        }
        
        companyId = newCompany.id;
      } else {
        // Update existing company
        const { error: updateError } = await db.updateCompany(companyId, {
          ...companyData,
          founded: companyData.founded ? parseInt(companyData.founded) : null
        });
        
        if (updateError) {
          setErrors({ submit: updateError.message });
          return;
        }
      }
      
      // Update user profile with company association
      const { error: profileError } = await updateProfile({ 
        company_id: companyId,
        company_name: companyData.name,
        industry: companyData.industry,
        website_url: companyData.website
      });
      
      if (profileError) {
        setErrors({ submit: `Profile update failed: ${profileError.message}` });
        return;
      }
      
      setSuccessMessage('Company profile saved successfully!');
      setTimeout(() => {
        // Force a page reload to refresh the dashboard data
        window.location.href = '/employer-dashboard';
      }, 1500);
      
    } catch (error) {
      console.error('Company save error:', error);
      setErrors({ submit: 'Failed to save company profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || userProfile?.role !== 'employer') {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Building" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary mb-6">Only employers can manage company profiles.</p>
            <Button
              variant="default"
              onClick={() => navigate('/login')}
              iconName="LogIn"
              iconPosition="left"
            >
              Sign In as Employer
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
              <h1 className="text-2xl font-bold text-text-primary">Company Profile</h1>
              <p className="text-text-secondary mt-1">
                Manage your company information and branding
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Company Selection */}
              {existingCompanies.length > 0 && !userProfile?.company_id && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Company Selection
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={companySearchTerm}
                        onChange={(e) => handleCompanySearch(e.target.value)}
                        placeholder="Search for your company or type to create new..."
                        className="w-full"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Icon name="Loader" size={16} className="animate-spin text-text-secondary" />
                        </div>
                      )}
                      
                      {/* Search Results Dropdown */}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((company) => (
                            <button
                              key={company.id}
                              onClick={() => handleCompanySelect(company)}
                              className="w-full px-4 py-3 text-left hover:bg-muted/50 border-b border-border last:border-b-0 flex items-center space-x-3"
                            >
                              {company.logo_url ? (
                                <img 
                                  src={company.logo_url} 
                                  alt={company.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                  <Icon name="Building" size={16} className="text-primary" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-text-primary">{company.name}</p>
                                <p className="text-sm text-text-secondary">{company.industry}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Create New Option */}
                      {companySearchTerm && !selectedCompanyId && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                          <button
                            onClick={handleCreateNew}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center">
                              <Icon name="Plus" size={16} className="text-success" />
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">Create "{companySearchTerm}"</p>
                              <p className="text-sm text-text-secondary">Create a new company profile</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {selectedCompanyId && (
                      <div className="mt-2 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success" />
                        <span className="text-sm text-success font-medium">
                          Company selected - form auto-filled with existing data
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Company Information</h3>
                
                {/* Company Logo */}
                <div className="bg-muted/30 border border-border rounded-lg p-6">
                  <h4 className="text-md font-medium text-text-primary mb-4">Company Logo</h4>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-lg bg-background border-2 border-border flex items-center justify-center overflow-hidden">
                      {companyData.logo_url ? (
                        <img 
                          src={companyData.logo_url} 
                          alt="Company Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon name="Building" size={32} className="text-text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <FileUpload
                        label="Upload Company Logo"
                        acceptedFileTypes=".jpg,.jpeg,.png,.gif,.webp,.svg"
                        maxFileSize={5 * 1024 * 1024}
                        onFileSelect={handleLogoUpload}
                        currentFile={logoFile}
                        helperText="Upload a company logo (JPG, PNG, GIF, WebP, SVG - max 5MB)"
                      />
                      {errors.logo && (
                        <p className="text-sm text-error mt-1">{errors.logo}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    type="text"
                    placeholder="Enter company name"
                    value={companyData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />
                  
                  <Select
                    label="Industry"
                    placeholder="Select industry"
                    options={industries}
                    value={companyData.industry}
                    onChange={(value) => handleInputChange('industry', value)}
                    error={errors.industry}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Company Size"
                    placeholder="Select company size"
                    options={companySizes}
                    value={companyData.size}
                    onChange={(value) => handleInputChange('size', value)}
                  />
                  
                  <Input
                    label="Founded Year"
                    type="number"
                    placeholder="e.g., 2020"
                    value={companyData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    error={errors.founded}
                  />
                  
                  <Input
                    label="Website"
                    type="url"
                    placeholder="https://company.com"
                    value={companyData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    error={errors.website}
                  />
                </div>
                
                <Input
                  label="Headquarters"
                  type="text"
                  placeholder="City, State, Country"
                  value={companyData.headquarters}
                  onChange={(e) => handleInputChange('headquarters', e.target.value)}
                />
                
                <Input
                  label="Company Description"
                  type="textarea"
                  placeholder="Describe your company, mission, and culture..."
                  value={companyData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

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

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/employer-dashboard')}
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
                  {isLoading ? 'Saving...' : 'Save Company Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
