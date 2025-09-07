import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application': return 'Send';
      case 'status_update': return 'RefreshCw';
      case 'job_match': return 'Target';
      case 'profile_update': return 'User';
      case 'interview': return 'Calendar';
      case 'offer': return 'Gift';
      default: return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'application': return 'text-secondary';
      case 'status_update': return 'text-warning';
      case 'job_match': return 'text-info';
      case 'profile_update': return 'text-text-secondary';
      case 'interview': return 'text-info';
      case 'offer': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityTime?.toLocaleDateString();
  };

  const recentActivities = activities?.slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-text-secondary" />
      </div>
      {recentActivities?.length > 0 ? (
        <div className="space-y-4">
          {recentActivities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  {activity?.message}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-text-secondary">
                    {formatTimeAgo(activity?.timestamp)}
                  </span>
                  {activity?.isNew && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="Activity" size={32} className="text-text-secondary mx-auto mb-2" />
          <p className="text-sm text-text-secondary">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;