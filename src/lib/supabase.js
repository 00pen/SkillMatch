import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

console.log('Supabase Configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl?.substring(0, 20) + '...'
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
export default supabase;

// Auth helpers - Supabase only, no mock fallbacks
export const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    console.log('Attempting sign in with:', { email, passwordLength: password?.length });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('Sign in response:', { data: data?.user?.id, error });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers - Supabase only, no mock fallbacks
export const db = {
  // Users
  createUserProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ id: userId, ...profileData }])
      .select()
      .single();
    return { data, error };
  },

  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return { data: null, error };
      }

      // If profile exists, return it
      if (data) {
        return { data, error: null };
      }

      // Profile doesn't exist - check if the user's email was previously deleted
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error getting auth user:', authError);
        return { data: null, error: authError };
      }

      // Check if this email was previously deleted
      const { data: isDeleted, error: checkError } = await supabase.rpc('is_email_deleted', {
        p_email: user.email
      });
      
      if (checkError) {
        console.error('Email deletion check error:', checkError);
        return { data: null, error: checkError };
      }
      
      if (isDeleted) {
        // Sign out the user and return an error
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: new Error('This account was previously deleted and cannot be used. Please contact support if you need assistance.') 
        };
      }

      // Try to create a new profile, but handle race condition gracefully
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          email: user.email,
          full_name: '',
          role: 'job_seeker',
          profile_completion: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        // If duplicate key error, another process created the profile - fetch it
        if (createError.code === '23505') {
          console.log('Profile was created by another process, fetching existing profile');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (fetchError) {
            console.error('Error fetching existing profile after race condition:', fetchError);
            return { data: null, error: fetchError };
          }
          
          if (!existingProfile) {
            console.error('Profile still not found after race condition');
            return { data: null, error: new Error('Profile creation failed due to race condition') };
          }
          
          return { data: existingProfile, error: null };
        }
        
        console.error('Error creating user profile:', createError);
        return { data: null, error: createError };
      }

      return { data: newProfile, error: null };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { data: null, error };
    }
  },

  updateUserProfile: async (userId, updates) => {
    try {
      // Prepare updates with proper defaults for JSONB fields
      const profileUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Handle integer fields - convert empty strings to null
      if (updates.years_experience !== undefined) {
        profileUpdates.years_experience = updates.years_experience === '' ? null : parseInt(updates.years_experience) || null;
      }
      if (updates.expected_salary_min !== undefined) {
        profileUpdates.expected_salary_min = updates.expected_salary_min === '' ? null : parseInt(updates.expected_salary_min) || null;
      }
      if (updates.expected_salary_max !== undefined) {
        profileUpdates.expected_salary_max = updates.expected_salary_max === '' ? null : parseInt(updates.expected_salary_max) || null;
      }
      
      // Ensure JSONB fields have proper format
      if (updates.certifications !== undefined) {
        profileUpdates.certifications = Array.isArray(updates.certifications) 
          ? updates.certifications 
          : [];
      }
      if (updates.education !== undefined) {
        profileUpdates.education = Array.isArray(updates.education) 
          ? updates.education 
          : [];
      }
      if (updates.work_experience !== undefined) {
        profileUpdates.work_experience = Array.isArray(updates.work_experience) 
          ? updates.work_experience 
          : [];
      }
      if (updates.skills !== undefined) {
        profileUpdates.skills = Array.isArray(updates.skills) 
          ? updates.skills 
          : [];
      }
      if (updates.portfolio_files !== undefined) {
        profileUpdates.portfolio_files = Array.isArray(updates.portfolio_files) 
          ? updates.portfolio_files 
          : [];
      }
      if (updates.employment_type_preferences !== undefined) {
        profileUpdates.employment_type_preferences = Array.isArray(updates.employment_type_preferences) 
          ? updates.employment_type_preferences 
          : [];
      }
      if (updates.languages !== undefined) {
        profileUpdates.languages = Array.isArray(updates.languages) 
          ? updates.languages 
          : [];
      }
      
      // Handle text fields - convert empty strings to null
      const textFields = ['full_name', 'location', 'phone', 'bio', 'current_job_title', 'company_name', 'industry'];
      textFields.forEach(field => {
        if (updates[field] !== undefined) {
          profileUpdates[field] = updates[field] === '' ? null : updates[field];
        }
      });
      
      // First, check if profile exists, if not create it
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{ id: userId, ...profileUpdates }])
          .select()
          .single();
        return { data, error };
      } else {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId)
          .select()
          .single();
        return { data, error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  },

  deleteUserAccount: async (userId) => {
    try {
      // First try to use the database function
      const { data, error } = await supabase.rpc('delete_user_account', {
        p_user_id: userId
      });
      
      if (error) {
        // If the function doesn't exist or fails, fall back to manual deletion
        console.warn('Database function failed, falling back to manual deletion:', error);
        
        // Manual cleanup - delete all user data
        const deletions = [
          supabase.from('saved_jobs').delete().eq('user_id', userId),
          supabase.from('applications').delete().eq('user_id', userId),
          supabase.from('messages').delete().or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
          supabase.from('conversations').delete().or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`),
          supabase.from('user_profiles').delete().eq('id', userId)
        ];
        
        // Execute all deletions
        const results = await Promise.allSettled(deletions);
        const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);
        
        if (errors.length > 0) {
          console.error('Some deletions failed:', errors);
          return { error: errors[0] };
        }
        
        // Sign out the user after successful deletion
        await supabase.auth.signOut();
        return { 
          data: { 
            success: true, 
            message: 'Account data deleted successfully. You have been signed out.' 
          }, 
          error: null 
        };
      }
      
      // Check if the database function returned success
      if (data && data.success) {
        // Sign out the user after successful deletion
        await supabase.auth.signOut();
        return { 
          data: { 
            success: true, 
            message: data.message || 'Account data deleted successfully. You have been signed out.' 
          }, 
          error: null 
        };
      } else {
        return { error: new Error(data?.message || 'Account deletion failed') };
      }
    } catch (err) {
      console.error('Account deletion failed:', err);
      return { error: err };
    }
  },

  // Jobs
  getJobs: async (filters = {}) => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry,
          size,
          description
        )
      `)
      .eq('status', 'active');

    if (filters.keywords) {
      query = query.or(`title.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.jobTypes?.length > 0) {
      query = query.in('job_type', filters.jobTypes);
    }
    if (filters.experienceLevel) {
      query = query.eq('experience_level', filters.experienceLevel);
    }
    if (filters.remoteOnly) {
      query = query.eq('is_remote', true);
    }
    if (filters.salaryMin) {
      query = query.gte('salary_min', filters.salaryMin);
    }
    if (filters.salaryMax) {
      query = query.lte('salary_max', filters.salaryMax);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    // Transform data to include skills from skills_required array
    const transformedData = data?.map(job => ({
      ...job,
      skills: job.skills_required || []
    })) || [];
    
    return { data: transformedData, error };
  },

  getJobById: async (jobId) => {
    if (!jobId || jobId === 'undefined') {
      return { data: null, error: { message: 'Invalid job ID provided' } };
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry,
          size,
          description,
          website,
          founded,
          headquarters
        )
      `)
      .eq('id', jobId)
      .maybeSingle();
      
    if (error) {
      return { data: null, error };
    }
    
    if (!data) {
      return { data: null, error: { message: 'Job not found' } };
    }
    
    // Transform data to include skills from skills_required array
    const transformedData = {
      ...data,
      requiredSkills: data.skills_required || [],
      preferredSkills: []
    };
    
    return { data: transformedData, error: null };
  },

  createJob: async (jobData) => {
    // Clean the job data to prevent circular references
    const cleanJobData = {
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      job_type: jobData.job_type,
      experience_level: jobData.experience_level,
      salary_min: jobData.salary_min,
      salary_max: jobData.salary_max,
      salary_currency: jobData.salary_currency,
      is_remote: jobData.is_remote,
      application_deadline: jobData.application_deadline,
      education_requirements: jobData.education_requirements,
      created_by: jobData.created_by,
      company_id: jobData.company_id,
      status: jobData.status,
      responsibilities: jobData.responsibilities,
      requirements: jobData.requirements,
      benefits: jobData.benefits
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert([cleanJobData])
      .select()
      .single();
    return { data, error };
  },

  updateJob: async (jobId, updates) => {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    return { data, error };
  },

  deleteJob: async (jobId) => {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    return { error };
  },

  // Applications
  getApplicationById: async (applicationId) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(id, title, location),
        applicant:user_profiles(full_name, email, phone, location)
      `)
      .eq('id', applicationId)
      .single();
    return { data, error };
  },

  createApplication: async (applicationData) => {
    try {
      // Use the enhanced application function if available
      const { data, error } = await supabase.rpc('submit_job_application', {
        p_job_id: applicationData.job_id,
        p_user_id: applicationData.user_id,
        p_full_name: applicationData.full_name,
        p_email: applicationData.email,
        p_phone: applicationData.phone,
        p_location: applicationData.location,
        p_cover_letter: applicationData.cover_letter,
        p_resume_url: applicationData.resume_url,
        p_portfolio_url: applicationData.portfolio_url,
        p_salary_expectation: applicationData.salary_expectation,
        p_available_start_date: applicationData.available_start_date,
        p_notes: applicationData.notes
      });
      
      if (error) {
        console.error('Application function error:', error);
        // Fallback to direct insert
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('applications')
          .insert([{
            id: crypto.randomUUID(),
            ...applicationData,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select(`
            *,
            jobs (
              id,
              title,
              location,
              job_type,
              companies (
                name,
                logo_url
              )
            )
          `)
          .single();
        
        return { data: fallbackData, error: fallbackError };
      }
      
      return { data: data.success ? { id: data.application_id, status: 'pending', ...applicationData } : null, error: data.success ? null : { message: data.message } };
    } catch (err) {
      console.error('Application submission error:', err);
      return { data: null, error: err };
    }
  },

  getUserApplications: async (userId) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id,
          title,
          location,
          job_type,
          salary_min,
          salary_max,
          companies (
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  getUserApplicationsWithDetails: async (userId) => {
    const { data, error } = await supabase.rpc('get_user_applications_with_details', {
      p_user_id: userId
    });
    return { data, error };
  },

  markApplicationMessagesAsRead: async (applicationId, userId) => {
    const { data, error } = await supabase
      .from('application_messages')
      .update({ read_by_candidate: true })
      .eq('application_id', applicationId)
      .eq('sender_type', 'employer')
      .select();
    return { data, error };
  },

  getJobApplications: async (jobId) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        user_profiles (
          full_name,
          current_job_title,
          location
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  updateApplicationStatus: async (applicationId, status) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select();
    return { data: data?.[0], error };
  },

  deleteApplication: async (applicationId, userId) => {
    try {
      // Direct deletion from applications table
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Application deletion error:', deleteError);
        return { error: deleteError };
      }
      
      return { data: { success: true }, error: null };
    } catch (err) {
      console.error('Application deletion error:', err);
      return { error: err };
    }
  },

  // Companies
  createCompany: async (companyData) => {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();
    return { data, error };
  },

  getCompanyById: async (companyId) => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    return { data, error };
  },

  getCompanyJobs: async (companyId) => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          name,
          logo_url
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) return { data, error };
    
    // Add application count and format data for each job
    const jobsWithCounts = await Promise.all(
      (data || []).map(async (job) => {
        // Get application count
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);
        
        // Format the job data
        return {
          ...job,
          applicationCount: count || 0,
          deadline: job.application_deadline,
          salaryRange: job.salary_min && job.salary_max 
            ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
            : job.salary_min 
            ? `${job.salary_min.toLocaleString()}+`
            : 'Competitive',
          postedDate: new Date(job.created_at).toLocaleDateString(),
          views: job.view_count || 0,
          type: job.employment_type || 'Full-time',
          department: job.department || 'General',
          location: job.location || 'Remote'
        };
      })
    );
    
    return { data: jobsWithCounts, error: null };
  },

  updateCompany: async (companyId, updates) => {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();
    return { data, error };
  },

  deleteCompany: async (companyId) => {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
    return { error };
  },

  searchCompanies: async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      return { data: [], error: null };
    }
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
      .order('name')
      .limit(10);
    return { data, error };
  },

  // Job Applications
  getJobApplications: async (jobId) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        user_profiles (
          full_name,
          email,
          phone,
          location
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    
    // Flatten the user profile data
    const transformedData = data?.map(app => ({
      ...app,
      full_name: app.user_profiles?.full_name || app.full_name,
      email: app.user_profiles?.email || app.email,
      phone: app.user_profiles?.phone || app.phone,
      location: app.user_profiles?.location || app.location
    })) || [];
    
    return { data: transformedData, error };
  },

  updateApplicationStatus: async (applicationId, status) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select();
    return { data: data?.[0], error };
  },

  updateApplicationStatusWithMessage: async (applicationId, newStatus, senderId, options = {}) => {
    console.log('Updating application status with direct queries:', { applicationId, newStatus, senderId, options });
    
    // First, verify the application exists
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select('id, status, user_id')
      .eq('id', applicationId)
      .single();
    
    if (checkError || !existingApp) {
      console.error('Application not found during check:', { applicationId, checkError });
      return { data: null, error: { message: 'Application not found' } };
    }
    
    console.log('Application found, proceeding with update:', existingApp);
    
    // Direct update to applications table
    const { data: updateData, error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select();
    
    // Handle the response - take first item if array returned
    const applicationData = Array.isArray(updateData) ? updateData[0] : updateData;
    
    if (updateError) {
      console.error('Application update failed:', updateError);
      return { data: null, error: updateError };
    }
    
    if (!applicationData) {
      console.error('No application found with ID:', applicationId);
      return { data: null, error: { message: 'Application not found' } };
    }
    
    console.log('Application status updated successfully:', applicationData);
    
    // Insert message if content provided
    if (options.messageContent || options.messageSubject) {
      const { data: messageData, error: messageError } = await supabase
        .from('application_messages')
        .insert({
          application_id: applicationId,
          sender_id: senderId,
          sender_type: 'employer',
          subject: options.messageSubject || 'Status Update',
          content: options.messageContent || `Application status updated to ${newStatus}`,
          message_type: options.templateName === 'interview_invite' ? 'interview_invite' : 
                       options.templateName === 'rejection' ? 'rejection' :
                       options.templateName === 'offer' ? 'offer' : 'status_update'
        })
        .select()
        .single();
      
      if (messageError) {
        console.error('Message insert failed:', messageError);
      } else {
        console.log('Message created successfully:', messageData);
      }
    }
    
    // Insert interview record if scheduling interview
    if (options.interviewDate && newStatus === 'interview_scheduled') {
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .insert({
          application_id: applicationId,
          interview_date: options.interviewDate,
          interview_type: options.interviewType || 'video',
          location: options.interviewLocation || 'TBD',
          status: 'scheduled',
          interviewer_notes: options.interviewNotes || null
        })
        .select()
        .single();
      
      if (interviewError) {
        console.error('Interview insert failed:', interviewError);
      } else {
        console.log('Interview scheduled successfully:', interviewData);
      }
    }
    
    return { data: applicationData, error: null };
  },

  getApplicationDetails: async (applicationId) => {
    const { data, error } = await supabase.rpc('get_application_details', {
      p_application_id: applicationId
    });
    return { data, error };
  },

  getApplicationMessages: async (applicationId) => {
    const { data, error } = await supabase
      .from('application_messages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createApplicationMessage: async (messageData) => {
    const { data, error } = await supabase
      .from('application_messages')
      .insert([messageData])
      .select()
      .single();
    return { data, error };
  },

  markMessageAsRead: async (messageId) => {
    const { data, error } = await supabase
      .from('application_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select();
    return { data: data?.[0], error };
  },

  getMessageTemplates: async () => {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('name');
    return { data, error };
  },

  createInterview: async (interviewData) => {
    const { data, error } = await supabase
      .from('interviews')
      .insert([interviewData])
      .select()
      .single();
    return { data, error };
  },

  updateInterview: async (interviewId, updates) => {
    const { data, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', interviewId)
      .select()
      .single();
    return { data, error };
  },

  getApplicationInterviews: async (applicationId) => {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', applicationId)
      .order('scheduled_at', { ascending: false });
    return { data, error };
  },

  getEmailNotifications: async (applicationId) => {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('application_id', applicationId)
      .order('sent_at', { ascending: false });
    return { data, error };
  },

  sendEmailNotification: async (emailData) => {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert([emailData])
      .select()
      .single();
    return { data, error };
  },

  updateEmailNotificationStatus: async (notificationId, status) => {
    const { data, error } = await supabase
      .from('email_notifications')
      .update({ delivery_status: status })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  },

  // Saved Jobs
  saveJob: async (userId, jobId) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert([{ user_id: userId, job_id: jobId }])
      .select()
      .single();
    return { data, error };
  },

  unsaveJob: async (userId, jobId) => {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);
    return { error };
  },

  getSavedJobs: async (userId) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        jobs (
          *,
          companies (
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  checkJobSaved: async (userId, jobId) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();
    return { data: !!data, error };
  },

  // File Upload functionality
  uploadFile: async (file, bucket = 'user-files', filePath) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // The filePath is already constructed with the user ID in the calling component (e.g., Profile page)
      // Using it directly ensures RLS compliance without duplicating the user ID.
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return { data: { ...data, publicUrl, path: filePath }, error: null };
    } catch (err) {
      console.error('File upload error:', err);
      return { data: null, error: err };
    }
  },

  deleteFile: async (bucket, filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      return { data, error };
    } catch (err) {
      console.error('File deletion error:', err);
      return { data: null, error: err };
    }
  },

  getFileUrl: async (bucket, filePath) => {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return { data, error: null };
    } catch (err) {
      console.error('Get file URL error:', err);
      return { data: null, error: err };
    }
  },

  // Skills
  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    return { data, error };
  },

  createSkill: async (skillData) => {
    const { data, error } = await supabase
      .from('skills')
      .insert([skillData])
      .select()
      .single();
    return { data, error };
  },

  getUserSkills: async (userId) => {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills (
          name,
          category
        )
      `)
      .eq('user_id', userId);
    return { data, error };
  },

  addUserSkill: async (userId, skillId, proficiencyLevel, yearsExperience) => {
    const { data, error } = await supabase
      .from('user_skills')
      .insert([{
        user_id: userId,
        skill_id: skillId,
        proficiency_level: proficiencyLevel,
        years_experience: yearsExperience
      }])
      .select()
      .single();
    return { data, error };
  },

  removeUserSkill: async (userId, skillId) => {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId);
    return { error };
  },

  // Analytics and Stats
  getApplicationStats: async (userId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', userId);
    
    if (error) return { data: null, error };
    
    const stats = data.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    return { data: stats, error: null };
  },

  getJobStats: async (createdBy) => {
    const { data, error } = await supabase
      .from('jobs')
      .select('status, application_count, view_count')
      .eq('created_by', createdBy);
    
    if (error) return { data: null, error };
    
    const stats = {
      totalJobs: data.length,
      activeJobs: data.filter(job => job.status === 'active').length,
      totalApplications: data.reduce((sum, job) => sum + (job.application_count || 0), 0),
      totalViews: data.reduce((sum, job) => sum + (job.view_count || 0), 0)
    };
    
    return { data: stats, error: null };
  },

  // Activity Tracking
  addActivity: async (userId, activityData) => {
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        user_id: userId,
        ...activityData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    return { data, error };
  },

  getUserActivities: async (userId, limit = 10) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  deleteActivity: async (activityId) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
    return { error };
  },

  getRecentActivities: async (userId, limit = 10) => {
    try {
      // Get recent applications and their status changes for this employer
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          full_name,
          jobs (
            id,
            title
          )
        `)
        .eq('jobs.created_by', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activities:', error);
        return { data: [], error };
      }

      // Transform the data into activity format
      const activities = data?.map(app => ({
        id: app.id,
        type: 'application',
        candidateName: app.full_name,
        action: 'applied for',
        jobTitle: app.jobs?.title || 'Unknown Position',
        timestamp: new Date(app.updated_at || app.created_at),
        priority: 'normal'
      })) || [];

      return { data: activities, error: null };
    } catch (err) {
      console.error('Error in getRecentActivities:', err);
      return { data: [], error: err };
    }
  }
};