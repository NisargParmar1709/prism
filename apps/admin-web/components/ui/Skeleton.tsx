import React from 'react';

export interface SkeletonProps {
  variant?: 'card' | 'text' | 'circle';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', className = '' }) => {
  const baseClass = 'bg-prism-elevated animate-skeleton-pulse';
  
  let variantClass = '';
  switch (variant) {
    case 'card':
      variantClass = 'rounded-card w-full h-32';
      break;
    case 'text':
      variantClass = 'rounded-sm w-full h-4';
      break;
    case 'circle':
      variantClass = 'rounded-full w-12 h-12';
      break;
  }

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
  );
};

Skeleton.displayName = 'Skeleton';
