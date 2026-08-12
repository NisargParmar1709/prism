import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex flex-row items-center justify-between mb-4 ${className}`}>
      <div className="flex flex-col">
        <h2 className="text-h2 text-prism-text m-0">{title}</h2>
        {subtitle && (
          <p className="text-small text-prism-text-muted mt-1 m-0">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

SectionHeader.displayName = 'SectionHeader';
