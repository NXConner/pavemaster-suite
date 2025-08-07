import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Home,
  Map,
  Users,
  Truck,
  Calculator,
  Settings,
  Bell,
  Menu,
  X,
  Command,
  Activity,
  Thermometer,
  FileText,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  category: 'main' | 'tools' | 'management';
}

const NAV_ITEMS: NavItem[] = [
  // Main Navigation
  { title: 'Dashboard', href: '/', icon: Home, category: 'main' },
  { title: 'Command Center', href: '/overwatch', icon: Command, category: 'main' },
  { title: 'Tracking', href: '/tracking', icon: Map, category: 'main' },
  { title: 'Notifications', href: '/notifications', icon: Bell, badge: '3', category: 'main' },

  // Tools
  { title: 'Calculator', href: '/materials', icon: Calculator, category: 'tools' },
  { title: 'Weather', href: '/weather', icon: Thermometer, category: 'tools' },
  { title: 'Estimates', href: '/estimates', icon: FileText, category: 'tools' },

  // Management
  { title: 'Projects', href: '/projects', icon: Activity, category: 'management' },
  { title: 'Fleet', href: '/fleet', icon: Truck, category: 'management' },
  { title: 'Team', href: '/team', icon: Users, category: 'management' },
  { title: 'Settings', href: '/settings', icon: Settings, category: 'management' },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'main': return 'Navigation';
      case 'tools': return 'Tools';
      case 'management': return 'Management';
      default: return '';
    }
  };

  const groupedItems = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category]!.push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile Navigation Trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setIsOpen(true); }}
        className="fixed top-4 left-4 z-40 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-card/80 backdrop-blur-sm"
            onClick={() => { setIsOpen(false); }}
          />

          {/* Navigation Panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-card border-r border/50 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border/50">
              <h2 className="font-semibold text-lg">PaveMaster Suite</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsOpen(false); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Items */}
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4 space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {getCategoryTitle(category)}
                    </h3>

                    <div className="space-y-1">
                      {items.map((item) => {
                        const isActive = location.pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => { setIsOpen(false); }}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                              ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }
                            `}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t border/50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors
                  ${isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 text-xs h-4 w-4 flex items-center justify-center p-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}