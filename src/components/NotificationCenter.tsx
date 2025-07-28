import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'project' | 'equipment' | 'weather' | 'system';
  actionUrl?: string;
}

interface NotificationSettings {
  projects: boolean;
  equipment: boolean;
  weather: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Equipment Maintenance Due",
      message: "Paver #3 requires scheduled maintenance within 24 hours",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      category: "equipment"
    },
    {
      id: "2",
      type: "info",
      title: "Weather Update",
      message: "Rain expected tomorrow afternoon - consider rescheduling outdoor work",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      category: "weather"
    },
    {
      id: "3",
      type: "success",
      title: "Project Milestone Completed",
      message: "Highway 101 Resurfacing - Base Layer Application completed ahead of schedule",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      category: "project"
    },
    {
      id: "4",
      type: "error",
      title: "System Alert",
      message: "Database backup failed - manual backup recommended",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      read: false,
      category: "system"
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    projects: true,
    equipment: true,
    weather: true,
    system: true,
    emailNotifications: true,
    pushNotifications: false
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      info: Info,
      error: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      success: "text-success border-success/20 bg-success/5",
      warning: "text-warning border-warning/20 bg-warning/5",
      info: "text-info border-info/20 bg-info/5",
      error: "text-destructive border-destructive/20 bg-destructive/5"
    };
    return colors[type as keyof typeof colors] || "text-muted-foreground";
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications (demo purposes)
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'info' : 'warning',
          title: 'Real-time Update',
          message: 'This is a simulated real-time notification',
          timestamp: new Date(),
          read: false,
          category: 'system'
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => { clearInterval(interval); };
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Notification Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="projects-toggle">Project Updates</Label>
                          <Switch
                            id="projects-toggle"
                            checked={settings.projects}
                            onCheckedChange={(checked) => 
                              { setSettings(prev => ({ ...prev, projects: checked })); }
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="equipment-toggle">Equipment Alerts</Label>
                          <Switch
                            id="equipment-toggle"
                            checked={settings.equipment}
                            onCheckedChange={(checked) => 
                              { setSettings(prev => ({ ...prev, equipment: checked })); }
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="weather-toggle">Weather Updates</Label>
                          <Switch
                            id="weather-toggle"
                            checked={settings.weather}
                            onCheckedChange={(checked) => 
                              { setSettings(prev => ({ ...prev, weather: checked })); }
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-toggle">System Alerts</Label>
                          <Switch
                            id="system-toggle"
                            checked={settings.system}
                            onCheckedChange={(checked) => 
                              { setSettings(prev => ({ ...prev, system: checked })); }
                            }
                          />
                        </div>
                        <hr />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-toggle">Email Notifications</Label>
                          <Switch
                            id="email-toggle"
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => 
                              { setSettings(prev => ({ ...prev, emailNotifications: checked })); }
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-toggle">Push Notifications</Label>
                          <Switch
                            id="push-toggle"
                            checked={settings.pushNotifications}
                            onCheckedChange={(checked) => 
                              { setSettings(prev => ({ ...prev, pushNotifications: checked })); }
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          !notification.read 
                            ? `${getNotificationColor(notification.type)} border-l-4` 
                            : 'bg-muted/30 border-transparent'
                        }`}
                        onClick={() => { markAsRead(notification.id); }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <IconComponent className={`h-4 w-4 mt-0.5 ${
                              notification.type === 'success' ? 'text-success' :
                              notification.type === 'warning' ? 'text-warning' :
                              notification.type === 'error' ? 'text-destructive' :
                              'text-info'
                            }`} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm">{notification.title}</p>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}