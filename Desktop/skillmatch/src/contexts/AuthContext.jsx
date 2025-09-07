import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  userProfile: null,
  userRole: null,
  isAuthenticated: false,
  isLoading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithOAuth: async () => {},
  updateProfile: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user: currentUser } = await auth.getCurrentUser();
        if (mounted && currentUser) {
          setUser(currentUser);
          const { error } = await loadUserProfile(currentUser.id);
          if (error) {
            console.error('Profile loading failed:', error);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const authListener = auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      // Skip duplicate INITIAL_SESSION events if we already have a user
      if (event === 'INITIAL_SESSION' && user && session?.user?.id === user.id) {
        return;
      }
      
      // Handle auth state change asynchronously with proper error handling
      const handleAuthStateChange = async () => {
        try {
          if (mounted) {
            if (session?.user) {
              setUser(session.user);
              const { error } = await loadUserProfile(session.user.id);
              if (error) {
                console.error('Profile loading failed:', error);
              }
            } else {
              setUser(null);
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };
      
      // Execute async function with error handling
      handleAuthStateChange().catch(error => {
        console.error('Unhandled error in auth state change:', error);
        if (mounted) {
          setIsLoading(false);
        }
      });
    });

    return () => {
      mounted = false;
      // Handle both Supabase and mock auth unsubscribe patterns
      if (authListener?.data?.subscription?.unsubscribe) {
        authListener.data.subscription.unsubscribe();
      } else if (authListener?.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, [user?.id]);

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await db.getUserProfile(userId);
      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error loading user profile:', error);
        return { data: null, error };
      }
      
      // If profile exists, return it
      if (profile) {
        console.log('User profile loaded:', profile);
        setUserProfile(profile);
        return { data: profile, error: null };
      }
      
      // If no profile exists, try to create one
      // Get current user data for profile creation
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Handle OAuth users - extract info from user metadata and identities
      const userMetadata = currentUser?.user_metadata || {};
      const identities = currentUser?.identities || [];
      const primaryIdentity = identities[0] || {};
      
      let fullName = userMetadata.full_name || userMetadata.name;
      let avatarUrl = userMetadata.avatar_url || userMetadata.picture;
      
      // Handle different OAuth providers with better name extraction
      if (primaryIdentity.provider === 'google') {
        const identityData = primaryIdentity.identity_data || {};
        fullName = fullName || 
                 userMetadata.name || 
                 identityData.name ||
                 identityData.full_name ||
                 (userMetadata.given_name && userMetadata.family_name ? 
                  `${userMetadata.given_name} ${userMetadata.family_name}` : null) ||
                 (identityData.given_name && identityData.family_name ? 
                  `${identityData.given_name} ${identityData.family_name}` : null) ||
                 userMetadata.display_name ||
                 identityData.display_name;
                 
        avatarUrl = avatarUrl || 
                   userMetadata.picture || 
                   identityData.picture ||
                   userMetadata.avatar_url ||
                   identityData.avatar_url;
      } else if (primaryIdentity.provider === 'github') {
        const identityData = primaryIdentity.identity_data || {};
        fullName = fullName || userMetadata.name || identityData.name || userMetadata.user_name || identityData.login;
      } else if (primaryIdentity.provider === 'linkedin_oidc') {
        const identityData = primaryIdentity.identity_data || {};
        fullName = fullName || 
                 identityData.name ||
                 (userMetadata.given_name && userMetadata.family_name ? 
                  `${userMetadata.given_name} ${userMetadata.family_name}` : null) ||
                 (identityData.given_name && identityData.family_name ? 
                  `${identityData.given_name} ${identityData.family_name}` : null);
      }
      
      const profileData = {
        full_name: fullName || currentUser?.email?.split('@')[0] || 'User',
        email: currentUser?.email,
        role: userMetadata?.role?.replace('-', '_') || 'job_seeker',
        profile_picture_url: avatarUrl,
        profile_completion: primaryIdentity.provider ? 25 : 0 // OAuth provides some basic info
      };
      
      // Try to create profile with oauth_provider, fallback without it if column doesn't exist
      try {
        const { data: newProfile, error: createError } = await db.createUserProfile(userId, {
          ...profileData,
          oauth_provider: primaryIdentity.provider
        });
        
        if (createError) {
          if (createError.code === '23505') {
            // Duplicate key error - profile was created by another process
            console.log('Profile was created by another process, fetching existing profile');
            const { data: existingProfile, error: fetchError } = await db.getUserProfile(userId);
            if (fetchError) {
              console.error('Error fetching existing profile:', fetchError);
              return { data: null, error: fetchError };
            }
            setUserProfile(existingProfile);
            return { data: existingProfile, error: null };
          } else if (createError.code === 'PGRST204' && createError.message.includes('oauth_provider')) {
            // oauth_provider column doesn't exist, try without it
            console.log('oauth_provider column not found, creating profile without it');
            const { data: fallbackProfile, error: fallbackError } = await db.createUserProfile(userId, profileData);
            if (fallbackError) {
              if (fallbackError.code === '23505') {
                // Still duplicate - fetch existing
                const { data: existingProfile, error: fetchError } = await db.getUserProfile(userId);
                if (existingProfile) setUserProfile(existingProfile);
                return { data: existingProfile, error: fetchError };
              }
              console.error('Error creating user profile:', fallbackError);
              return { data: null, error: fallbackError };
            }
            setUserProfile(fallbackProfile);
            return { data: fallbackProfile, error: null };
          } else {
            console.error('Error creating user profile:', createError);
            return { data: null, error: createError };
          }
        }
        
        setUserProfile(newProfile);
        return { data: newProfile, error: null };
      } catch (error) {
        console.error('Error creating user profile:', error);
        return { data: null, error };
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Set profile to null if there's an error to prevent infinite loading
      setUserProfile(null);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setIsLoading(true);
      
      // First check if the email was previously deleted
      const { data: isDeleted, error: checkError } = await supabase.rpc('is_email_deleted', {
        p_email: email
      });
      
      if (checkError) {
        console.error('Email deletion check error:', checkError);
        return { data: null, error: checkError };
      }
      
      if (isDeleted) {
        return { 
          data: null, 
          error: new Error('This email address was previously deleted and cannot be used to create a new account. Please contact support if you need assistance.') 
        };
      }
      
      // Prepare metadata with correct field names for Supabase
      const metadata = {
        full_name: userData.fullName,
        role: userData.role?.replace('-', '_'), // Convert job-seeker to job_seeker
        location: userData.location,
        current_job_title: userData.currentJobTitle,
        company_name: userData.companyName,
        industry: userData.industry
      };
      
      console.log('Signing up user with data:', { email, userData, metadata });
      const { data, error } = await auth.signUp(email, password, metadata);
      
      console.log('Raw signup response:', { data, error });
      
      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }
      
      console.log('Auth signup successful:', data);
      
      if (data.user) {
        try {
          // Create user profile
          const profileData = {
            full_name: userData.fullName,
            role: userData.role?.replace('-', '_'), // Convert job-seeker to job_seeker
            location: userData.location,
            current_job_title: userData.currentJobTitle,
            company_name: userData.companyName,
            industry: userData.industry
          };
          
          console.log('Creating user profile with data:', { userId: data.user.id, profileData });
          
          // Wait a moment for trigger to potentially create profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if profile was created by trigger with retry logic
          let existingProfile = null;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts && !existingProfile) {
            const { data: profile, error: getError } = await db.getUserProfile(data.user.id);
            
            if (getError && getError.code !== 'PGRST116') {
              console.error('Error getting existing profile:', getError);
              break;
            }
            
            if (profile) {
              existingProfile = profile;
              break;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          let profileResult;
          if (existingProfile) {
            // Update existing profile with full data
            console.log('Profile exists from trigger, updating with full data:', existingProfile);
            const { data: updateResult, error: updateError } = await db.updateUserProfile(data.user.id, profileData);
            if (updateError) {
              console.error('Error updating user profile:', updateError);
            } else {
              profileResult = updateResult;
              console.log('User profile updated successfully:', profileResult);
            }
          } else {
            // Try to update first (in case profile exists but wasn't retrieved)
            console.log('Attempting to update profile first (in case it exists)');
            const { data: updateResult, error: updateError } = await db.updateUserProfile(data.user.id, {
              ...profileData,
              email: data.user.email
            });
            
            if (updateError) {
              console.log('Update failed, profile likely doesn\'t exist. Error:', updateError);
              // Profile doesn't exist, create it
              console.log('Creating new profile manually');
              const { data: createResult, error: createError } = await db.createUserProfile(data.user.id, {
                ...profileData,
                email: data.user.email
              });
              
              if (createError && createError.code === '23505') {
                // Duplicate key error - profile was created by another process
                console.log('Profile was created by another process, fetching it');
                const { data: fetchedProfile } = await db.getUserProfile(data.user.id);
                profileResult = fetchedProfile;
              } else if (createError) {
                console.error('Error creating user profile:', createError);
              } else {
                profileResult = createResult;
                console.log('User profile created successfully:', profileResult);
              }
            } else {
              profileResult = updateResult;
              console.log('User profile updated successfully:', profileResult);
            }
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // Don't throw error for profile creation failure
        }
        
        // After registration, reload the profile to get the data created by the trigger
        if (data.user) {
          try {
            console.log('Reloading profile after registration for user:', data.user.id);
            await loadUserProfile(data.user.id);
          } catch (loadError) {
            console.error('Failed to load profile after registration:', loadError);
          }
        }
      }
      
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      const { data, error } = await auth.signIn(email, password);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider, options = {}) => {
    try {
      setIsLoading(true);
      
      // Get the current URL for redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options.role ? `${redirectTo}?role=${options.role}` : redirectTo
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`OAuth ${provider} sign in error:`, error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await auth.signOut();
      
      // Always clear local state regardless of Supabase response
      // This ensures the UI updates immediately
      setUser(null);
      setUserProfile(null);
      
      return { error };
    } catch (error) {
      // Clear state even if signOut fails
      setUser(null);
      setUserProfile(null);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await db.updateUserProfile(user.id, updates);
      if (!error && data) {
        setUserProfile(data);
      }
      return { data, error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      if (!user) throw new Error('No authenticated user');
      
      // Use the proper account deletion function from Supabase
      const { data, error: deletionError } = await db.deleteUserAccount(user.id);
      if (deletionError) throw deletionError;
      
      // Clear local state immediately
      setUser(null);
      setUserProfile(null);
      
      // Force sign out to ensure user is logged out
      await auth.signOut();
      
      return { data, error: null };
    } catch (error) {
      console.error('Account deletion error:', error);
      // Clear state even if deletion fails to prevent further issues
      setUser(null);
      setUserProfile(null);
      await auth.signOut();
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    userRole: userProfile?.role,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    updateProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;