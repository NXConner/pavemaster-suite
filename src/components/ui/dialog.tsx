import * as React from 'react';
import { cn } from '../../lib/utils';

interface DialogProps {
  children: React.ReactNode;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

const Dialog = ({ children }: DialogProps) => {
  return <div>{children}</div>;
};

const DialogTrigger = ({ children }: DialogTriggerProps) => {
  return <div>{children}</div>;
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-lg duration-200 sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, children }: DialogHeaderProps) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
      {children}
    </div>
  );
};

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  ),
);
DialogTitle.displayName = 'DialogTitle';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger };