import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statusIndicatorVariants = cva(
  'inline-flex items-center gap-2 text-sm font-medium transition-all duration-300',
  {
    variants: {
      status: {
        online: 'text-success',
        offline: 'text-destructive',
        away: 'text-warning',
        busy: 'text-warning',
        idle: 'text-muted-foreground'
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      status: 'online',
      size: 'default'
    }
  }
);

const dotVariants = cva(
  'rounded-full transition-all duration-300',
  {
    variants: {
      status: {
        online: 'bg-success animate-pulse-glow',
        offline: 'bg-destructive',
        away: 'bg-warning animate-pulse',
        busy: 'bg-warning animate-pulse',
        idle: 'bg-muted-foreground'
      },
      size: {
        sm: 'w-2 h-2',
        default: 'w-3 h-3',
        lg: 'w-4 h-4'
      }
    },
    defaultVariants: {
      status: 'online',
      size: 'default'
    }
  }
);

interface StatusIndicatorProps extends VariantProps<typeof statusIndicatorVariants> {
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size, 
  label, 
  showDot = true, 
  className 
}: StatusIndicatorProps) {
  return (
    <div className={cn(statusIndicatorVariants({ status, size }), className)}>
      {showDot && (
        <div className={dotVariants({ status, size })} />
      )}
      {label && <span>{label}</span>}
    </div>
  );
}