import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useSavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setSavedJobs([]);
      setSavedJobIds(new Set());
      setIsLoading(false);
      return;
    }

    const fetchSavedJobs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await db.getSavedJobs(user.id);
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Transform data to match component expectations
        const transformedJobs = data?.map(item => ({
          id: item.id,
          job_id: item.job_id,
          title: item.jobs?.title,
          company: item.jobs?.companies?.name,
          location: item.jobs?.location,
          salary: item.jobs?.salary_min && item.jobs?.salary_max 
            ? `$${item.jobs.salary_min.toLocaleString()} - $${item.jobs.salary_max.toLocaleString()}`
            : 'Not specified',
          type: item.jobs?.job_type,
          postedDate: item.jobs?.created_at,
          savedDate: item.created_at
        })) || [];
        
        setSavedJobs(transformedJobs);
        setSavedJobIds(new Set(data?.map(item => item.job_id) || []));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching saved jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs().catch(err => {
      console.error('Unhandled error in fetchSavedJobs:', err);
      setError(err.message || 'Failed to fetch saved jobs');
      setIsLoading(false);
    });
  }, [user]);

  const saveJob = async (jobId) => {
    try {
      const { data, error } = await db.saveJob(user.id, jobId);
      
      if (error) throw error;
      
      // Update local state
      setSavedJobIds(prev => new Set([...prev, jobId]));
      
      return { data, error: null };
    } catch (err) {
      console.error('Error saving job:', err);
      return { data: null, error: err };
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      const { error } = await db.unsaveJob(user.id, jobId);
      
      if (error) throw error;
      
      // Update local state
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      setSavedJobs(prev => prev.filter(item => item.job_id !== jobId));
      
      return { error: null };
    } catch (err) {
      console.error('Error unsaving job:', err);
      return { error: err };
    }
  };

  const toggleSaveJob = async (jobId) => {
    if (savedJobIds.has(jobId)) {
      return await unsaveJob(jobId);
    } else {
      return await saveJob(jobId);
    }
  };

  const checkJobSaved = async (jobId) => {
    try {
      const { data } = await db.checkJobSaved(user.id, jobId);
      return data;
    } catch (err) {
      console.error('Error checking saved job:', err);
      return false;
    }
  };

  return {
    savedJobs,
    savedJobIds,
    isLoading,
    error,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    checkJobSaved
  };
};