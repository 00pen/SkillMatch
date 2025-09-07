import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import RoleAdaptiveNavbar from '../../components/ui/RoleAdaptiveNavbar';
import NavigationBreadcrumbs from '../../components/ui/NavigationBreadcrumbs';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const CandidateBrowsing = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
    skills: ''
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'job_seeker')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCandidate = (candidateId) => {
    // Ensure the UUID is properly formatted (remove any spaces)
    const cleanId = candidateId.replace(/\s+/g, '');
    console.log('Navigating to candidate:', { original: candidateId, cleaned: cleanId });
    navigate(`/candidate/${cleanId}`);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      candidate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !filters.location || 
      candidate.location?.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesExperience = !filters.experience || 
      candidate.years_experience === filters.experience;
    
    const matchesSkills = !filters.skills || 
      candidate.skills?.some(skill => 
        skill.toLowerCase().includes(filters.skills.toLowerCase())
      );

    return matchesSearch && matchesLocation && matchesExperience && matchesSkills;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleAdaptiveNavbar />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-border rounded mb-4"></div>
              <div className="h-6 bg-border rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-border rounded"></div>
                ))}
              </div>
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
          <NavigationBreadcrumbs className="mb-6" />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Browse Candidates</h1>
            <p className="text-text-secondary">Find the perfect candidates for your open positions</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Search
                </label>
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Experience
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({...filters, experience: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Skills
                </label>
                <input
                  type="text"
                  placeholder="Enter skills..."
                  value={filters.skills}
                  onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-text-secondary">
              {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Candidates Grid */}
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="bg-card border border-border rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {candidate.full_name || 'Name not provided'}
                      </h3>
                      <p className="text-text-secondary mb-2">
                        {candidate.current_job_title || 'Job title not specified'}
                      </p>
                      <div className="flex items-center text-text-secondary text-sm mb-2">
                        <Icon name="MapPin" size={14} className="mr-1" />
                        {candidate.location || 'Location not specified'}
                      </div>
                      <div className="flex items-center text-text-secondary text-sm">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {candidate.years_experience || 'Experience not specified'}
                      </div>
                    </div>
                  </div>

                  <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                    {candidate.bio || 'No bio available'}
                  </p>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-border text-text-secondary rounded">
                            +{candidate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="default"
                    onClick={() => handleViewCandidate(candidate.id)}
                    iconName="Eye"
                    iconPosition="left"
                    className="w-full"
                  >
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No candidates found</h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your search criteria or check back later for new candidates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateBrowsing;