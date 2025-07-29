import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-solid',
  {
    variants: {
      variant: {
        default: 'border-primary border-t-transparent',
        secondary: 'border-secondary border-t-transparent',
        destructive: 'border-destructive border-t-transparent',
        success: 'border-success border-t-transparent',
        glow: 'border-primary border-t-transparent animate-pulse-glow'
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ variant, size, className, label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(spinnerVariants({ variant, size }), className)} />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, label = "Loading...", children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <LoadingSpinner variant="glow" size="lg" label={label} />
        </div>
      )}
    </div>
  );
}