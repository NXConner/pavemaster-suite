import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
        outline: 'border border-input bg-card hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]',
        ghost: 'hover:bg-accent hover:text-accent-foreground transform hover:scale-[1.02] active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
        info: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
        tactical: 'bg-slate-800 text-green-400 border border-green-400/30 hover:bg-slate-700 hover:border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] font-mono transform hover:scale-[1.02] active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, loading, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
        
        {/* Ripple effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span className="absolute inset-0 bg-card/20 translate-x-full transition-transform duration-500 group-hover:translate-x-0 skew-x-12" />
        </span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };