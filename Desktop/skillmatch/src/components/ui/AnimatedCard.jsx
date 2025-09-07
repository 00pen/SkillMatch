import React, { useState } from 'react';
import { cn } from '../../utils/cn';

const AnimatedCard = ({ 
  children, 
  className, 
  hoverEffect = true, 
  clickEffect = true,
  delay = 0,
  ...props 
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseDown = () => {
    if (clickEffect) {
      setIsClicked(true);
    }
  };

  const handleMouseUp = () => {
    if (clickEffect) {
      setIsClicked(false);
    }
  };

  const handleMouseLeave = () => {
    if (clickEffect) {
      setIsClicked(false);
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out animate-fade-in-up",
        hoverEffect && "hover:shadow-lg hover:-translate-y-1",
        clickEffect && isClicked && "scale-[0.98]",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
