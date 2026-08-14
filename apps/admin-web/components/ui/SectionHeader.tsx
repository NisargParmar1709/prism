import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={`flex flex-row items-center justify-between mb-4 ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h2 className="text-h2 text-prism-text m-0">{title}</h2>
        </div>
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
