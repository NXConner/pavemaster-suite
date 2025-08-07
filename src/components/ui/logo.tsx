import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const logoVariants = cva(
  'flex items-center font-bold transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        white: 'text-white',
        tactical: 'text-green-400 animate-glow font-mono',
        gradient: 'bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent',
      },
      size: {
        sm: 'text-lg gap-2',
        default: 'text-xl gap-2',
        lg: 'text-2xl gap-3',
        xl: 'text-3xl gap-3',
        '2xl': 'text-4xl gap-4',
      },
      animated: {
        true: 'hover:scale-105 transform',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animated: false,
    },
  },
);

export interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  href?: string;
}

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    className={cn('w-8 h-8', className)}
    fill="currentColor"
  >
    {/* Road/Asphalt base */}
    <rect x="4" y="28" width="32" height="8" rx="2" className="opacity-80" />

    {/* Construction elements */}
    <rect x="8" y="20" width="6" height="8" rx="1" className="opacity-90" />
    <rect x="16" y="18" width="8" height="10" rx="1" />
    <rect x="26" y="22" width="6" height="6" rx="1" className="opacity-90" />

    {/* Top accent - represents quality/precision */}
    <rect x="12" y="8" width="16" height="2" rx="1" className="opacity-60" />
    <rect x="14" y="12" width="12" height="2" rx="1" className="opacity-70" />

    {/* Center diamond - premium quality indicator */}
    <polygon points="20,4 24,8 20,12 16,8" className="animate-pulse" />
  </svg>
);

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className, variant, size, animated, showIcon = true, showText = true, href, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn(logoVariants({ variant, size, animated }), className)}
        {...props}
      >
        {showIcon && (
          <LogoIcon className={cn(
            size === 'sm' && 'w-6 h-6',
            size === 'default' && 'w-8 h-8',
            size === 'lg' && 'w-10 h-10',
            size === 'xl' && 'w-12 h-12',
            size === '2xl' && 'w-16 h-16',
          )} />
        )}
        {showText && (
          <span className="tracking-tight">
            <span className="font-black">Pave</span>
            <span className="font-light">Master</span>
            {variant === 'tactical' && (
              <span className="ml-1 text-xs opacity-70">SUITE</span>
            )}
          </span>
        )}
      </div>
    );

    if (href) {
      return (
        <a href={href} className="no-underline">
          {content}
        </a>
      );
    }

    return content;
  },
);

Logo.displayName = 'Logo';

// Specialized logo variants
export const TacticalLogo = ({ className, ...props }: Omit<LogoProps, 'variant'>) => (
  <Logo variant="tactical" className={cn('animate-tactical-scan', className)} {...props} />
);

export const GradientLogo = ({ className, ...props }: Omit<LogoProps, 'variant'>) => (
  <Logo variant="gradient" animated className={className} {...props} />
);

export const CompactLogo = ({ className, ...props }: LogoProps) => (
  <Logo
    size="sm"
    showText={false}
    className={cn('w-fit', className)}
    {...props}
  />
);

export { Logo, logoVariants };