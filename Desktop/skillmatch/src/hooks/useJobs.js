import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';

export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await db.getJobs(filters);
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Transform data to match component expectations
        const transformedJobs = data && Array.isArray(data) ? data.map(job => ({
          ...job,
          company: {
            name: job.companies?.name,
            logo: job.companies?.logo_url,
            industry: job.companies?.industry,
            size: job.companies?.size,
            description: job.companies?.description
          },
          requiredSkills: Array.isArray(job.skills_required) ? job.skills_required : [],
          skills: Array.isArray(job.skills_required) ? job.skills_required : [], // Keep both for backward compatibility
          salaryRange: {
            min: job.salary_min,
            max: job.salary_max
          },
          type: job.job_type,
          experienceLevel: job.experience_level,
          remote: job.is_remote,
          postedDate: job.created_at,
          applicantCount: job.application_count || 0,
          viewCount: job.view_count || 0
        })) : [];
        
        setJobs(transformedJobs);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs().catch(err => {
      console.error('Unhandled error in fetchJobs:', err);
      setError(err.message || 'Failed to fetch jobs');
      setIsLoading(false);
    });
  }, [JSON.stringify(filters)]);

  const refetch = () => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await db.getJobs(filters);
        
        if (fetchError) {
          throw fetchError;
        }
        
        const transformedJobs = data && Array.isArray(data) ? data.map(job => ({
          ...job,
          company: {
            name: job.companies?.name,
            logo: job.companies?.logo_url,
            industry: job.companies?.industry,
            size: job.companies?.size,
            description: job.companies?.description
          },
          skills: Array.isArray(job.skills) ? job.skills : [],
          salaryRange: {
            min: job.salary_min,
            max: job.salary_max
          },
          type: job.job_type,
          experienceLevel: job.experience_level,
          remote: job.is_remote,
          postedDate: job.created_at,
          applicantCount: job.application_count || 0,
          viewCount: job.view_count || 0
        })) : [];
        
        setJobs(transformedJobs);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs().catch(err => {
      console.error('Unhandled error in refetch:', err);
      setError(err.message || 'Failed to refetch jobs');
      setIsLoading(false);
    });
  };

  return { jobs, isLoading, error, refetch };
};

export const useJob = (jobId) => {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await db.getJobById(jobId);
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Transform data to match component expectations
        const transformedJob = {
          ...data,
          company: {
            name: data.companies?.name,
            logo: data.companies?.logo_url,
            industry: data.companies?.industry,
            size: data.companies?.size,
            description: data.companies?.description,
            website: data.companies?.website,
            founded: data.companies?.founded,
            headquarters: data.companies?.headquarters
          },
          requiredSkills: Array.isArray(data.skills_required) ? data.skills_required : [],
          preferredSkills: Array.isArray(data.preferredSkills) ? data.preferredSkills : [],
          salaryRange: {
            min: data.salary_min,
            max: data.salary_max
          },
          type: data.job_type,
          experienceLevel: data.experience_level,
          remote: data.is_remote,
          postedDate: data.created_at,
          applicantCount: data.application_count || 0,
          viewCount: data.view_count || 0,
          applicationDeadline: data.application_deadline
        };
        
        setJob(transformedJob);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching job:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob().catch(err => {
      console.error('Unhandled error in fetchJob:', err);
      setError(err.message || 'Failed to fetch job');
      setIsLoading(false);
    });
  }, [jobId]);

  return { job, isLoading, error };
};