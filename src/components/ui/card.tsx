import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border shadow-sm',
        elevated: 'border-border shadow-md hover:shadow-lg',
        outlined: 'border-2 border-border shadow-none',
        ghost: 'border-transparent shadow-none bg-transparent',
        gradient: 'border-border shadow-lg bg-gradient-to-br from-card to-card/80',
        tactical: 'border-green-400/20 bg-slate-900/50 shadow-[0_0_20px_rgba(34,197,94,0.1)] backdrop-blur-sm',
        glass: 'border-white/20 bg-white/10 shadow-xl backdrop-blur-md',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] hover:border-primary/30',
        false: '',
      },
      animation: {
        none: '',
        fade: 'animate-in fade-in-50 duration-500',
        slide: 'animate-in slide-in-from-bottom-4 duration-500',
        scale: 'animate-in zoom-in-95 duration-300',
        float: 'hover:animate-[float_2s_ease-in-out_infinite]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
      animation: 'none',
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, animation, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, interactive, animation }), className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
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
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Enhanced Card Components
const StatCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }
>(({ title, value, description, icon, trend, className, ...props }, ref) => (
  <Card
    ref={ref}
    variant="elevated"
    interactive
    animation="scale"
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div className={cn(
          'text-xs mt-2 flex items-center',
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          <span className="mr-1">
            {trend.isPositive ? '↗' : '↘'}
          </span>
          {Math.abs(trend.value)}% from last period
        </div>
      )}
    </CardContent>
    
    {/* Background decoration */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
  </Card>
));
StatCard.displayName = 'StatCard';

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  }
>(({ icon, title, description, action, className, ...props }, ref) => (
  <Card
    ref={ref}
    variant="elevated"
    interactive
    animation="slide"
    className={cn('group', className)}
    {...props}
  >
    <CardHeader>
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    {action && (
      <CardFooter>
        {action}
      </CardFooter>
    )}
  </Card>
));
FeatureCard.displayName = 'FeatureCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  FeatureCard,
  cardVariants,
};