'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  isInverseColors?: boolean; // For when increase is bad (e.g. Spent)
}

export function StatCard({ label, value, change, changeType, isInverseColors }: StatCardProps) {
  const getChangeColor = () => {
    if (!changeType || changeType === 'neutral') return 'text-prism-text-muted';
    
    if (changeType === 'increase') {
      return isInverseColors ? 'text-prism-danger' : 'text-prism-success';
    }
    
    if (changeType === 'decrease') {
      return isInverseColors ? 'text-prism-success' : 'text-prism-danger';
    }
  };

  const getChangeIcon = () => {
    if (!changeType || changeType === 'neutral') return <Minus className="w-3 h-3" />;
    return changeType === 'increase' ? (
      <ArrowUpRight className="w-3 h-3" />
    ) : (
      <ArrowDownRight className="w-3 h-3" />
    );
  };

  return (
    <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card transition-shadow hover:shadow-md">
      <h3 className="text-small font-medium text-prism-text-muted mb-2">
        {label}
      </h3>
      <div className="flex items-baseline justify-between">
        <p className="text-h1 font-mono tracking-tight text-prism-text">
          {value}
        </p>
        
        {change && (
          <div className={`flex items-center text-xs font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="ml-1">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
