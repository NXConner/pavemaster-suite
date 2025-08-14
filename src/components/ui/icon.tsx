import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Icon as LucideIcon } from 'lucide-react';
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const iconVariants = cva(
  'inline-flex items-center justify-center transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        secondary: 'text-secondary-foreground',
        destructive: 'text-destructive',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
        muted: 'text-muted-foreground',
        tactical: 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
      },
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
      },
      animation: {
        none: '',
        spin: 'animate-spin',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        ping: 'animate-ping',
        wiggle: 'animate-[wiggle_1s_ease-in-out_infinite]',
        float: 'animate-[float_3s_ease-in-out_infinite]',
        glow: 'animate-[glow_2s_ease-in-out_infinite_alternate]',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-110 active:scale-95 hover:opacity-80',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
      interactive: false,
    },
  },
);

export interface IconProps extends VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  onClick?: () => void;
  'aria-label'?: string;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, className, variant, size, animation, interactive, onClick }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ variant, size, animation, interactive, className }))}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e: React.KeyboardEvent<SVGSVGElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      />
    );
  },
);

Icon.displayName = 'Icon';

// Predefined icon components for common use cases
export const LoadingIcon = ({ className }: Omit<IconProps, 'icon'>) => {
  return (
    <Icon
      icon={Loader2}
      animation="spin"
      className={className}
    />
  );
};

export const SuccessIcon = ({ className }: Omit<IconProps, 'icon'>) => {
  return (
    <Icon
      icon={CheckCircle2}
      variant="success"
      className={className}
    />
  );
};

export const ErrorIcon = ({ className }: Omit<IconProps, 'icon'>) => {
  return (
    <Icon
      icon={AlertCircle}
      variant="destructive"
      className={className}
    />
  );
};

export const WarningIcon = ({ className }: Omit<IconProps, 'icon'>) => {
  return (
    <Icon
      icon={AlertTriangle}
      variant="warning"
      className={className}
    />
  );
};

export const InfoIcon = ({ className }: Omit<IconProps, 'icon'>) => {
  return (
    <Icon
      icon={Info}
      variant="info"
      className={className}
    />
  );
};

// Custom CSS for animations (to be added to global styles)
export const iconAnimations = `
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  from { filter: drop-shadow(0 0 5px currentColor); }
  to { filter: drop-shadow(0 0 20px currentColor); }
}
`;

export { Icon, iconVariants };