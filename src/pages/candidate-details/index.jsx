import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== Candidate Details Debug ===');
    console.log('Route ID parameter:', id);
    console.log('Current user:', user);
    console.log('User profile:', userProfile);
    
    const fetchCandidateDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch candidate data from the database
        console.log('Fetching candidate with ID:', id);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', id)
          .eq('role', 'job_seeker')
          .single();

        console.log('Database query result:', { data, error });

        if (error) throw error;
        if (!data) throw new Error('Candidate not found');

        // Format the data to match the expected structure
        const formattedCandidate = {
          ...data,
          // Ensure arrays are always arrays, even if null/undefined
          skills: Array.isArray(data.skills) ? data.skills : [],
          languages: Array.isArray(data.languages) ? data.languages : [],
          work_experience: Array.isArray(data.work_experience) ? data.work_experience : [],
          education: Array.isArray(data.education) ? data.education : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          employment_type_preferences: Array.isArray(data.employment_type_preferences) 
            ? data.employment_type_preferences 
            : ['full-time'],
          // Handle portfolio files if they exist
          ...(data.portfolio_files && {
            linkedin_url: data.portfolio_files.linkedin_url,
            github_url: data.portfolio_files.github_url,
            portfolio_url: data.portfolio_files.portfolio_url
          })
        };
        
        setCandidate(formattedCandidate);
      } catch (error) {
        console.error('Error fetching candidate details:', error);
        setCandidate(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCandidateDetails();
    }
  }, [id]);

  const formatSalaryRange = (min, max, currency) => {
    if (!min && !max) return 'Salary not specified';
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
    if (!max) return `${symbol}${min?.toLocaleString()}+`;
    if (!min) return `Up to ${symbol}${max?.toLocaleString()}`;
    return `${symbol}${min?.toLocaleString()} - ${symbol}${max?.toLocaleString()}`;
  };

  const handleContact = () => {
    if (!candidate?.email) {
      alert('No email available for this candidate');
      return;
    }
    window.location.href = `mailto:${candidate.email}?subject=Opportunity at ${userProfile?.company_name || 'Our Company'}`;
  };

  const downloadResume = async () => {
    console.log('=== Resume Download Debug ===');
    console.log('Candidate:', candidate);
    console.log('Candidate resume_url:', candidate?.resume_url);
    
    try {
      // Always check storage first, even if resume_url is null
      const userId = candidate.id;
      console.log('User ID:', userId);
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('user-resumes')
        .list(userId); // List files in the user's folder

      console.log('Storage list result:', { fileData, fileError });

      if (fileError) {
        console.error('Error listing files:', fileError);
        alert('Unable to access resume files. Please try again later.');
        return;
      }

      // Check if any resume files exist for this user
      if (!fileData || fileData.length === 0) {
        console.log('No files found in user folder');
        alert('No resume files found for this candidate.');
        return;
      }

      let resumePath;
      
      if (candidate?.resume_url) {
        // Use the database URL if available
        resumePath = candidate.resume_url;
        console.log('Using database resume_url:', resumePath);
        
        // If the resume_url contains a full Supabase URL, extract just the file path
        if (resumePath.includes('supabase.co/storage/v1/object/public/user-resumes/')) {
          resumePath = resumePath.split('/user-resumes/')[1];
        } else if (resumePath.includes('supabase.co/storage/v1/object/sign/user-resumes/')) {
          resumePath = resumePath.split('/user-resumes/')[1];
        }
      } else {
        // Database resume_url is null, but files exist in storage
        // Use the first resume file found
        const resumeFile = fileData.find(file => 
          file.name.toLowerCase().includes('resume') || 
          file.name.toLowerCase().endsWith('.pdf') ||
          file.name.toLowerCase().endsWith('.doc') ||
          file.name.toLowerCase().endsWith('.docx')
        ) || fileData[0]; // Fallback to first file
        
        resumePath = `${userId}/${resumeFile.name}`;
        console.log('Database resume_url is null, using storage file:', resumePath);
      }
      
      console.log('Final resume path:', resumePath);
      
      // Get the signed URL for the resume
      const { data, error } = await supabase.storage
        .from('user-resumes')
        .createSignedUrl(resumePath, 60); // URL expires in 60 seconds

      console.log('Signed URL result:', { data, error });

      if (error) throw error;
      
      // Open the resume in a new tab for download
      if (data?.signedUrl) {
        console.log('Opening signed URL:', data.signedUrl);
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      if (error.message?.includes('Object not found')) {
        alert('Resume file not found. This candidate may not have uploaded a resume yet.');
      } else {
        alert('Failed to download resume. Please try again later.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-border rounded mb-4"></div>
              <div className="h-6 bg-border rounded mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-40 bg-border rounded"></div>
                  <div className="h-60 bg-border rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-40 bg-border rounded"></div>
                  <div className="h-40 bg-border rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Icon name="UserX" size={48} className="mx-auto text-text-secondary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Candidate Not Found</h1>
            <p className="text-text-secondary mb-6">The candidate you're looking for doesn't exist.</p>
            <Button
              variant="default"
              onClick={() => navigate('/candidates')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Candidates
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                      {candidate.full_name}
                    </h1>
                    <p className="text-xl text-text-secondary mb-2">
                      {candidate.current_job_title}
                    </p>
                    <div className="flex items-center text-text-secondary mb-2">
                      <Icon name="MapPin" size={16} className="mr-2" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center text-text-secondary">
                      <Icon name="Clock" size={16} className="mr-2" />
                      {candidate.years_experience || 'Experience not specified'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {candidate.linkedin_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(candidate.linkedin_url, '_blank')}
                        iconName="Linkedin"
                      />
                    )}
                    {candidate.github_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(candidate.github_url, '_blank')}
                        iconName="Github"
                      />
                    )}
                    {candidate.portfolio_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(candidate.portfolio_url, '_blank')}
                        iconName="ExternalLink"
                      />
                    )}
                  </div>
                </div>

                <p className="text-text-secondary mb-6">
                  {candidate.bio || 'No bio available for this candidate.'}
                </p>

                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Work Experience</h3>
                <div className="space-y-6">
                  {candidate.work_experience && candidate.work_experience.length > 0 ? (
                    candidate.work_experience.map((job, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-text-primary">
                            {job.position}
                          </h4>
                          <span className="text-sm text-text-secondary">
                            {job.start_date} - {job.end_date}
                          </span>
                        </div>
                        <p className="text-text-secondary font-medium mb-2">{job.company}</p>
                        <p className="text-text-secondary mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {job.technologies && job.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="inline-block px-2 py-1 text-xs bg-border text-text-secondary rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary">No work experience information available.</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Education</h3>
                <div className="space-y-4">
                  {candidate.education && candidate.education.length > 0 ? (
                    candidate.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-success pl-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-lg font-medium text-text-primary">
                            {edu.degree} in {edu.field}
                          </h4>
                          <span className="text-sm text-text-secondary">
                            {edu.start_date} - {edu.end_date}
                          </span>
                        </div>
                        <p className="text-text-secondary">{edu.institution}</p>
                        {edu.gpa && (
                          <p className="text-sm text-text-secondary">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary">No education information available.</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.certifications && candidate.certifications.length > 0 ? (
                    candidate.certifications.map((cert, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <h4 className="font-medium text-text-primary mb-1">{cert.name}</h4>
                        <p className="text-sm text-text-secondary mb-1">{cert.issuer}</p>
                        <p className="text-sm text-text-secondary">
                          Issued: {cert.date}
                        </p>
                        {cert.credential_id && (
                          <p className="text-xs text-text-secondary mt-1">
                            ID: {cert.credential_id}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary">No certifications available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Actions */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Candidate</h3>
                <div className="space-y-3">
                  <Button
                    variant="default"
                    onClick={handleContact}
                    iconName="Mail"
                    iconPosition="left"
                    className="w-full"
                  >
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadResume}
                    iconName="Download"
                    iconPosition="left"
                    className="w-full"
                  >
                    Download Resume
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/candidates')}
                    iconName="ArrowLeft"
                    iconPosition="left"
                    className="w-full"
                  >
                    Back to Search
                  </Button>
                </div>
              </div>

              {/* Quick Details */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Salary Range:</span>
                    <span className="text-text-primary font-medium">
                      {formatSalaryRange(candidate.expected_salary_min, candidate.expected_salary_max, candidate.salary_currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Availability:</span>
                    <span className="text-text-primary">{candidate.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Notice Period:</span>
                    <span className="text-text-primary">{candidate.notice_period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Remote Work:</span>
                    <span className="text-text-primary capitalize">{candidate.remote_work_preference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Industry:</span>
                    <span className="text-text-primary">{candidate.industry}</span>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Languages</h3>
                <div className="space-y-2">
                  {candidate.languages && candidate.languages.length > 0 ? (
                    candidate.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-text-primary">{lang.language}</span>
                        <span className="text-text-secondary text-sm">{lang.proficiency}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary">No language information available.</p>
                  )}
                </div>
              </div>

              {/* Employment Preferences */}
              <div className="bg-card border border-border rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Employment Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.employment_type_preferences.map((type, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-success/10 text-success rounded-full capitalize"
                    >
                      {type.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;