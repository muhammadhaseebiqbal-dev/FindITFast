import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'right' | 'down' | 'left' | 'scale' | 'fade';
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  direction = 'fade',
  delay = 0
}) => {
  const getAnimationClass = () => {
    switch (direction) {
      case 'up':
        return 'animate-slide-in-bottom';
      case 'right':
        return 'animate-slide-in-right';
      case 'left':
        return 'animate-slide-in-left';
      case 'scale':
        return 'animate-scale-in';
      case 'fade':
      default:
        return 'fade-in';
    }
  };

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div 
      className={`${getAnimationClass()} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Staggered animation wrapper for multiple items
interface StaggeredTransitionProps {
  children: React.ReactNode[];
  className?: string;
  direction?: 'up' | 'right' | 'down' | 'left' | 'scale' | 'fade';
  staggerDelay?: number;
}

export const StaggeredTransition: React.FC<StaggeredTransitionProps> = ({
  children,
  className = '',
  direction = 'fade',
  staggerDelay = 100
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          key={index}
          direction={direction}
          delay={index * staggerDelay}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  );
};
