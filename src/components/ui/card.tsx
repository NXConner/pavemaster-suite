import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground transition-all duration-300 group',
  {
    variants: {
      variant: {
        default: 'border shadow-sm card-enhanced',
        elevated: 'border shadow-md hover:shadow-lg card-enhanced',
        outlined: 'border-2 border shadow-none card-enhanced',
        ghost: 'border-transparent shadow-none bg-transparent',
        gradient: 'border shadow-lg bg-gradient-to-br from-card to-card/80 card-enhanced',
        tactical: 'border-green-400/20 bg-slate-900/50 shadow-[0_0_20px_rgba(34,197,94,0.1)] backdrop-blur-sm tactical-glow',
        glass: 'glass-morphism card-enhanced',
        holographic: 'holographic card-enhanced',
        floating: 'border shadow-lg hover:shadow-2xl transform hover:-translate-y-2 card-enhanced',
        neon: 'border-primary/30 bg-card shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] card-enhanced',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] interactive-hover',
        false: '',
      },
      animation: {
        none: '',
        fade: 'animate-in fade-in-50 duration-500',
        slide: 'animate-in slide-in-from-bottom-4 duration-500',
        scale: 'animate-in zoom-in-95 duration-300',
        float: 'hover:animate-[float_2s_ease-in-out_infinite]',
        glow: 'animate-[pulse-glow_3s_ease-in-out_infinite]',
        shimmer: 'shimmer',
      },
      parallax: {
        none: '',
        subtle: 'transform-gpu perspective-1000',
        strong: 'transform-gpu perspective-1000',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
      animation: 'none',
      parallax: 'none',
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  asChild?: boolean;
  parallax?: 'none' | 'subtle' | 'strong';
  tilt?: boolean;
  glow?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    size,
    interactive,
    animation,
    parallax = 'none',
    tilt = false,
    glow = false,
    onHover,
    onLeave,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    children,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      onHover?.();
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      setMousePosition({ x: 0, y: 0 });
      onLeave?.();
      onMouseLeave?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || (!tilt && parallax === 'none')) { return; }

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / (parallax === 'strong' ? 10 : 20);
      const rotateY = (centerX - x) / (parallax === 'strong' ? 10 : 20);

      setMousePosition({ x: rotateX, y: rotateY });
      onMouseMove?.(e);
    };

    const transformStyle = (tilt || parallax !== 'none') && isHovered
      ? {
          transform: `perspective(1000px) rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg) translateZ(10px)`,
        }
      : {};

    return (
      <div
        ref={ref || cardRef}
        className={cn(cardVariants({ variant, size, interactive, animation, parallax }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          ...transformStyle,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        }}
        {...props}
      >
        {/* Glow Effect */}
        {glow && (
          <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm" />
        )}

        {/* Content Container */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Interactive Light Effect */}
        {(tilt || parallax !== 'none') && (
          <div
            className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.y * 2}% ${50 - mousePosition.x * 2}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          />
        )}

        {/* Tactical Scan Line for tactical variant */}
        {variant === 'tactical' && isHovered && (
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute top-0 left-0 w-full h-px bg-green-400/50 animate-[tactical-scan_2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Holographic Noise for holographic variant */}
        {variant === 'holographic' && (
          <div className="absolute inset-0 rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIiIGhlaWdodD0iMiI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20" />
        )}
      </div>
    );
  },
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { gradient?: boolean }
>(({ className, gradient = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-6',
      gradient && 'bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg',
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
    glow?: boolean;
  }
>(({ className, gradient = false, glow = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight transition-colors',
      gradient && 'text-gradient',
      glow && 'drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground transition-colors group-hover:text-foreground/80', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { padding?: boolean }
>(({ className, padding = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(padding ? 'p-6 pt-0' : '', 'transition-all duration-300', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
    glassmorphism?: boolean;
  }
>(({ className, gradient = false, glassmorphism = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-0 transition-all duration-300',
      gradient && 'bg-gradient-to-r from-primary/5 to-secondary/5 rounded-b-lg mt-6 pt-6',
      glassmorphism && 'glass-morphism mt-6 pt-6 rounded-b-lg',
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Enhanced Card with built-in loading states
const LoadingCard = React.forwardRef<
  HTMLDivElement,
  CardProps & { loading?: boolean }
>(({ loading = false, children, className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(loading && 'shimmer', className)}
    {...props}
  >
    {loading ? (
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded shimmer" />
        <div className="h-4 bg-muted rounded w-3/4 shimmer" />
        <div className="h-4 bg-muted rounded w-1/2 shimmer" />
      </div>
    ) : (
      children
    )}
  </Card>
));
LoadingCard.displayName = 'LoadingCard';

// Animated Card Container for lists
const AnimatedCardContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    staggerDelay?: number;
    children: React.ReactNode;
  }
>(({ children, staggerDelay = 100, className, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => { observer.disconnect(); };
  }, []);

  return (
    <div
      ref={ref || containerRef}
      className={cn('space-y-4', className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8',
          )}
          style={{
            transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});
AnimatedCardContainer.displayName = 'AnimatedCardContainer';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  LoadingCard,
  AnimatedCardContainer,
};