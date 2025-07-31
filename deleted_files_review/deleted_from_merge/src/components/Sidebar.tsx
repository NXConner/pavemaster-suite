import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  LayoutDashboard,
  FolderOpen,
  Truck,
  Users,
  Cpu,
  BarChart3,
  Cloud,
  Brain,
  Shield,
  Blocks,
  Calculator,
  UserCheck,
  DollarSign,
  Smartphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  Building,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'admin', 'manager', 'employee'] },
  { icon: FolderOpen, label: 'Projects', path: '/projects', roles: ['super_admin', 'admin', 'manager', 'employee'] },
  { icon: Truck, label: 'Equipment', path: '/equipment', roles: ['super_admin', 'admin', 'manager'] },
  { icon: Users, label: 'Team', path: '/team', roles: ['super_admin', 'admin', 'manager'] },
  { icon: Calculator, label: 'Estimates', path: '/estimates', roles: ['super_admin', 'admin', 'manager'] },
  { icon: UserCheck, label: 'CRM', path: '/crm', roles: ['super_admin', 'admin', 'manager'] },
  { icon: DollarSign, label: 'Financial', path: '/financial', roles: ['super_admin', 'admin'] },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['super_admin', 'admin', 'manager'] },
  { icon: Cloud, label: 'Weather', path: '/weather', roles: ['super_admin', 'admin', 'manager', 'employee'] },
  { icon: Cpu, label: 'IoT Hub', path: '/iot', roles: ['super_admin', 'admin'] },
  { icon: Brain, label: 'Intelligence', path: '/intelligence', roles: ['super_admin', 'admin'] },
  { icon: Shield, label: 'Security', path: '/security', roles: ['super_admin'] },
  { icon: Blocks, label: 'Blockchain', path: '/blockchain', roles: ['super_admin'] },
  { icon: Smartphone, label: 'Mobile', path: '/mobile', roles: ['super_admin', 'admin', 'manager'] },
  { icon: Zap, label: 'Integrations', path: '/integrations', roles: ['super_admin', 'admin'] },
  { icon: ShieldCheck, label: 'Safety', path: '/safety', roles: ['super_admin', 'admin', 'manager'] },
  { icon: FileText, label: 'Reports', path: '/reports', roles: ['super_admin', 'admin', 'manager'] },
  { icon: Building, label: 'Enterprise', path: '/enterprise', roles: ['super_admin'] },
  { icon: Sparkles, label: 'Advanced AI', path: '/advanced-ai', roles: ['super_admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['super_admin', 'admin', 'manager', 'employee'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { wallpaper } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className={cn(
      "h-screen bg-background/95 backdrop-blur-md border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      wallpaper && "bg-background/80"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">PaveMaster</span>
                <span className="text-xs text-muted-foreground">Suite</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-2">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "px-2" : "px-4",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
              collapsed ? "px-2" : "px-4"
            )}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}