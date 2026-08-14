import React from 'react';
import { PrismButton } from './PrismButton';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center max-w-[320px] mx-auto p-12 ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-prism-violet-50 text-prism-violet-200 mb-6">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' }) : icon}
      </div>
      <h2 className="text-h2 text-prism-text mb-2 m-0">{title}</h2>
      <p className="text-body text-prism-text-muted mb-4 m-0">{description}</p>
      {actionLabel && onAction && (
        <PrismButton onClick={onAction} className="mt-4">
          {actionLabel}
        </PrismButton>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
