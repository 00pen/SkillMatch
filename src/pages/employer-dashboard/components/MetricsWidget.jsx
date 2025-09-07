import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsWidget = ({ title, value, change, changeType, icon, color = 'secondary' }) => {
  const getChangeColor = (type) => {
    switch (type) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'increase':
        return 'TrendingUp';
      case 'decrease':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'secondary':
        return 'text-secondary bg-secondary/10';
      case 'success':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'error':
        return 'text-error bg-error/10';
      default:
        return 'text-secondary bg-secondary/10';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
          <Icon name={icon} size={24} />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${getChangeColor(changeType)}`}>
            <Icon name={getChangeIcon(changeType)} size={16} />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-text-primary mb-1">{value}</h3>
        <p className="text-text-secondary text-sm">{title}</p>
      </div>
    </div>
  );
};

export default MetricsWidget;