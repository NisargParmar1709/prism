import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  value: number; // Percentage (0-100 or above)
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  // Cap percentage for rendering purposes at 100% so it doesn't overflow, 
  // though logically it can be > 100.
  const displayValue = Math.min(Math.max(value, 0), 100);

  let fillColorClass = 'bg-prism-violet-500';
  if (value >= 100) {
    fillColorClass = 'bg-prism-danger';
  } else if (value >= 80) {
    fillColorClass = 'bg-prism-warning';
  }

  return (
    <div className={`h-2 w-full bg-prism-elevated rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${displayValue}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }} // 500ms ease-out
        className={`h-full rounded-full ${fillColorClass}`}
      />
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
