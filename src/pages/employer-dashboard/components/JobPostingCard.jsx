import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobPostingCard = ({ job, onEdit, onViewApplicants, onDelete }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'draft':
        return 'text-warning bg-warning/10';
      case 'closed':
        return 'text-text-secondary bg-muted';
      case 'expired':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  const handleViewDetails = () => {
    navigate(`/job-details/${job?.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(job);
    }
  };

  const handleViewApplicants = () => {
    navigate(`/employer/job/${job?.id}/applicants`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-modal transition-shadow duration-150">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-text-primary">{job?.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job?.status)}`}>
              {job?.status?.charAt(0)?.toUpperCase() + job?.status?.slice(1)}
            </span>
          </div>
          <p className="text-text-secondary text-sm mb-2">{job?.department} • {job?.location}</p>
          <p className="text-text-secondary text-sm">{job?.type} • ${job?.salaryRange}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            className="text-text-secondary hover:text-text-primary"
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete && onDelete(job?.id)}
            className="text-text-secondary hover:text-error"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Users" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-text-primary">Applications</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{job?.applicationCount}</p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Clock" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-text-primary">Deadline</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{getDaysRemaining(job?.deadline)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <span>Posted {job?.postedDate}</span>
          <span>•</span>
          <span>{job?.views} views</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            iconName="Eye"
            iconPosition="left"
            iconSize={14}
          >
            View
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleViewApplicants}
            iconName="Users"
            iconPosition="left"
            iconSize={14}
          >
            Applicants
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingCard;