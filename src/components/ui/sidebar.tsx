
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  Wrench,
  Users,
  BarChart3,
  Settings,
  MapPin,
  FileText,
  Calendar,
  Truck,
  Bot,
  Eye,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Equipment', href: '/equipment', icon: Wrench },
  { name: 'Fleet', href: '/fleet', icon: Truck },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'OverWatch', href: '/overwatch', icon: Eye },
  { name: 'Estimates', href: '/estimates', icon: FileText },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'GPS Tracking', href: '/tracking', icon: MapPin },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn(
      'flex h-full flex-col bg-sidebar border-r border-sidebar-border',
      isCollapsed ? 'w-16' : 'w-64',
      'transition-all duration-300 ease-in-out',
      className,
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sidebar-foreground">PaveMaster</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  location.pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  isCollapsed ? 'px-2' : 'px-3',
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">U</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                User Name
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                user@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}