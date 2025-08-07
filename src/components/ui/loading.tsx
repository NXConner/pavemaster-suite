import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2, Truck, Hammer, Wrench } from 'lucide-react';

const loadingVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-primary',
        muted: 'text-muted-foreground',
        tactical: 'text-green-400',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        destructive: 'text-destructive',
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'themed';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({ className, variant, size }: LoadingProps) => (
  <Loader2 className={cn(loadingVariants({ variant, size }), 'animate-spin', className)} />
);

const LoadingDots = ({ className, variant }: LoadingProps) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'w-2 h-2 rounded-full animate-pulse',
          variant === 'tactical' ? 'bg-green-400' : 'bg-primary',
        )}
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '1s',
        }}
      />
    ))}
  </div>
);

const LoadingPulse = ({ className, variant, size }: LoadingProps) => (
  <div
    className={cn(
      'rounded-full animate-pulse',
      loadingVariants({ variant, size }),
      variant === 'tactical' ? 'bg-green-400/30' : 'bg-primary/30',
      className,
    )}
  />
);

const LoadingSkeleton = ({ className, variant }: LoadingProps) => (
  <div className={cn('space-y-3', className)}>
    <div className={cn(
      'h-4 rounded animate-shimmer',
      variant === 'tactical' ? 'bg-green-400/20' : 'bg-muted',
    )} />
    <div className={cn(
      'h-4 rounded animate-shimmer w-3/4',
      variant === 'tactical' ? 'bg-green-400/20' : 'bg-muted',
    )} />
    <div className={cn(
      'h-4 rounded animate-shimmer w-1/2',
      variant === 'tactical' ? 'bg-green-400/20' : 'bg-muted',
    )} />
  </div>
);

const ThemedLoading = ({ className, variant, size }: LoadingProps) => {
  const icons = [Truck, Hammer, Wrench];
  const IconComponent = icons[Math.floor(Math.random() * icons.length)];

  return (
    <div className={cn('relative', className)}>
      <IconComponent
        className={cn(
          loadingVariants({ variant, size }),
          'animate-bounce',
        )}
      />
      <div className={cn(
        'absolute inset-0 rounded-full border-2 border-t-transparent animate-spin',
        variant === 'tactical' ? 'border-green-400/30' : 'border-primary/30',
      )} />
    </div>
  );
};

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant, size, type = 'spinner', text, fullScreen, ...props }, ref) => {
    const loadingComponent = () => {
      switch (type) {
        case 'dots':
          return <LoadingDots className={className} variant={variant} />;
        case 'pulse':
          return <LoadingPulse className={className} variant={variant} size={size} />;
        case 'skeleton':
          return <LoadingSkeleton className={className} variant={variant} />;
        case 'themed':
          return <ThemedLoading className={className} variant={variant} size={size} />;
        default:
          return <LoadingSpinner className={className} variant={variant} size={size} />;
      }
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          fullScreen && 'fixed inset-0 bg-card/80 backdrop-blur-sm z-50',
          className,
        )}
        {...props}
      >
        {loadingComponent()}
        {text && (
          <p className={cn(
            'text-sm animate-pulse',
            variant === 'tactical' ? 'text-green-400 font-mono' : 'text-muted-foreground',
          )}>
            {text}
          </p>
        )}
      </div>
    );

    return content;
  },
);

Loading.displayName = 'Loading';

// Specialized loading components
export const LoadingCard = ({ className, ...props }: LoadingProps) => (
  <div className={cn(
    'rounded-lg border bg-card p-6 shadow-sm animate-pulse',
    className,
  )}>
    <Loading type="skeleton" {...props} />
  </div>
);

export const LoadingButton = ({ className, ...props }: LoadingProps) => (
  <Loading
    type="spinner"
    size="sm"
    className={cn('mr-2', className)}
    {...props}
  />
);

export const LoadingPage = ({ text = 'Loading...', variant = 'default' }: LoadingProps) => (
  <Loading
    fullScreen
    type="themed"
    text={text}
    variant={variant}
    size="xl"
  />
);

export const TacticalLoading = ({ text = 'SYSTEM INITIALIZING...', ...props }: LoadingProps) => (
  <Loading
    variant="tactical"
    type="themed"
    text={text}
    className="animate-tactical-scan"
    {...props}
  />
);

export { Loading, loadingVariants };