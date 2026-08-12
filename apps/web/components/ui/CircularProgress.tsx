import React from 'react';
import { motion } from 'framer-motion';

export interface CircularProgressProps {
  value: number; // Percentage (0-100 or above)
  label?: string;
  size?: 'mobile' | 'desktop';
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value, 
  label, 
  size = 'desktop', 
  className = '' 
}) => {
  const displayValue = Math.min(Math.max(value, 0), 100);
  
  // Size mapping
  const pxSize = size === 'mobile' ? 120 : 160;
  const strokeWidth = 8;
  const radius = (pxSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: pxSize, height: pxSize }}
    >
      <svg
        width={pxSize}
        height={pxSize}
        viewBox={`0 0 ${pxSize} ${pxSize}`}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={pxSize / 2}
          cy={pxSize / 2}
          r={radius}
          fill="none"
          stroke="var(--prism-elevated)"
          strokeWidth={strokeWidth}
          className="text-prism-elevated"
        />
        
        {/* Progress */}
        <motion.circle
          cx={pxSize / 2}
          cy={pxSize / 2}
          r={radius}
          fill="none"
          stroke="var(--prism-violet-500)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }} // 800ms ease-out
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-h2 font-semibold text-prism-text">
          {Math.round(displayValue)}%
        </span>
        {label && (
          <span className="text-xs font-medium text-prism-text-muted mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

CircularProgress.displayName = 'CircularProgress';
