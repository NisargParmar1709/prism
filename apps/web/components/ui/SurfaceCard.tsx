import React from 'react';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ children, className = '', interactive = false, ...props }, ref) => {
    const baseClasses = 'bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card';
    const interactiveClasses = interactive
      ? 'cursor-pointer transition-all duration-card-hover ease-prism-ease hover:shadow-card-hover hover:border-prism-border-strong'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SurfaceCard.displayName = 'SurfaceCard';
