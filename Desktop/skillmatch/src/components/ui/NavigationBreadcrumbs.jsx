import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationBreadcrumbs = ({ className = '', customBreadcrumbs = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route to breadcrumb mapping
  const routeMap = {
    '/': { label: 'Home', icon: 'Home' },
    '/register': { label: 'Register', icon: 'UserPlus' },
    '/job-seeker-dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/employer-dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/job-search-results': { label: 'Job Search', icon: 'Search' },
    '/job-details': { label: 'Job Details', icon: 'FileText' },
    '/application-tracking': { label: 'Applications', icon: 'Clipboard' },
    '/profile': { label: 'Profile', icon: 'User' },
    '/candidates': { label: 'Candidates', icon: 'Users' },
    '/candidate': { label: 'Candidate', icon: 'User' },
    '/settings': { label: 'Settings', icon: 'Settings' }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Home for non-root paths
    if (location?.pathname !== '/') {
      breadcrumbs?.push({
        label: 'Home',
        path: '/',
        icon: 'Home'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap?.[currentPath];
      
      if (routeInfo) {
        breadcrumbs?.push({
          label: routeInfo?.label,
          path: currentPath,
          icon: routeInfo?.icon,
          isLast: index === pathSegments?.length - 1
        });
      } else {
        // Handle dynamic routes - special case for candidate details
        if (currentPath.startsWith('/candidate/')) {
          // For candidate detail pages, link back to candidates list
          breadcrumbs?.push({
            label: 'Candidates',
            path: '/candidates',
            icon: 'Users',
            isLast: false
          });
          // Add the candidate name/ID as the last breadcrumb
          breadcrumbs?.push({
            label: 'Candidate Details',
            path: currentPath,
            icon: 'User',
            isLast: true
          });
          return; // Skip further processing for this route
        } else {
          // Handle other dynamic routes or unknown paths
          const formattedLabel = segment?.split('-')?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1))?.join(' ');
          
          breadcrumbs?.push({
            label: formattedLabel,
            path: currentPath,
            icon: 'ChevronRight',
            isLast: index === pathSegments?.length - 1
          });
        }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render breadcrumbs for home page or if only one item
  if (location?.pathname === '/' || breadcrumbs?.length <= 1) {
    return null;
  }

  const handleBreadcrumbClick = (path, isLast) => {
    if (!isLast) {
      navigate(path);
    }
  };

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={14} 
                className="mx-2 text-text-secondary" 
              />
            )}
            
            {crumb?.isLast ? (
              <span className="flex items-center space-x-1 text-text-primary font-medium">
                <Icon name={crumb?.icon} size={14} />
                <span>{crumb?.label}</span>
              </span>
            ) : (
              <button
                onClick={() => handleBreadcrumbClick(crumb?.path, crumb?.isLast)}
                className="flex items-center space-x-1 text-text-secondary hover:text-secondary transition-colors duration-150 hover:underline"
              >
                <Icon name={crumb?.icon} size={14} />
                <span>{crumb?.label}</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Specialized breadcrumb components for specific workflows
export const JobSearchBreadcrumbs = ({ jobTitle, companyName }) => {
  const customBreadcrumbs = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'Job Search', path: '/job-search-results', icon: 'Search' },
    { 
      label: jobTitle || 'Job Details', 
      path: '/job-details', 
      icon: 'FileText', 
      isLast: true 
    }
  ];

  return <NavigationBreadcrumbs customBreadcrumbs={customBreadcrumbs} />;
};

export const ApplicationBreadcrumbs = ({ applicationId, jobTitle }) => {
  const customBreadcrumbs = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'Applications', path: '/application-tracking', icon: 'Clipboard' },
    { 
      label: jobTitle || `Application #${applicationId}`, 
      path: `/application-tracking/${applicationId}`, 
      icon: 'FileText', 
      isLast: true 
    }
  ];

  return <NavigationBreadcrumbs customBreadcrumbs={customBreadcrumbs} />;
};

export const ProfileBreadcrumbs = ({ section }) => {
  const customBreadcrumbs = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'Profile', path: '/profile', icon: 'User' }
  ];

  if (section) {
    customBreadcrumbs?.push({
      label: section,
      path: `/profile/${section?.toLowerCase()}`,
      icon: 'Settings',
      isLast: true
    });
  } else {
    customBreadcrumbs[customBreadcrumbs.length - 1].isLast = true;
  }

  return <NavigationBreadcrumbs customBreadcrumbs={customBreadcrumbs} />;
};

export default NavigationBreadcrumbs;