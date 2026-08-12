import React from 'react';

export interface TransactionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  account?: string;
  amount: number;
  statusNode?: React.ReactNode;
  isSelected?: boolean;
}

export const TransactionRow = React.forwardRef<HTMLDivElement, TransactionRowProps>(
  ({ icon, title, subtitle, account, amount, statusNode, isSelected = false, className = '', ...props }, ref) => {
    
    // Format amount
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
    
    const amountStr = amount >= 0 ? `+${formattedAmount}` : `−${formattedAmount}`;
    const amountColorClass = amount > 0 
      ? 'text-prism-success' 
      : amount < 0 
        ? 'text-prism-danger' 
        : 'text-prism-text';

    return (
      <div
        ref={ref}
        className={`
          group relative grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 min-h-[64px] py-3
          border-b border-prism-border bg-prism-white cursor-pointer
          transition-colors duration-card-hover ease-prism-ease hover:bg-prism-surface
          ${isSelected ? 'bg-prism-surface' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-prism-violet-500 rounded-r-full" />
        )}

        {/* Left: Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-prism-violet-50 text-prism-violet-600 ml-4 group-hover:bg-prism-violet-100 transition-colors">
          {icon}
        </div>

        {/* Center: Details */}
        <div className="flex flex-col min-w-0">
          <span className="text-body font-medium text-prism-text truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-small text-prism-text-muted truncate">
              {subtitle}
            </span>
          )}
        </div>

        {/* Right: Account & Amount */}
        <div className="flex items-center gap-4 pr-4">
          {account && (
            <span className="hidden sm:inline-block text-small text-prism-text-muted">
              {account}
            </span>
          )}
          <div className="flex flex-col items-end">
            <span className={`text-body font-mono font-semibold tabular-nums ${amountColorClass}`}>
              {amountStr}
            </span>
            {statusNode && (
              <div className="mt-1">
                {statusNode}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TransactionRow.displayName = 'TransactionRow';
