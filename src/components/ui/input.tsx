import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Input Variant Types
export type InputVariant = 'default' | 'outline' | 'filled' | 'underline';

// Input Size Types
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Input Props Interface
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

// Input Component
const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  error = false,
  helperText,
  ...props
}, ref) => {
  // Variant-specific classes
  const variantClasses = {
    default: 'border-gray-300 focus:border-primary focus:ring-primary',
    outline: 'border-2 border-gray-400 focus:border-primary focus:ring-primary',
    filled: 'bg-gray-100 border-transparent focus:bg-white focus:border-primary',
    underline: 'border-b-2 border-x-0 border-t-0 border-gray-300 focus:border-primary',
  };

  // Size-specific classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
  };

  // Error state classes
  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : '';

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <div className="flex items-center">
        {startIcon && <span className="mr-2">{startIcon}</span>}
        <input
          ref={ref}
          className={cn(
            'block w-full rounded-md shadow-sm transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-opacity-50',
            variantClasses[variant],
            sizeClasses[size],
            errorClasses,
            fullWidth && 'w-full',
            className,
          )}
          {...props}
        />
        {endIcon && <span className="ml-2">{endIcon}</span>}
      </div>
      {helperText && (
        <p
          className={cn(
            'mt-1 text-sm',
            error ? 'text-red-500' : 'text-gray-500',
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };