import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, Search, User, Settings } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export const AppLayout = ({
  children,
  className,
  sidebar,
  header,
  footer,
  sidebarCollapsed = false,
  onSidebarToggle,
}: AppLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="h-full">
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Layout */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside
            className={cn(
              'hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-card',
              sidebarCollapsed ? 'lg:w-16' : 'lg:w-72',
              'transition-all duration-300 ease-in-out'
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          {header ? (
            header
          ) : (
            <AppHeader
              onMobileMenuClick={() => setIsMobileOpen(true)}
              onSidebarToggle={onSidebarToggle}
              showSidebarToggle={!!sidebar}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {children}
              </div>
            </ScrollArea>
          </main>

          {/* Footer */}
          {footer && (
            <footer className="border-t border-border bg-card">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

// App Header Component
interface AppHeaderProps {
  onMobileMenuClick?: () => void;
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
  title?: string;
  actions?: React.ReactNode;
  search?: boolean;
  notifications?: boolean;
  user?: boolean;
  className?: string;
}

export const AppHeader = ({
  onMobileMenuClick,
  onSidebarToggle,
  showSidebarToggle = false,
  title,
  actions,
  search = true,
  notifications = true,
  user = true,
  className,
}: AppHeaderProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open mobile menu</span>
        </Button>

        {/* Desktop Sidebar Toggle */}
        {showSidebarToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}

        {/* Title */}
        {title && (
          <h1 className="text-lg font-semibold text-foreground">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        {search && (
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        )}

        {/* Custom Actions */}
        {actions}

        {/* Notifications */}
        {notifications && (
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        {/* Settings */}
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>

        {/* User Menu */}
        {user && (
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
            <span className="sr-only">User menu</span>
          </Button>
        )}
      </div>
    </header>
  );
};

// Content Container Components
interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ContentContainer = React.forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ className, maxWidth = 'full', padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto w-full',
        {
          'max-w-sm': maxWidth === 'sm',
          'max-w-md': maxWidth === 'md',
          'max-w-lg': maxWidth === 'lg',
          'max-w-xl': maxWidth === 'xl',
          'max-w-2xl': maxWidth === '2xl',
          'max-w-none': maxWidth === 'full',
        },
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
      {...props}
    />
  )
);
ContentContainer.displayName = 'ContentContainer';

export const PageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    description?: string;
    actions?: React.ReactNode;
  }
>(({ className, title, description, actions, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between pb-6', className)}
    {...props}
  >
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
));
PageHeader.displayName = 'PageHeader';

export const PageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-6', className)}
    {...props}
  />
));
PageContent.displayName = 'PageContent';