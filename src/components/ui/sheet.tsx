import * as React from 'react';
import { cn } from '../../lib/utils';

interface SheetProps {
  children: React.ReactNode;
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface SheetContentProps {
  className?: string;
  children: React.ReactNode;
}

const Sheet = ({ children }: SheetProps) => {
  return <div>{children}</div>;
};

const SheetTrigger = ({ children }: SheetTriggerProps) => {
  return <div>{children}</div>;
};

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetContent, SheetTrigger };