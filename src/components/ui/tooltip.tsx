import * as React from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  className?: string;
  children: React.ReactNode;
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const Tooltip = ({ children }: TooltipProps) => {
  return <div>{children}</div>;
};

const TooltipTrigger = ({ children }: TooltipTriggerProps) => {
  return <div>{children}</div>;
};

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };