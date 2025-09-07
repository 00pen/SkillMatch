import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';
import UserProfileDropdown from './UserProfileDropdown';

const RoleAdaptiveNavbar = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, userRole, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/', icon: 'Home', roles: ['public'] },
        { label: 'Jobs', path: '/job-search-results', icon: 'Search', roles: ['public'] },
        { label: 'Register', path: '/register', icon: 'UserPlus', roles: ['public'] }
      ];
    }

    const commonItems = [
      { label: 'Profile', path: '/profile', icon: 'User', roles: ['job-seeker', 'employer'] }
    ];

    if (userRole === 'job-seeker') {
      return [
        { label: 'Dashboard', path: '/job-seeker-dashboard', icon: 'LayoutDashboard', roles: ['job-seeker'] },
        { label: 'Jobs', path: '/job-search-results', icon: 'Search', roles: ['job-seeker'] },
        { label: 'Applications', path: '/application-tracking', icon: 'FileText', roles: ['job-seeker'] },
        ...commonItems
      ];
    }

    if (userRole === 'employer') {
      return [
        { label: 'Dashboard', path: '/employer-dashboard', icon: 'LayoutDashboard', roles: ['employer'] },
        { label: 'Post Job', path: '/create-job', icon: 'Plus', roles: ['employer'] },
        { label: 'Jobs', path: '/job-search-results', icon: 'Briefcase', roles: ['employer'] },
        { label: 'Candidates', path: '/candidates', icon: 'Users', roles: ['employer'] },
        ...commonItems
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (path) => {
    if (path === '/' && location?.pathname === '/') return true;
    if (path !== '/' && location?.pathname?.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-1000 bg-background border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center min-w-0">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity duration-150 cursor-pointer min-w-0"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Zap" size={16} className="sm:w-5 sm:h-5" color="white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary truncate">SkillMatch</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-6 lg:ml-10 flex items-baseline space-x-4 lg:space-x-6 xl:space-x-8">
              {navigationItems && Array.isArray(navigationItems) ? navigationItems.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`nav-item px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center space-x-1 lg:space-x-2 whitespace-nowrap ${
                    isActiveRoute(item?.path)
                      ? 'text-secondary bg-accent' : 'text-text-primary hover:text-secondary hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden lg:inline">{item?.label}</span>
                </button>
              )) : null}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <div className="flex items-center space-x-1 lg:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/login')}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  <span className="hidden lg:inline">Login</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleNavigation('/register')}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  <span className="hidden lg:inline">Register</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              iconName={isMobileMenuOpen ? "X" : "Menu"}
              iconSize={20}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-b border-border shadow-dropdown">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`nav-item w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 flex items-center space-x-3 ${
                  isActiveRoute(item?.path)
                    ? 'text-secondary bg-accent' : 'text-text-primary hover:text-secondary hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
              </button>
            ))}
            
            {/* Mobile User Section */}
            <div className="border-t border-border pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} color="var(--color-text-secondary)" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">
                        {userProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
                      </div>
                      <div className="text-sm text-text-secondary capitalize">
                        {userRole?.replace('_', ' ').replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-muted transition-colors duration-150 flex items-center space-x-3"
                  >
                    <Icon name="LogOut" size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-primary hover:text-secondary hover:bg-muted transition-colors duration-150 flex items-center space-x-3"
                  >
                    <Icon name="LogIn" size={18} />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-150 flex items-center space-x-3"
                  >
                    <Icon name="UserPlus" size={18} />
                    <span>Register</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RoleAdaptiveNavbar;