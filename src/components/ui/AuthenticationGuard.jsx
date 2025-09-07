import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock authentication context
const AuthContext = React.createContext({
  user: null,
  userRole: null,
  isAuthenticated: false,
  isLoading: false
});

const AuthenticationGuard = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  redirectTo = '/register',
  fallback = null 
}) => {
  const { user, userRole, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while authentication is loading
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      // Store the attempted location for redirect after login
      const from = location?.pathname + location?.search;
      navigate(redirectTo, { 
        state: { from },
        replace: true 
      });
      return;
    }

    // Check role-based access if roles are specified
    if (isAuthenticated && allowedRoles?.length > 0 && !allowedRoles?.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      const roleRedirects = {
        'job-seeker': '/job-seeker-dashboard',
        'employer': '/employer-dashboard'
      };
      
      const defaultRedirect = roleRedirects?.[userRole] || '/';
      navigate(defaultRedirect, { replace: true });
      return;
    }
  }, [isAuthenticated, userRole, isLoading, requireAuth, allowedRoles, navigate, location, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if authentication fails and fallback is provided
  if (requireAuth && !isAuthenticated && fallback) {
    return fallback;
  }

  // Show fallback if role access fails and fallback is provided
  if (isAuthenticated && allowedRoles?.length > 0 && !allowedRoles?.includes(userRole) && fallback) {
    return fallback;
  }

  // Render children if all checks pass
  if (!requireAuth || (isAuthenticated && (allowedRoles?.length === 0 || allowedRoles?.includes(userRole)))) {
    return children;
  }

  // Default fallback - should not reach here due to useEffect redirects
  return null;
};

// Higher-order component for easier usage
export const withAuthGuard = (WrappedComponent, guardOptions = {}) => {
  return function AuthGuardedComponent(props) {
    return (
      <AuthenticationGuard {...guardOptions}>
        <WrappedComponent {...props} />
      </AuthenticationGuard>
    );
  };
};

// Specific guards for common use cases
export const RequireAuth = ({ children, redirectTo = '/register' }) => (
  <AuthenticationGuard requireAuth={true} redirectTo={redirectTo}>
    {children}
  </AuthenticationGuard>
);

export const RequireJobSeeker = ({ children, redirectTo = '/job-seeker-dashboard' }) => (
  <AuthenticationGuard 
    requireAuth={true} 
    allowedRoles={['job-seeker']} 
    redirectTo={redirectTo}
  >
    {children}
  </AuthenticationGuard>
);

export const RequireEmployer = ({ children, redirectTo = '/employer-dashboard' }) => (
  <AuthenticationGuard 
    requireAuth={true} 
    allowedRoles={['employer']} 
    redirectTo={redirectTo}
  >
    {children}
  </AuthenticationGuard>
);

export const RequireGuest = ({ children, redirectTo = null }) => {
  const { userRole, isAuthenticated } = useContext(AuthContext);
  
  // Auto-redirect authenticated users to their dashboard
  const defaultRedirect = isAuthenticated ? (
    userRole === 'job-seeker' ? '/job-seeker-dashboard' : '/employer-dashboard'
  ) : null;

  return (
    <AuthenticationGuard 
      requireAuth={false} 
      redirectTo={redirectTo || defaultRedirect}
    >
      {!isAuthenticated ? children : null}
    </AuthenticationGuard>
  );
};

export default AuthenticationGuard;