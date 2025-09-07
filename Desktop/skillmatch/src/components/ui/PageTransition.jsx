import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

const PageTransition = ({ children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    // Start exit animation
    setIsVisible(false);
    
    // After exit animation, update children and start enter animation
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  useEffect(() => {
    // Initial mount animation
    setIsVisible(true);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
