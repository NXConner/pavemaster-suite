import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Calendar,
  MapPin,
  X,
  Settings as SettingsIcon,
  Eye,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'message';
  title: string;
  message: string;
  category: 'project' | 'equipment' | 'safety' | 'compliance' | 'weather' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  archived: boolean;
  timestamp: string;
  actionRequired: boolean;
  actionUrl?: string;
  userId: string;
  metadata?: {
    projectId?: string;
    equipmentId?: string;
    employeeId?: string;
    location?: string;
  };
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    project: boolean;
    equipment: boolean;
    safety: boolean;
    compliance: boolean;
    weather: boolean;
    system: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    categories: {
      project: true,
      equipment: true,
      safety: true,
      compliance: true,
      weather: true,
      system: true,
    },
    priority: {
      low: false,
      medium: true,
      high: true,
      urgent: true,
    },
  });
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
    // Load demo notifications
    loadDemoNotifications();
  }, []);

  const setupRealtimeSubscription = () => {
    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);

          // Show toast for high priority notifications
          if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
            toast(newNotification.title, {
              description: newNotification.message,
              duration: newNotification.priority === 'urgent' ? 10000 : 5000,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadNotifications = async () => {
    // In a real app, this would load from the database
    setLoading(false);
  };

  const loadDemoNotifications = () => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Equipment Maintenance Due',
        message: 'Asphalt paver #3 requires scheduled maintenance within 48 hours',
        category: 'equipment',
        priority: 'high',
        read: false,
        archived: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionUrl: '/equipment',
        userId: 'user-1',
        metadata: { equipmentId: 'paver-3' },
      },
      {
        id: '2',
        type: 'info',
        title: 'Weather Alert',
        message: 'Rain forecast for tomorrow. Consider rescheduling outdoor projects.',
        category: 'weather',
        priority: 'medium',
        read: false,
        archived: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionRequired: false,
        userId: 'user-1',
        metadata: { location: 'Richmond, VA' },
      },
      {
        id: '3',
        type: 'error',
        title: 'Safety Violation Detected',
        message: 'Employee John Doe reported for not wearing required PPE',
        category: 'safety',
        priority: 'urgent',
        read: false,
        archived: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionUrl: '/safety',
        userId: 'user-1',
        metadata: { employeeId: 'emp-1' },
      },
      {
        id: '4',
        type: 'success',
        title: 'Project Completed',
        message: 'St. Mary\'s Church parking lot project has been successfully completed',
        category: 'project',
        priority: 'low',
        read: true,
        archived: false,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actionRequired: false,
        userId: 'user-1',
        metadata: { projectId: 'proj-1' },
      },
      {
        id: '5',
        type: 'message',
        title: 'New Message from Client',
        message: 'Pastor Johnson has requested a quote update for the line striping work',
        category: 'project',
        priority: 'medium',
        read: false,
        archived: false,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionUrl: '/crm',
        userId: 'user-1',
      },
    ];

    setNotifications(demoNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n),
    );
  };

  const markAsArchived = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true } : n),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true })),
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return <Calendar className="h-3 w-3" />;
      case 'equipment': return <SettingsIcon className="h-3 w-3" />;
      case 'safety': return <AlertTriangle className="h-3 w-3" />;
      case 'weather': return <Info className="h-3 w-3" />;
      case 'compliance': return <CheckCircle className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') { return !notification.read; }
    if (activeTab === 'archived') { return notification.archived; }
    if (activeTab === 'urgent') { return notification.priority === 'urgent' || notification.priority === 'high'; }
    return !notification.archived; // 'all' tab shows non-archived
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BellRing className="h-8 w-8" />
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Real-time updates on projects, equipment, safety, and more
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All Read
          </Button>
          <Button variant="outline" onClick={() => { setShowSettings(!showSettings); }}>
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="urgent" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Urgent
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'unread'
                    ? 'You\'re all caught up! No unread notifications.'
                    : activeTab === 'urgent'
                      ? 'No urgent notifications at this time.'
                      : activeTab === 'archived'
                        ? 'No archived notifications.'
                        : 'No notifications to display.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`transition-all ${
                !notification.read ? 'border-l-4 border-l-primary bg-blue-50/50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                            <Badge variant="outline" className="text-xs gap-1">
                              {getCategoryIcon(notification.category)}
                              {notification.category}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {new Date(notification.timestamp).toLocaleString()}
                            </span>
                            {notification.metadata?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {notification.metadata.location}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {notification.actionRequired && notification.actionUrl && (
                              <Button size="sm" variant="default">
                                Take Action
                              </Button>
                            )}

                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { markAsRead(notification.id); }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { markAsArchived(notification.id); }}
                            >
                              <Archive className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { deleteNotification(notification.id); }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Delivery Methods</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={(e) => { setPreferences(prev => ({ ...prev, email: e.target.checked })); }}
                  />
                  <span className="text-sm">Email Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={(e) => { setPreferences(prev => ({ ...prev, push: e.target.checked })); }}
                  />
                  <span className="text-sm">Push Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.inApp}
                    onChange={(e) => { setPreferences(prev => ({ ...prev, inApp: e.target.checked })); }}
                  />
                  <span className="text-sm">In-App Notifications</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(preferences.categories).map(([category, enabled]) => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        setPreferences(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: e.target.checked },
                        }));
                      }}
                    />
                    <span className="text-sm capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Priority Levels</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(preferences.priority).map(([priority, enabled]) => (
                  <label key={priority} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        setPreferences(prev => ({
                          ...prev,
                          priority: { ...prev.priority, [priority]: e.target.checked },
                        }));
                      }}
                    />
                    <span className="text-sm capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={() => {
              setShowSettings(false);
              toast.success('Notification preferences saved');
            }}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}