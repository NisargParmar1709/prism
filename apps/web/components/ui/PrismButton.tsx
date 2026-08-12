import React from 'react';
import { Loader2 } from 'lucide-react';

export type PrismButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
export type PrismButtonSize = 'standard' | 'compact';

export interface PrismButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PrismButtonVariant;
  size?: PrismButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const PrismButton = React.forwardRef<HTMLButtonElement, PrismButtonProps>(
  ({ className = '', variant = 'primary', size = 'standard', isLoading = false, leftIcon, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-button text-small font-semibold transition-all duration-card-hover ease-prism-ease focus:outline-none focus:ring-2 focus:ring-prism-violet-500 focus:ring-offset-2';
    
    const sizeClasses = variant === 'text' 
      ? 'h-8 px-2' 
      : size === 'compact' ? 'h-10 px-3' : 'h-10 px-4';

    const variantClasses = {
      primary: 'bg-prism-violet-600 text-prism-white hover:bg-prism-violet-700 active:bg-prism-violet-900 border-none',
      secondary: 'bg-prism-violet-50 text-prism-violet-700 hover:bg-prism-violet-100 active:bg-prism-violet-200 border-none',
      outline: 'bg-transparent text-prism-violet-600 border border-prism-violet-600 hover:bg-prism-violet-50 active:bg-prism-violet-100',
      danger: 'bg-prism-danger-bg text-prism-danger-text border border-prism-danger hover:bg-[#FEE2E2] active:bg-[#FECACA]', // using slight darker red for hover/active
      text: 'bg-transparent text-prism-violet-600 hover:text-prism-violet-700 hover:bg-prism-violet-50 border-none',
    };

    const disabledClasses = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="mr-2 flex items-center justify-center w-4 h-4">{leftIcon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

PrismButton.displayName = 'PrismButton';
