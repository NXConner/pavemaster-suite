import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, BarChart3, Settings, Menu, X, Truck, Users, 
  ClipboardList, DollarSign, Brain, Smartphone, Bell, Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mobileNavigation = [
  { name: 'Dashboard', href: '/', icon: Home, badge: null },
  { name: 'Projects', href: '/projects', icon: ClipboardList, badge: '3' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
  { name: 'Equipment', href: '/equipment', icon: Truck, badge: '2' },
  { name: 'Team', href: '/team', icon: Users, badge: null },
  { name: 'Financial', href: '/financial', icon: DollarSign, badge: null },
  { name: 'Mobile Tools', href: '/mobile', icon: Smartphone, badge: 'NEW' },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b md:hidden sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">PM</span>
            </div>
            <span className="text-lg font-bold text-gray-900">PaveMaster</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            {mobileNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant={item.badge === 'NEW' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="border-t p-4 mt-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">JD</span>
              </div>
              <div>
                <div className="font-medium">John Doe</div>
                <div className="text-sm text-gray-500">Project Manager</div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              Sign Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="flex items-center justify-around py-2">
          {mobileNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center space-y-1 px-2 py-1 min-w-0 relative',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate">{item.name}</span>
                
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                    {item.badge === 'NEW' ? '' : item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}