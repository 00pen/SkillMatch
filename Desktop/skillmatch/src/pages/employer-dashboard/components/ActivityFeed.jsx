import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application':
        return 'FileText';
      case 'status_change':
        return 'RefreshCw';
      case 'interview':
        return 'Calendar';
      case 'hire':
        return 'CheckCircle';
      case 'message':
        return 'MessageCircle';
      default:
        return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'application':
        return 'text-secondary bg-secondary/10';
      case 'status_change':
        return 'text-warning bg-warning/10';
      case 'interview':
        return 'text-info bg-info/10';
      case 'hire':
        return 'text-success bg-success/10';
      case 'message':
        return 'text-primary bg-primary/10';
      default:
        return 'text-text-secondary bg-muted';
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
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  <span className="font-medium">{activity?.candidateName}</span>
                  {' '}
                  <span className="text-text-secondary">{activity?.action}</span>
                  {' '}
                  <span className="font-medium">{activity?.jobTitle}</span>
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {formatTimeAgo(activity?.timestamp)}
                </p>
              </div>
              
              {activity?.priority === 'high' && (
                <div className="w-2 h-2 bg-error rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
        
        {activities?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;