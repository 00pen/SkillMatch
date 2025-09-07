import React from 'react';
import { cn } from '../../utils/cn';

const LoadingOverlay = ({ 
  isVisible = false, 
  message = "Loading...", 
  className,
  backdrop = true 
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center animate-fade-in",
        backdrop && "bg-black/20 backdrop-blur-sm",
        className
      )}
    >
      <div className="bg-background rounded-lg p-6 shadow-modal animate-scale-in">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary border-t-transparent"></div>
          <span className="text-sm font-medium text-foreground">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
