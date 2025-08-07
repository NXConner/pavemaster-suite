import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Home, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TacticalNotification {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  persistent: boolean;
}

const MOCK_NOTIFICATIONS: TacticalNotification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'TACTICAL OVERRIDE',
    message: 'System entering enhanced operational mode',
    timestamp: new Date(),
    priority: 'high',
    persistent: true,
  },
  {
    id: '2',
    type: 'info',
    title: 'MISSION STATUS',
    message: 'All units operating within normal parameters',
    timestamp: new Date(Date.now() - 60000),
    priority: 'medium',
    persistent: false,
  },
];

export function TacticalOverrideNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<TacticalNotification[]>(MOCK_NOTIFICATIONS);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Auto-remove non-persistent notifications after 10 seconds
    const interval = setInterval(() => {
      setNotifications(prev =>
        prev.filter(notif =>
          notif.persistent || (Date.now() - notif.timestamp.getTime()) < 10000,
        ),
      );
    }, 1000);

    return () => { clearInterval(interval); };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'high': return 'border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-gray-500/50 bg-card0/10';
    }
  };

  if (isMinimized || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 w-96 space-y-2 z-50 pointer-events-none">
      {/* Dashboard Navigation */}
      <Card className="bg-black/80 backdrop-blur-sm border-orange-500/30 pointer-events-auto">
        <CardContent className="p-2">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 font-mono text-xs"
          >
            <Home className="h-4 w-4 mr-2" />
            RETURN TO DASHBOARD
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`bg-black/80 backdrop-blur-sm ${getPriorityColor(notification.priority)} pointer-events-auto`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getNotificationIcon(notification.type)}
                <span className="text-orange-500 font-mono text-xs font-bold">
                  {notification.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setIsMinimized(true); }}
                  className="text-orange-500 hover:bg-orange-500/20 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
                {!notification.persistent && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { removeNotification(notification.id); }}
                    className="text-orange-500 hover:bg-orange-500/20 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-orange-300/80 font-mono mb-2">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 text-xs text-orange-400/60 font-mono">
              <Clock className="h-3 w-3" />
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}