import React from 'react';
import { cn } from '../../utils/cn';

const AnimatedList = ({ 
  children, 
  className, 
  staggerDelay = 100,
  animation = 'fade-in-up',
  ...props 
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={cn(`animate-${animation}`)}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default AnimatedList;
