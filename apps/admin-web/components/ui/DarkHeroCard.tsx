import React from 'react';

interface DarkHeroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DarkHeroCard = React.forwardRef<HTMLDivElement, DarkHeroCardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-gradient-to-br from-prism-dark-card to-[#0F172A] rounded-card p-prism-5 text-prism-dark-text shadow-dark-card ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DarkHeroCard.displayName = 'DarkHeroCard';
