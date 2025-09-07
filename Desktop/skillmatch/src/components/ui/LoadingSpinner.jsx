import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  text = 'Loading...',
  showText = false,
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-muted-foreground',
    white: 'text-white'
  };

  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label={text}
      />
      {showText && (
        <span className={clsx('text-sm', variantClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;