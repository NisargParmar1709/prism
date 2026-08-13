import React, { useState } from 'react';

export interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
}

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className = '', value = '', onChange, error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [isFocused, setIsFocused] = useState(false);
    
    // We handle custom string input formatting if needed, but for now just pass it through
    // Could integrate currency.js here if formatting is required in the future.
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers and optionally one decimal point
      const val = e.target.value.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) return; // Prevent multiple decimal points
      if (parts.length === 2 && parts[1].length > 2) return; // Prevent more than 2 decimal places
      if (onChange) {
        onChange(val);
      }
    };

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 text-small text-prism-text">
            {label}
          </label>
        )}
        <div 
          className={`
            relative flex items-center h-[56px] px-4 rounded-input border bg-prism-white
            transition-all duration-card-hover ease-prism-ease
            ${error 
              ? 'border-prism-danger ring-2 ring-[#FECACA]' 
              : isFocused 
                ? 'border-prism-violet-500 ring-2 ring-prism-violet-100' 
                : 'border-prism-border hover:border-prism-border-strong'
            }
            ${props.disabled ? 'opacity-50 cursor-not-allowed bg-prism-surface' : ''}
            ${className}
          `}
        >
          <span className="text-[20px] text-prism-text-muted select-none flex-shrink-0">
            ₹
          </span>
          <input
            id={inputId}
            ref={ref}
            type="text"
            inputMode="decimal"
            className="
              flex-1 w-full bg-transparent border-none outline-none 
              text-right text-h2 font-mono tabular-nums text-prism-text
              placeholder:text-prism-text-muted
            "
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-prism-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AmountInput.displayName = 'AmountInput';
