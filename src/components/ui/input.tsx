import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'ghost' | 'tactical';
  inputSize?: 'sm' | 'default' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    success, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    inputSize = 'default',
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'ghost':
          return 'border-0 bg-transparent focus:bg-accent/50';
        case 'tactical':
          return 'border-green-400/30 bg-slate-900/50 text-green-400 placeholder:text-green-400/50 focus:border-green-400/70 focus:bg-slate-900/70 font-mono';
        default:
          return 'border-input bg-card';
      }
    };
    
    const getSizeStyles = () => {
      switch (inputSize) {
        case 'sm':
          return 'h-8 px-2 text-sm';
        case 'lg':
          return 'h-12 px-4 text-base';
        default:
          return 'h-10 px-3';
      }
    };
    
    const getStateStyles = () => {
      if (error) return 'border-destructive focus:border-destructive';
      if (success) return 'border-green-500 focus:border-green-500';
      return 'focus:border-primary';
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              'flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              getSizeStyles(),
              getVariantStyles(),
              getStateStyles(),
              leftIcon && 'pl-10',
              (rightIcon || isPassword || error || success) && 'pr-10',
              isFocused && 'ring-2 ring-ring ring-offset-2 transform scale-[1.01]',
              className
            )}
            ref={ref}
            disabled={disabled}
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
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {error && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {success && !error && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            {rightIcon && !isPassword && !error && !success && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-destructive animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };