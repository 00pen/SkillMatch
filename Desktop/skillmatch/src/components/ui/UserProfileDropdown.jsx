import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, userProfile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { label: 'Profile Settings', path: '/profile', icon: 'Settings' },
      { label: 'Account', path: '/profile', icon: 'User' }
    ];

    if (userRole === 'job-seeker') {
      return [
        { label: 'Dashboard', path: '/job-seeker-dashboard', icon: 'LayoutDashboard' },
        { label: 'Saved Jobs', path: '/saved-jobs', icon: 'Bookmark' },
        { label: 'Applications', path: '/application-tracking', icon: 'FileText' },
        { type: 'divider' },
        ...commonItems
      ];
    }

    if (userRole === 'employer') {
      return [
        { label: 'Dashboard', path: '/employer-dashboard', icon: 'LayoutDashboard' },
        { label: 'Post New Job', path: '/create-job', icon: 'Plus' },
        { label: 'Manage Jobs', path: '/job-search-results', icon: 'Briefcase' },
        { label: 'Browse Candidates', path: '/candidates', icon: 'Users' },
        { type: 'divider' },
        ...commonItems
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-secondary/20">
          {userProfile?.profile_picture_url ? (
            <img
              src={userProfile.profile_picture_url}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Icon name="User" size={16} className="text-secondary" />
          )}
        </div>
        <div className="text-left min-w-0 hidden lg:block">
          <div className="font-medium text-text-primary truncate text-sm">
            {userProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
          </div>
          <div className="text-xs text-text-secondary capitalize truncate">
            {userRole?.replace('_', ' ').replace('-', ' ') || 'User'}
          </div>
        </div>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={14} 
          className="text-text-secondary hidden lg:block" 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-dropdown z-50 py-1">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-secondary/20">
                {userProfile?.profile_picture_url ? (
                  <img
                    src={userProfile.profile_picture_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Icon name="User" size={20} className="text-secondary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-text-primary truncate">
                  {userProfile?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
                </div>
                <div className="text-sm text-text-secondary truncate">
                  {user?.email}
                </div>
                <div className="text-xs text-secondary capitalize">
                  {userRole?.replace('_', ' ').replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={index} className="border-t border-border my-1" />;
              }

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-muted transition-colors duration-150 flex items-center space-x-3"
                >
                  <Icon name={item.icon} size={16} className="text-text-secondary" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Divider before logout */}
            <div className="border-t border-border my-1" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-150 flex items-center space-x-3"
            >
              <Icon name="LogOut" size={16} className="text-error" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
