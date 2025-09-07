import React from 'react';
import Icon from '../../../components/AppIcon';

const SalaryInsightsWidget = ({ userSkills = [], userLocation = '', salaryData = {} }) => {
  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const insights = [
    {
      label: 'Average Salary',
      value: formatSalary(salaryData?.average || 75000),
      change: '+5.2%',
      trend: 'up',
      icon: 'TrendingUp'
    },
    {
      label: 'Market Range',
      value: `${formatSalary(salaryData?.min || 60000)} - ${formatSalary(salaryData?.max || 95000)}`,
      change: 'Your skills',
      trend: 'neutral',
      icon: 'BarChart3'
    },
    {
      label: 'Top Skill Premium',
      value: formatSalary(salaryData?.premium || 85000),
      change: '+12.8%',
      trend: 'up',
      icon: 'Award'
    }
  ];

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Salary Insights</h3>
        <Icon name="DollarSign" size={20} className="text-secondary" />
      </div>
      <div className="space-y-4">
        {insights?.map((insight, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Icon name={insight?.icon} size={16} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {insight?.label}
                </p>
                <p className="text-xs text-text-secondary">
                  {userLocation || 'San Francisco, CA'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">
                {insight?.value}
              </p>
              <div className="flex items-center space-x-1">
                <Icon 
                  name={getTrendIcon(insight?.trend)} 
                  size={12} 
                  className={getTrendColor(insight?.trend)} 
                />
                <span className={`text-xs ${getTrendColor(insight?.trend)}`}>
                  {insight?.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-accent rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon name="Lightbulb" size={16} className="text-secondary" />
          <p className="text-sm text-text-primary">
            <span className="font-medium">Tip:</span> Adding React and Node.js skills could increase your salary by 15-20%
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsightsWidget;