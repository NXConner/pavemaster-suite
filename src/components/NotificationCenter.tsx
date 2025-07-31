import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Clock,
  User,
  Calendar,
  DollarSign,
  Wrench,
  Shield,
  Camera,
  MapPin,
  Trash2,
  Settings,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'project' | 'team' | 'equipment' | 'finance' | 'safety' | 'photo' | 'schedule' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-priority'>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Simulate real-time notifications
    const interval = setInterval(() => {
      generateMockNotification();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = () => {
    // Mock notifications - in real implementation, fetch from backend
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        category: 'equipment',
        title: 'Maintenance Due',
        message: 'Caterpillar AP655F requires scheduled maintenance in 15 engine hours',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/equipment',
        actionLabel: 'View Equipment'
      },
      {
        id: '2',
        type: 'success',
        category: 'project',
        title: 'Project Completed',
        message: 'Grace Methodist Sealcoating project has been marked as completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/projects',
        actionLabel: 'View Project'
      },
      {
        id: '3',
        type: 'error',
        category: 'safety',
        title: 'Safety Incident Reported',
        message: 'New safety incident reported at First Baptist Church site',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        read: true,
        priority: 'urgent',
        actionUrl: '/safety',
        actionLabel: 'View Incident'
      },
      {
        id: '4',
        type: 'info',
        category: 'finance',
        title: 'Invoice Sent',
        message: 'Invoice INV-2024-001 has been sent to First Baptist Church',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        read: true,
        priority: 'low',
        actionUrl: '/finance',
        actionLabel: 'View Invoice'
      },
      {
        id: '5',
        type: 'warning',
        category: 'team',
        title: 'Training Expiring',
        message: 'Mike Johnson\'s Equipment Safety certification expires in 30 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: false,
        priority: 'medium',
        actionUrl: '/team',
        actionLabel: 'View Training'
      }
    ];
    setNotifications(mockNotifications);
  };

  const generateMockNotification = () => {
    const types: Notification['type'][] = ['info', 'success', 'warning', 'error'];
    const categories: Notification['category'][] = ['project', 'team', 'equipment', 'finance', 'safety'];
    const priorities: Notification['priority'][] = ['low', 'medium', 'high'];
    
    const mockMessages = [
      'New photo uploaded to project gallery',
      'Weather alert: Rain expected tomorrow',
      'Equipment utilization report ready',
      'Budget variance detected in materials category',
      'Crew assignment updated for next week'
    ];

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: types[Math.floor(Math.random() * types.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      title: 'System Update',
      message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
      timestamp: new Date().toISOString(),
      read: false,
      priority: priorities[Math.floor(Math.random() * priorities.length)]
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been cleared",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
      description: "Your notification list is now empty",
    });
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'system': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'project': return <Calendar className="h-3 w-3" />;
      case 'team': return <User className="h-3 w-3" />;
      case 'equipment': return <Wrench className="h-3 w-3" />;
      case 'finance': return <DollarSign className="h-3 w-3" />;
      case 'safety': return <Shield className="h-3 w-3" />;
      case 'photo': return <Camera className="h-3 w-3" />;
      case 'schedule': return <Clock className="h-3 w-3" />;
      case 'system': return <Settings className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50/50';
      case 'high': return 'border-l-orange-500 bg-orange-50/50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50/50';
      case 'low': return 'border-l-blue-500 bg-blue-50/50';
      default: return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'high-priority': return ['high', 'urgent'].includes(notification.priority);
      default: return true;
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
          onClick={() => setIsOpen(true)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter(filter === 'all' ? 'unread' : filter === 'unread' ? 'high-priority' : 'all')}
              >
                <Filter className="h-4 w-4" />
                {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'High Priority'}
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter.replace('-', ' ')})`}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : filter === 'high-priority'
                      ? "No high priority notifications at the moment."
                      : "You have no notifications right now."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification, index) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50 border-l-4",
                    getPriorityColor(notification.priority),
                    !notification.read && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {getCategoryIcon(notification.category)}
                            <span className="capitalize">{notification.category}</span>
                            <span>•</span>
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            <span>•</span>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              notification.priority === 'urgent' && "border-red-500 text-red-700",
                              notification.priority === 'high' && "border-orange-500 text-orange-700",
                              notification.priority === 'medium' && "border-yellow-500 text-yellow-700",
                              notification.priority === 'low' && "border-blue-500 text-blue-700"
                            )}>
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {notification.actionLabel && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            {notification.actionLabel}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default NotificationCenter;