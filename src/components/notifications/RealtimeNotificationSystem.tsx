import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Settings,
  Filter,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'tactical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  persistent?: boolean;
  soundAlert?: boolean;
}

interface NotificationSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
  categories: Record<string, boolean>;
  autoRead: boolean;
  compactView: boolean;
  maxNotifications: number;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'tactical',
    title: 'Mission Status Update',
    message: 'Project Alpha-7 has reached 85% completion. All units operating within normal parameters.',
    timestamp: new Date(Date.now() - 300000),
    read: false,
    priority: 'high',
    category: 'Operations',
    actions: [
      { label: 'View Details', action: 'view-project', variant: 'default' },
      { label: 'Acknowledge', action: 'acknowledge', variant: 'outline' }
    ],
    persistent: true,
    soundAlert: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'Equipment Alert',
    message: 'Vehicle Unit-3 is showing elevated temperature readings. Recommend immediate inspection.',
    timestamp: new Date(Date.now() - 600000),
    read: false,
    priority: 'critical',
    category: 'Equipment',
    actions: [
      { label: 'Dispatch Team', action: 'dispatch', variant: 'default' },
      { label: 'View Diagnostics', action: 'diagnostics', variant: 'outline' }
    ],
    persistent: true,
    soundAlert: true
  },
  {
    id: '3',
    type: 'success',
    title: 'Quality Control Passed',
    message: 'Section B-12 has passed all quality control checks. Ready for next phase.',
    timestamp: new Date(Date.now() - 900000),
    read: true,
    priority: 'medium',
    category: 'Quality',
    persistent: false
  },
  {
    id: '4',
    type: 'info',
    title: 'Weather Update',
    message: 'Current conditions are optimal for operations. Temperature: 72°F, Humidity: 45%',
    timestamp: new Date(Date.now() - 1200000),
    read: true,
    priority: 'low',
    category: 'Weather',
    persistent: false
  }
];

export function RealtimeNotificationSystem() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    pushEnabled: true,
    categories: {
      'Operations': true,
      'Equipment': true,
      'Quality': true,
      'Weather': true,
      'System': true
    },
    autoRead: false,
    compactView: false,
    maxNotifications: 50
  });
  const [filter, setFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications
      if (Math.random() < 0.1) {
        const newNotification: NotificationItem = {
          id: `notif-${Date.now()}`,
          type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as any,
          title: 'Real-time Update',
          message: `System event detected at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date(),
          read: false,
          priority: 'medium',
          category: 'System',
          persistent: false
        };
        
        addNotification(newNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [settings]);

  const addNotification = useCallback((notification: NotificationItem) => {
    setNotifications(prev => {
      const updated = [notification, ...prev];
      
      // Limit notifications based on settings
      if (updated.length > settings.maxNotifications) {
        return updated.slice(0, settings.maxNotifications);
      }
      
      return updated;
    });

    // Show toast notification
    if (settings.pushEnabled) {
      const icon = getNotificationIcon(notification.type);
      toast(notification.title, {
        description: notification.message,
        icon: icon
      });
    }

    // Play sound
    if (settings.soundEnabled && notification.soundAlert) {
      playNotificationSound(notification.type);
    }
  }, [settings]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const playNotificationSound = (_notificationType: string) => {
    // In a real implementation, you would play different sounds based on type
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore errors if audio can't play
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'tactical': return <Bell className="h-4 w-4 text-orange-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 border-red-500/50';
      case 'high': return 'text-orange-500 border-orange-500/50';
      case 'medium': return 'text-yellow-500 border-yellow-500/50';
      case 'low': return 'text-blue-500 border-blue-500/50';
      default: return 'text-muted-foreground border/50';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    if (filter === 'critical') return notif.priority === 'critical';
    return notif.category.toLowerCase() === filter.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Real-time Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {showSettings && (
          <CardContent className="border-t border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sound Alerts</label>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Push Notifications</label>
                  <Switch
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, pushEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto-mark as Read</label>
                  <Switch
                    checked={settings.autoRead}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, autoRead: checked }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Categories</h4>
                {Object.entries(settings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <label className="text-sm">{category}</label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {['all', 'unread', 'critical', 'operations', 'equipment', 'quality'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
            className="whitespace-nowrap"
          >
            <Filter className="h-3 w-3 mr-1" />
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${notification.read 
                      ? 'bg-surface/30 border/30' 
                      : 'bg-primary/5 border-primary/30 shadow-sm'
                    }
                    ${getPriorityColor(notification.priority)}
                  `}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                        <Badge 
                          variant={notification.priority === 'critical' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleString()}
                      </p>
                      
                      {notification.actions && (
                        <div className="flex gap-2 pt-2">
                          {notification.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant={action.variant || 'outline'}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle action
                                toast.success(`Action: ${action.label}`);
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}