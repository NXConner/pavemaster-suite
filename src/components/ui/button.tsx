import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        outline: 'border border-input bg-card hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] interactive-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        ghost: 'hover:bg-accent hover:text-accent-foreground transform hover:scale-[1.02] active:scale-[0.98] interactive-hover',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        info: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] btn-enhanced',
        tactical: 'bg-slate-800 text-green-400 border border-green-400/30 hover:bg-slate-700 hover:border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] font-mono transform hover:scale-[1.02] active:scale-[0.98] tactical-glow',
        glass: 'glass-morphism text-foreground hover:bg-white/20 transform hover:scale-[1.02] active:scale-[0.98]',
        holographic: 'holographic text-foreground transform hover:scale-[1.02] active:scale-[0.98]',
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
      animation: {
        none: '',
        float: 'animate-[float_3s_ease-in-out_infinite]',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        glow: 'animate-[pulse-glow_2s_infinite]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
      animation: 'none',
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
  ripple?: boolean;
  animation?: 'none' | 'float' | 'pulse' | 'bounce' | 'glow';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    loading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ripple = true,
    animation,
    onClick,
    ...props
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || !buttonRef.current) { return; }

      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      const newRipple = { id: Date.now(), x, y };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      onClick?.(event);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
      if (disabled || loading) { return; }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Synthesize a click
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    return (
      <button
        ref={ref || buttonRef}
        className={cn(buttonVariants({ variant, size, loading, animation, className }))}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}

        {/* Left Icon */}
        {!loading && leftIcon && (
          <span className="mr-2 transition-transform group-hover:scale-110">{leftIcon}</span>
        )}

        {/* Content */}
        <span className="relative z-10">{children}</span>

        {/* Right Icon */}
        {!loading && rightIcon && (
          <span className="ml-2 transition-transform group-hover:scale-110">{rightIcon}</span>
        )}

        {/* Ripple Effects */}
        {ripple && ripples.map(({ id, x, y }) => (
          <span
            key={id}
            className="absolute pointer-events-none select-none rounded-full bg-white/30 animate-ping"
            style={{
              left: x,
              top: y,
              width: '20px',
              height: '20px',
              transform: 'scale(0)',
              animation: 'ripple 0.6s linear',
            }}
          />
        ))}

        {/* Enhanced Shine Effect */}
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%] skew-x-12" />
        </span>

        {/* Tactical Overlay for tactical variant */}
        {variant === 'tactical' && (
          <span className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-green-400/10 to-green-400/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        {/* Glow Effect for enhanced variants */}
        {(variant === 'default' || variant === 'gradient' || variant === 'tactical') && (
          <span className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm" />
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

// Add the ripple animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export { Button, buttonVariants };