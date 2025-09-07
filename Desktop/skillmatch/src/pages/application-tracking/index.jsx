import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../../hooks/useApplications';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import Icon from '../../components/AppIcon';
import ApplicationMetrics from './components/ApplicationMetrics';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationTable from './components/ApplicationTable';

const ApplicationTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, isLoading, error, updateApplicationStatus } = useApplications();
  const [filteredApplications, setFilteredApplications] = useState([]);

  useEffect(() => {
    setFilteredApplications(applications);
  }, [applications]);
  
  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFilterChange = (filters) => {
    let filtered = [...applications];

    // Search query filter
    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter(app => 
        app?.jobTitle?.toLowerCase()?.includes(query) ||
        app?.company?.toLowerCase()?.includes(query) ||
        app?.industry?.toLowerCase()?.includes(query) ||
        app?.location?.toLowerCase()?.includes(query)
      );
    }

    // Status filter
    if (filters?.status) {
      filtered = filtered?.filter(app => app?.status === filters?.status);
    }

    // Company filter
    if (filters?.company) {
      filtered = filtered?.filter(app => app?.company === filters?.company);
    }

    // Position type filter
    if (filters?.positionType) {
      filtered = filtered?.filter(app => app?.positionType === filters?.positionType);
    }

    // Date range filter
    if (filters?.dateRange) {
      const days = parseInt(filters?.dateRange);
      const cutoffDate = new Date();
      cutoffDate?.setDate(cutoffDate?.getDate() - days);
      
      filtered = filtered?.filter(app => 
        new Date(app.appliedDate) >= cutoffDate
      );
    }

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleWithdrawApplication = (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      // In a real app, this would call an API to withdraw the application
      setFilteredApplications(filteredApplications?.filter(app => app?.id !== applicationId));
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      const { error } = await db.deleteApplication(applicationId, user.id);
      if (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application. Please try again.');
      } else {
        // Remove application from local state
        setFilteredApplications(filteredApplications?.filter(app => app?.id !== applicationId));
        alert('Application deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                <p className="text-text-secondary">Loading your applications...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Applications</h3>
              <p className="text-text-secondary mb-4">{error}</p>
              <Button variant="default" onClick={() => window.location.reload()} iconName="RefreshCw">
                Try Again
              </Button>
            </div>
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
        {/* Header */}
        <div className="mb-8">
          <NavigationBreadcrumbs />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Application Tracking</h1>
              <p className="mt-2 text-text-secondary">
                Monitor and manage all your job applications in one place
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/job-seeker-dashboard')}
                iconName="LayoutDashboard"
              >
                Dashboard
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/job-search-results')}
                iconName="Search"
              >
                Find Jobs
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <ApplicationMetrics applications={filteredApplications} />

        {/* Filters */}
        <ApplicationFilters 
          applications={applications}
          onFilterChange={handleFilterChange}
        />

        {/* Applications Table */}
        <ApplicationTable
          applications={filteredApplications}
          onStatusUpdate={handleStatusUpdate}
          onWithdraw={handleWithdrawApplication}
          onDelete={handleDeleteApplication}
        />

        {/* Quick Actions */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/job-search-results')}
              iconName="Search"
              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Browse More Jobs</div>
                <div className="text-sm text-text-secondary">Find new opportunities</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              iconName="User"
              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Update Profile</div>
                <div className="text-sm text-text-secondary">Improve your chances</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/job-seeker-dashboard')}
              iconName="BarChart3"
              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-text-secondary">Track your progress</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ApplicationTracking;