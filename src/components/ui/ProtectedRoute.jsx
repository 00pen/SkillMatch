import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userProfile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Only redirect if we're not already on login/register pages to prevent infinite loops
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    return children;
  }

  // Check role-based access only if we have a complete user profile
  if (requiredRole && userProfile && userProfile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardRoute = userProfile.role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard';
    // Prevent redirecting to the same route to avoid infinite loops
    if (location.pathname !== dashboardRoute) {
      return <Navigate to={dashboardRoute} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;