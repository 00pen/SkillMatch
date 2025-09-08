import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fallback to regular getUserApplications if enhanced function fails
        let data, fetchError;
        try {
          const result = await db.getUserApplicationsWithDetails(user.id);
          data = result.data;
          fetchError = result.error;
        } catch (enhancedError) {
          console.warn('Enhanced function failed, falling back to regular getUserApplications:', enhancedError);
          const result = await db.getUserApplications(user.id);
          data = result.data;
          fetchError = result.error;
        }
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Transform data to match component expectations
        const transformedApplications = data?.map(app => ({
          id: app.id,
          jobId: app.job_id,
          jobTitle: app.job_title || app.jobs?.title || 'Unknown Position',
          company: app.company_name || app.jobs?.companies?.name || 'Unknown Company',
          location: app.job_location || app.jobs?.location || 'Not specified',
          positionType: app.job_type || app.jobs?.job_type || 'Not specified',
          status: app.status,
          appliedDate: app.created_at,
          lastUpdated: app.updated_at,
          salary: (app.salary_min && app.salary_max) || (app.jobs?.salary_min && app.jobs?.salary_max)
            ? `$${(app.salary_min || app.jobs?.salary_min).toLocaleString()} - $${(app.salary_max || app.jobs?.salary_max).toLocaleString()}`
            : 'Not specified',
          coverLetter: app.cover_letter,
          resumeUrl: app.resume_url,
          portfolioUrl: app.portfolio_url,
          salaryExpectation: app.salary_expectation,
          availableStartDate: app.available_start_date,
          notes: app.notes,
          messages: Array.isArray(app.messages) ? app.messages : [],
          interviews: Array.isArray(app.interviews) ? app.interviews : [],
          messageCount: Array.isArray(app.messages) ? app.messages.length : 0,
          hasUnreadMessages: Array.isArray(app.messages) ? app.messages.some(msg => !msg.read_by_candidate) : false
        })) || [];
        
        setApplications(transformedApplications);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications().catch(err => {
      console.error('Unhandled error in fetchApplications:', err);
      setError(err.message || 'Failed to fetch applications');
      setIsLoading(false);
    });
  }, [user]);

  const createApplication = async (applicationData) => {
    try {
      const { data, error } = await db.createApplication({
        ...applicationData,
        user_id: user.id
      });
      
      if (error) throw error;
      
      // Transform and add to local state
      const transformedApp = {
        id: data.id,
        jobId: data.job_id,
        jobTitle: data.jobs?.title,
        company: data.jobs?.companies?.name,
        location: data.jobs?.location,
        positionType: data.jobs?.job_type,
        status: data.status,
        appliedDate: data.created_at,
        lastUpdated: data.updated_at,
        salary: data.jobs?.salary_min && data.jobs?.salary_max 
          ? `$${data.jobs.salary_min.toLocaleString()} - $${data.jobs.salary_max.toLocaleString()}`
          : 'Not specified',
        coverLetter: data.cover_letter,
        resumeUrl: data.resume_url,
        portfolioUrl: data.portfolio_url,
        salaryExpectation: data.salary_expectation,
        availableStartDate: data.available_start_date,
        notes: data.notes
      };
      
      setApplications(prev => [transformedApp, ...prev]);
      
      return { data: transformedApp, error: null };
    } catch (err) {
      console.error('Error creating application:', err);
      return { data: null, error: err };
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      // For job seekers, only allow withdrawal in early stages
      if (status === 'withdrawn') {
        const application = applications.find(app => app.id === applicationId);
        if (!['pending', 'reviewed'].includes(application?.status)) {
          throw new Error('You can only withdraw applications that are pending or under review.');
        }
      }
      
      const { data, error } = await db.updateApplicationStatus(applicationId, status);
      
      if (error) throw error;
      
      // Refresh applications to get updated data with messages
      await refreshApplications();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating application status:', err);
      return { data: null, error: err };
    }
  };

  // Function to refresh applications data
  const refreshApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error: fetchError } = await db.getUserApplications(user.id);
      
      if (fetchError) throw fetchError;
      
      const transformedApplications = data?.map(app => ({
        id: app.id,
        jobId: app.job_id,
        jobTitle: app.jobs?.title,
        company: app.jobs?.companies?.name,
        location: app.jobs?.location,
        positionType: app.jobs?.job_type,
        status: app.status,
        appliedDate: app.created_at,
        lastUpdated: app.updated_at,
        salary: app.jobs?.salary_min && app.jobs?.salary_max 
          ? `$${app.jobs.salary_min.toLocaleString()} - $${app.jobs.salary_max.toLocaleString()}`
          : 'Not specified',
        coverLetter: app.cover_letter,
        resumeUrl: app.resume_url,
        portfolioUrl: app.portfolio_url,
        salaryExpectation: app.salary_expectation,
        availableStartDate: app.available_start_date,
        notes: app.notes,
        messages: app.messages || [],
        interviews: app.interviews || [],
        messageCount: app.messages?.length || 0,
        hasUnreadMessages: app.messages?.some(msg => !msg.read_by_candidate) || false
      })) || [];
      
      setApplications(transformedApplications);
    } catch (err) {
      console.error('Error refreshing applications:', err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (applicationId) => {
    try {
      const { error } = await db.markApplicationMessagesAsRead(applicationId, user.id);
      if (error) throw error;
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? {
            ...app,
            hasUnreadMessages: false,
            messages: app.messages.map(msg => ({ ...msg, read_by_candidate: true }))
          } : app
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  return {
    applications,
    isLoading,
    error,
    createApplication,
    updateApplicationStatus,
    refreshApplications,
    markMessagesAsRead
  };
};