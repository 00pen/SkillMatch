import React from 'react';

const JobCardSkeleton = () => (
  <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
    <div className="flex items-start space-x-4 mb-4">
      <div className="w-12 h-12 bg-muted rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
        <div className="flex space-x-4 mb-3">
          <div className="h-3 bg-muted rounded w-20"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
          <div className="h-3 bg-muted rounded w-24"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-32"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-border pt-4">
      <div className="h-3 bg-muted rounded w-full mb-2"></div>
      <div className="h-3 bg-muted rounded w-2/3 mb-3"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-muted rounded w-16"></div>
        <div className="h-6 bg-muted rounded w-20"></div>
        <div className="h-6 bg-muted rounded w-18"></div>
      </div>
    </div>
  </div>
);

const JobListSkeleton = ({ count = 6 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count })?.map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default JobListSkeleton;