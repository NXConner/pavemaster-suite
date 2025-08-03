import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Wifi, 
  Battery, 
  MapPin, 
  Camera,
  Bell,
  Settings,
  User,
  Menu
} from 'lucide-react';

interface MobileCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export function MobileCard({ title, value, icon, trend, color = "text-primary" }: MobileCardProps) {
  return (
    <Card className="touch-friendly hover:scale-105 transition-transform">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color.includes('text-') ? 'bg-primary/10' : 'bg-muted'}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <p className="text-xs text-green-600">{trend}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: <User className="h-5 w-5" />, label: 'Profile', active: false },
    { icon: <MapPin className="h-5 w-5" />, label: 'Projects', active: true },
    { icon: <Camera className="h-5 w-5" />, label: 'Photos', active: false },
    { icon: <Bell className="h-5 w-5" />, label: 'Alerts', active: false },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', active: false },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">ISAC-OS Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            <Battery className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              size="sm"
              className="flex-col h-12 text-xs gap-1"
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Slide-out Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-orange-500 font-bold text-sm">IS</span>
                </div>
                <span className="font-bold">ISAC-OS Mobile</span>
              </div>
              
              {/* Menu Items */}
              <div className="space-y-2">
                {[
                  'Dashboard', 'Projects', 'Team', 'Equipment', 'Safety', 
                  'Finance', 'Weather', 'Analytics', 'Settings'
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileStatusIndicators() {
  const [connectivity] = useState({
    wifi: true,
    cellular: 85,
    battery: 78,
    gps: true,
    sync: 'online'
  });

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <Wifi className={`h-3 w-3 ${connectivity.wifi ? 'text-green-500' : 'text-red-500'}`} />
        <span className="text-muted-foreground">WiFi</span>
      </div>
      
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((bar) => (
            <div
              key={bar}
              className={`w-0.5 h-2 rounded-sm ${
                bar <= Math.ceil(connectivity.cellular / 20) 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-muted-foreground">{connectivity.cellular}%</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Battery className="h-3 w-3" />
        <span className="text-muted-foreground">{connectivity.battery}%</span>
      </div>
      
      <Badge 
        variant={connectivity.sync === 'online' ? 'default' : 'secondary'}
        className="text-xs h-4"
      >
        {connectivity.sync.toUpperCase()}
      </Badge>
    </div>
  );
}

export function MobileDashboardGrid() {
  const dashboardItems = [
    { title: 'Active Projects', value: 8, icon: <MapPin className="h-5 w-5" />, trend: '+2 this week' },
    { title: 'Team Members', value: 12, icon: <User className="h-5 w-5" />, trend: 'All active' },
    { title: 'Equipment Status', value: '94%', icon: <Settings className="h-5 w-5" />, trend: '+3% uptime' },
    { title: 'Safety Score', value: '98%', icon: <Badge className="h-5 w-5" />, trend: 'Excellent' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {dashboardItems.map((item, index) => (
        <MobileCard
          key={index}
          title={item.title}
          value={item.value}
          icon={item.icon}
          trend={item.trend}
        />
      ))}
    </div>
  );
}

export function MobileQuickActions() {
  const quickActions = [
    { label: 'New Project', icon: <MapPin className="h-4 w-4" />, color: 'bg-blue-500' },
    { label: 'Add Photo', icon: <Camera className="h-4 w-4" />, color: 'bg-green-500' },
    { label: 'Safety Report', icon: <Badge className="h-4 w-4" />, color: 'bg-orange-500' },
    { label: 'Emergency', icon: <Bell className="h-4 w-4" />, color: 'bg-red-500' },
  ];

  return (
    <div className="p-4">
      <h3 className="font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-16 flex-col gap-2"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white`}>
              {action.icon}
            </div>
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}