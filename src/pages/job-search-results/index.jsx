import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import { useApplications } from '../../hooks/useApplications';
import { useAuth } from '../../contexts/AuthContext';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import SearchFilters from './components/SearchFilters';
import SortControls from './components/SortControls';
import JobCard from './components/JobCard';
import JobListSkeleton from './components/JobListSkeleton';
import NoResults from './components/NoResults';
import Pagination from './components/Pagination';
import Button from '../../components/ui/Button';
import QuickApplyModal from '../../components/modals/QuickApplyModal';

const JobSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [filters, setFilters] = useState({
    keywords: '',
    location: '',
    jobTypes: [],
    salary: { min: 0, max: 0 },
    experienceLevel: '',
    industry: '',
    companySize: '',
    remoteOnly: false,
    postedToday: false
  });
  
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedJobForQuickApply, setSelectedJobForQuickApply] = useState(null);
  
  const resultsPerPage = 20;
  
  // Use custom hooks for data fetching
  const { jobs, isLoading, error, refetch } = useJobs(filters);
  const { savedJobIds, toggleSaveJob } = useSavedJobs();
  const { createApplication } = useApplications();

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs?.filter(job => {
      // Keywords filter
      if (filters?.keywords) {
        const keywords = filters?.keywords?.toLowerCase();
        const searchableText = `${job?.title} ${job?.company?.name} ${job?.description} ${job?.skills?.join(' ')}`?.toLowerCase();
        if (!searchableText?.includes(keywords)) return false;
      }

      // Location filter
      if (filters?.location && !job?.location?.toLowerCase()?.includes(filters?.location?.toLowerCase())) {
        return false;
      }

      // Job types filter
      if (filters?.jobTypes?.length > 0 && !filters?.jobTypes?.includes(job?.type)) {
        return false;
      }

      // Salary filter
      if (filters?.salary?.min > 0 && job?.salaryRange?.max < filters?.salary?.min) return false;
      if (filters?.salary?.max > 0 && job?.salaryRange?.min > filters?.salary?.max) return false;

      // Experience level filter
      if (filters?.experienceLevel && job?.experienceLevel !== filters?.experienceLevel) {
        return false;
      }

      // Industry filter
      if (filters?.industry && job?.industry !== filters?.industry) {
        return false;
      }

      // Company size filter
      if (filters?.companySize && job?.companySize !== filters?.companySize) {
        return false;
      }

      // Remote only filter
      if (filters?.remoteOnly && !job?.remote) return false;

      // Posted today filter
      if (filters?.postedToday) {
        const today = new Date();
        const posted = new Date(job.postedDate);
        const diffInHours = (today - posted) / (1000 * 60 * 60);
        if (diffInHours > 24) return false;
      }

      return true;
    });

    // Sort jobs
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.postedDate) - new Date(a.postedDate);
        case 'salary-high':
          return (b?.salaryRange?.max || 0) - (a?.salaryRange?.max || 0);
        case 'salary-low':
          return (a?.salaryRange?.min || 0) - (b?.salaryRange?.min || 0);
        case 'company':
          return a?.company?.name?.localeCompare(b?.company?.name);
        case 'title':
          return a?.title?.localeCompare(b?.title);
        default: // relevance
          return 0;
      }
    });

    return filtered;
  }, [jobs, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedJobs?.length / resultsPerPage);
  const paginatedJobs = filteredAndSortedJobs?.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Initialize filters from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const initialFilters = { ...filters };
    
    if (urlParams?.get('q')) initialFilters.keywords = urlParams?.get('q');
    if (urlParams?.get('location')) initialFilters.location = urlParams?.get('location');
    if (urlParams?.get('remote') === 'true') initialFilters.remoteOnly = true;
    
    setFilters(initialFilters);
  }, [location?.search]);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters?.keywords) params?.set('q', newFilters?.keywords);
    if (newFilters?.location) params?.set('location', newFilters?.location);
    if (newFilters?.remoteOnly) params?.set('remote', 'true');
    
    navigate(`${location?.pathname}?${params?.toString()}`, { replace: true });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      keywords: '',
      location: '',
      jobTypes: [],
      salary: { min: 0, max: 0 },
      experienceLevel: '',
      industry: '',
      companySize: '',
      remoteOnly: false,
      postedToday: false
    });
    setCurrentPage(1);
    navigate(location?.pathname, { replace: true });
  };

  // Handle save job
  const handleSaveJob = async (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    try {
      await toggleSaveJob(jobId);
    } catch (err) {
      console.error('Error toggling saved job:', err);
    }
  };

  // Handle quick apply
  const handleQuickApply = async (jobId) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    console.log('Quick apply to job:', jobId);
    
    // Find the job details for the modal
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForQuickApply(job);
    }
  };

  // Check if filters are applied
  const hasActiveFilters = Object.values(filters)?.some(value => {
    if (Array.isArray(value)) return value?.length > 0;
    if (typeof value === 'object' && value !== null) return value?.min > 0 || value?.max > 0;
    return Boolean(value);
  });

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <NavigationBreadcrumbs className="mb-4 sm:mb-6" />
          
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 line-clamp-2">Find Your Next Opportunity</h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Discover jobs that match your skills and career goals
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-3 sm:mb-4">
            <Button
              variant="outline"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              iconName="Filter"
              iconSize={14}
              fullWidth
              className="text-sm"
            >
              {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:col-span-1 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-20 sm:top-24">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 min-w-0">
              <SortControls
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultsCount={filteredAndSortedJobs?.length}
                isLoading={isLoading}
              />

              {/* Job Results */}
              {isLoading || error ? (
                error ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Jobs</h3>
                    <p className="text-text-secondary mb-4">{error}</p>
                    <Button variant="default" onClick={refetch} className="inline-flex items-center gap-2">
                      <RefreshCw size={16} />
                      Try Again
                    </Button>
                  </div>
                ) : (
                <JobListSkeleton count={6} />
                )
              ) : filteredAndSortedJobs?.length === 0 ? (
                <NoResults
                  onClearFilters={handleClearFilters}
                  hasFilters={hasActiveFilters}
                />
              ) : (
                <>
                  <div className="space-y-6">
                    {paginatedJobs?.map((job) => (
                      <JobCard
                        key={job?.id}
                        job={job}
                        onSaveJob={handleSaveJob}
                        onQuickApply={handleQuickApply}
                        isSaved={savedJobIds?.has(job?.id)}
                        userRole={user?.role || 'job-seeker'}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalResults={filteredAndSortedJobs?.length}
                    resultsPerPage={resultsPerPage}
                    isLoading={isLoading}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={!!selectedJobForQuickApply}
        onClose={() => setSelectedJobForQuickApply(null)}
        job={selectedJobForQuickApply}
      />
    </div>
  );
};

export default JobSearchResults;