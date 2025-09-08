import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('JobApplicants - All URL params:', useParams());
  console.log('JobApplicants - jobId extracted:', jobId);
  console.log('JobApplicants - current URL:', window.location.pathname);
  const { user, userProfile } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'applied', label: 'New Applications' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer Extended' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' }
  ];

  useEffect(() => {
    loadJobAndApplicants();
  }, [jobId]);

  const loadJobAndApplicants = async () => {
    try {
      setIsLoading(true);
      
      // Validate jobId first
      if (!jobId || jobId === 'undefined' || jobId === 'null') {
        console.error('Invalid job ID:', jobId);
        navigate('/employer-dashboard');
        return;
      }
      
      // Load job details
      const { data: jobData, error: jobError } = await db.getJobById(jobId);
      if (jobError) {
        console.error('Error loading job:', jobError);
        if (jobError.message === 'Invalid job ID provided') {
          navigate('/employer-dashboard');
        }
        return;
      }
      setJob(jobData);

      // Load applicants
      const { data: applicantsData, error: applicantsError } = await db.getJobApplications(jobId);
      if (applicantsError) {
        console.error('Error loading applicants:', applicantsError);
        return;
      }
      setApplicants(applicantsData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const { error } = await db.updateApplicationStatus(applicationId, newStatus);
      if (error) {
        console.error('Error updating status:', error);
        return;
      }
      
      // Update local state
      setApplicants(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-error/10 text-error';
      default: return 'bg-muted text-text-secondary';
    }
  };

  const filteredAndSortedApplicants = applicants
    .filter(app => selectedStatus === 'all' || app.status === selectedStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        default:
          return 0;
      }
    });

  if (!user || userProfile?.role !== 'employer') {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Shield" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary">Only employers can view job applicants.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader" size={48} className="mx-auto text-text-secondary mb-4 animate-spin" />
            <p className="text-text-secondary">Loading applicants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs 
            items={[
              { label: 'Dashboard', href: '/employer-dashboard' },
              { label: job?.title || 'Job Details', href: `/job-details/${jobId}` },
              { label: 'Applicants', href: '#' }
            ]} 
          />
          
          <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">{job?.title}</h1>
                  <p className="text-text-secondary mt-1">
                    {job?.location} • {applicants.length} applications
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/job-details/${jobId}`)}
                  iconName="Eye"
                  iconPosition="left"
                >
                  View Job Details
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Applicants List */}
            <div className="divide-y divide-border">
              {filteredAndSortedApplicants.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon name="Users" size={48} className="mx-auto text-text-secondary mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No applicants found</h3>
                  <p className="text-text-secondary">
                    {selectedStatus === 'all' 
                      ? 'No one has applied to this job yet.' 
                      : `No applicants with status "${statusOptions.find(s => s.value === selectedStatus)?.label}".`
                    }
                  </p>
                </div>
              ) : (
                filteredAndSortedApplicants.map((applicant) => (
                  <div key={applicant.id} className="p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {applicant.full_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                            {applicant.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                          <span className="flex items-center space-x-1">
                            <Icon name="Mail" size={14} />
                            <span>{applicant.email}</span>
                          </span>
                          {applicant.phone && (
                            <span className="flex items-center space-x-1">
                              <Icon name="Phone" size={14} />
                              <span>{applicant.phone}</span>
                            </span>
                          )}
                          {applicant.location && (
                            <span className="flex items-center space-x-1">
                              <Icon name="MapPin" size={14} />
                              <span>{applicant.location}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">
                          Applied {new Date(applicant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                          className="px-3 py-1 text-sm border border-border rounded bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {statusOptions.slice(1).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/application-details/${applicant.id}`)}
                          iconName="Eye"
                          iconPosition="left"
                        >
                          View Application
                        </Button>
                      </div>
                    </div>
                    {applicant.cover_letter && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-text-primary line-clamp-3">
                          {applicant.cover_letter}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicants;
