import React from 'react';

export type StatusPillType = 'completed' | 'pending' | 'over-limit' | 'brand' | 'monthly';

export interface StatusPillProps {
  type: StatusPillType;
  label: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ type, label, className = '' }) => {
  const typeClasses = {
    'completed': 'bg-prism-success-bg text-prism-success-text',
    'pending': 'bg-prism-warning-bg text-prism-warning-text',
    'over-limit': 'bg-prism-danger-bg text-prism-danger-text',
    'brand': 'bg-prism-violet-50 text-prism-violet-700',
    'monthly': 'bg-prism-surface text-prism-text-muted',
  };

  return (
    <span className={`inline-flex items-center justify-center h-6 px-[10px] rounded-pill text-xs font-medium whitespace-nowrap ${typeClasses[type]} ${className}`}>
      {label}
    </span>
  );
};

StatusPill.displayName = 'StatusPill';
