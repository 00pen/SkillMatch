import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const SuccessToast = ({ 
  isVisible, 
  onClose, 
  title = "Success!", 
  message = "Your action was completed successfully.",
  duration = 5000,
  actionButton = null
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        bg-card border border-success/20 rounded-lg shadow-lg p-4 min-w-[320px] max-w-md
        transform transition-all duration-300 ease-in-out
        ${isAnimating && isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              {title}
            </h4>
            <p className="text-sm text-text-secondary">
              {message}
            </p>
            
            {actionButton && (
              <div className="mt-3">
                {actionButton}
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-muted rounded-lg transition-colors duration-150"
          >
            <Icon name="X" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;
