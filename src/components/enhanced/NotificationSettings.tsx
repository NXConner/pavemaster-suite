import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Phone, MessageSquare } from 'lucide-react';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    sms: false,
    desktop: true
  });

  const notificationTypes = [
    {
      key: 'email' as keyof typeof settings,
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail
    },
    {
      key: 'push' as keyof typeof settings,
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: Bell
    },
    {
      key: 'sms' as keyof typeof settings,
      label: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: Phone
    },
    {
      key: 'desktop' as keyof typeof settings,
      label: 'Desktop Notifications',
      description: 'Receive notifications on your desktop',
      icon: MessageSquare
    }
  ];

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationTypes.map((type) => {
          const Icon = type.icon;
          const isEnabled = settings[type.key];
          
          return (
            <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </div>
              <Button
                variant={isEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSetting(type.key)}
              >
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}