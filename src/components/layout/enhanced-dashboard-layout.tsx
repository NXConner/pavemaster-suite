import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

import { Logo, CompactLogo } from '../ui/logo';
import { Icon } from '../ui/icon';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  Home,
  Truck,
  Users,
  Calculator,
  MapPin,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & React.RefAttributes<SVGSVGElement>>;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
  { id: 'projects', label: 'Projects', icon: Truck, href: '/projects', badge: 3 },
  { id: 'team', label: 'Team', icon: Users, href: '/team' },
  { id: 'estimates', label: 'Estimates', icon: Calculator, href: '/estimates' },
  { id: 'tracking', label: 'Tracking', icon: MapPin, href: '/tracking' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, href: '/schedule' },
];

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  fullWidth?: boolean;
  variant?: 'default' | 'tactical' | 'minimal';
}

export function EnhancedDashboardLayout({
  children,
  title,
  description,
  actions,
  breadcrumbs,
  fullWidth = false,
  variant = 'default',
}: EnhancedDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); };
  }, []);

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const mainMargin = sidebarOpen ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0';

  return (
    <div className={cn(
      'min-h-screen bg-card',
      variant === 'tactical' && 'bg-slate-950 text-green-400',
      fullScreenMode && 'overflow-hidden',
    )}>
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
        sidebarWidth,
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        variant === 'tactical'
          ? 'bg-slate-900 border-r border-green-400/20'
          : 'bg-card border-r border',
      )}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border">
          {sidebarCollapsed ? (
            <CompactLogo variant={variant === 'tactical' ? 'tactical' : 'default'} />
          ) : (
            <Logo
              variant={variant === 'tactical' ? 'tactical' : 'default'}
              size="default"
              animated
            />
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => { setSidebarCollapsed(!sidebarCollapsed); }}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              sidebarCollapsed && 'opacity-100',
            )}
          >
            <Icon
              icon={sidebarCollapsed ? ChevronRight : ChevronLeft}
              size="sm"
              variant={variant === 'tactical' ? 'tactical' : 'default'}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => { setActiveNav(item.id); }}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                activeNav === item.id
                  ? variant === 'tactical'
                    ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                    : 'bg-primary text-primary-foreground'
                  : variant === 'tactical'
                    ? 'text-green-400/70 hover:bg-green-400/10 hover:text-green-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'hover:scale-[1.02] active:scale-[0.98]',
              )}
            >
              <Icon
                icon={item.icon}
                size="sm"
                variant={
                  activeNav === item.id
                    ? variant === 'tactical' ? 'tactical' : 'primary'
                    : variant === 'tactical' ? 'tactical' : 'muted'
                }
              />

              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      'ml-2 px-2 py-0.5 text-xs rounded-full',
                      variant === 'tactical'
                        ? 'bg-green-400/20 text-green-300'
                        : 'bg-primary text-primary-foreground',
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border">
          <div className={cn(
            'flex items-center space-x-3',
            sidebarCollapsed && 'justify-center',
          )}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              variant === 'tactical'
                ? 'bg-green-400/20 text-green-300'
                : 'bg-primary text-primary-foreground',
            )}>
              <Icon icon={User} size="sm" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className={cn(
                  'text-xs truncate',
                  variant === 'tactical' ? 'text-green-400/60' : 'text-muted-foreground',
                )}>
                  Project Manager
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => { setSidebarOpen(false); }}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300 ease-in-out min-h-screen',
        mainMargin,
      )}>
        {/* Top Header */}
        <header className={cn(
          'sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-4 lg:px-6',
          variant === 'tactical'
            ? 'bg-slate-900/95 backdrop-blur border-green-400/20'
            : 'bg-card/95 backdrop-blur border',
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => { setSidebarOpen(!sidebarOpen); }}
          >
            <Icon icon={Menu} size="sm" />
          </Button>

          {/* Breadcrumbs */}
          {breadcrumbs && (
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-muted-foreground">/</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className={cn(
                        'hover:underline',
                        variant === 'tactical' ? 'text-green-400/70' : 'text-muted-foreground',
                      )}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={variant === 'tactical' ? 'text-green-300' : 'text-foreground'}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          <div className="flex-1" />

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Icon icon={Search} size="sm" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon icon={Bell} size="sm" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon icon={Settings} size="sm" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setFullScreenMode(!fullScreenMode); }}
            >
              <Icon icon={fullScreenMode ? Minimize2 : Maximize2} size="sm" />
            </Button>
          </div>
        </header>

        {/* Page Header */}
        {(title || description || actions) && (
          <div className={cn(
            'border-b px-4 lg:px-6 py-6',
            variant === 'tactical' ? 'border-green-400/20' : 'border',
          )}>
            <div className={cn(
              'flex items-center justify-between',
              !fullWidth && 'max-w-7xl mx-auto',
            )}>
              <div className="space-y-1">
                {title && (
                  <h1 className={cn(
                    'text-3xl font-bold tracking-tight',
                    variant === 'tactical' && 'text-green-300 animate-glow',
                  )}>
                    {title}
                  </h1>
                )}
                {description && (
                  <p className={cn(
                    'text-muted-foreground',
                    variant === 'tactical' && 'text-green-400/60',
                  )}>
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={cn(
          'flex-1 px-4 lg:px-6 py-6',
          !fullWidth && 'max-w-7xl mx-auto',
          fullScreenMode && 'h-[calc(100vh-4rem)] overflow-auto',
        )}>
          <div className="animate-fade-in-blur">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}