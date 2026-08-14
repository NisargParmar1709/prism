import React from 'react';

export interface PrismInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PrismInput = React.forwardRef<HTMLInputElement, PrismInputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 text-small text-prism-text">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            h-10 px-3 rounded-input border bg-prism-white text-prism-text text-body placeholder:text-prism-text-muted
            transition-all duration-card-hover ease-prism-ease focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error 
              ? 'border-prism-danger focus:border-prism-danger focus:ring-[#FECACA]' 
              : 'border-prism-border focus:border-prism-violet-500 focus:ring-prism-violet-100 hover:border-prism-border-strong'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-prism-surface
            ${className}
          `}
          {...props}
        />
        {(error || helperText) && (
          <p className={`mt-1 text-xs ${error ? 'text-prism-danger' : 'text-prism-text-muted'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

PrismInput.displayName = 'PrismInput';
