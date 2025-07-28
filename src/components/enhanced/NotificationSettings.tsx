import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AnimatedButton } from './AnimatedButton';
import { LoadingSpinner } from './LoadingSpinner';
import { Bell, Mail, Smartphone, Clock, AlertTriangle, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  email: {
    projectUpdates: boolean;
    securityAlerts: boolean;
    weatherAlerts: boolean;
    equipmentAlerts: boolean;
    frequency: string;
  };
  push: {
    enabled: boolean;
    projectUpdates: boolean;
    emergencyAlerts: boolean;
    dailyDigest: boolean;
  };
  inApp: {
    enabled: boolean;
    soundEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      projectUpdates: true,
      securityAlerts: true,
      weatherAlerts: true,
      equipmentAlerts: false,
      frequency: 'immediate',
    },
    push: {
      enabled: true,
      projectUpdates: true,
      emergencyAlerts: true,
      dailyDigest: false,
    },
    inApp: {
      enabled: true,
      soundEnabled: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
    },
  });

  const updatePreference = (category: keyof NotificationPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateQuietHours = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      inApp: {
        ...prev.inApp,
        quietHours: {
          ...prev.inApp.quietHours,
          [key]: value,
        },
      },
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Email Notifications */}
      <Card className="hover-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure what notifications you receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Project Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about project status changes and milestones
              </p>
            </div>
            <Switch
              checked={preferences.email.projectUpdates}
              onCheckedChange={(checked) => { updatePreference('email', 'projectUpdates', checked); }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Security Alerts</Label>
                <Badge variant="destructive" className="text-xs">Critical</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Important security notifications and login alerts
              </p>
            </div>
            <Switch
              checked={preferences.email.securityAlerts}
              onCheckedChange={(checked) => { updatePreference('email', 'securityAlerts', checked); }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weather Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Weather conditions affecting pavement operations
              </p>
            </div>
            <Switch
              checked={preferences.email.weatherAlerts}
              onCheckedChange={(checked) => { updatePreference('email', 'weatherAlerts', checked); }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Equipment Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Maintenance reminders and equipment status updates
              </p>
            </div>
            <Switch
              checked={preferences.email.equipmentAlerts}
              onCheckedChange={(checked) => { updatePreference('email', 'equipmentAlerts', checked); }}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Email Frequency</Label>
            <Select
              value={preferences.email.frequency}
              onValueChange={(value) => { updatePreference('email', 'frequency', value); }}
            >
              <SelectTrigger className="w-full transition-all duration-200 focus:scale-[1.02]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="hover-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure mobile and desktop push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Allow the app to send you push notifications
              </p>
            </div>
            <Switch
              checked={preferences.push.enabled}
              onCheckedChange={(checked) => { updatePreference('push', 'enabled', checked); }}
            />
          </div>

          {preferences.push.enabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Project Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant notifications for important project changes
                  </p>
                </div>
                <Switch
                  checked={preferences.push.projectUpdates}
                  onCheckedChange={(checked) => { updatePreference('push', 'projectUpdates', checked); }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Emergency Alerts</Label>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Urgent safety and emergency notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.push.emergencyAlerts}
                  onCheckedChange={(checked) => { updatePreference('push', 'emergencyAlerts', checked); }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Summary of daily activities and metrics
                  </p>
                </div>
                <Switch
                  checked={preferences.push.dailyDigest}
                  onCheckedChange={(checked) => { updatePreference('push', 'dailyDigest', checked); }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card className="hover-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications while using the application
              </p>
            </div>
            <Switch
              checked={preferences.inApp.enabled}
              onCheckedChange={(checked) => { updatePreference('inApp', 'enabled', checked); }}
            />
          </div>

          {preferences.inApp.enabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound for important notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.inApp.soundEnabled}
                  onCheckedChange={(checked) => { updatePreference('inApp', 'soundEnabled', checked); }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Label>Quiet Hours</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reduce notifications during specified hours
                    </p>
                  </div>
                  <Switch
                    checked={preferences.inApp.quietHours.enabled}
                    onCheckedChange={(checked) => { updateQuietHours('enabled', checked); }}
                  />
                </div>

                {preferences.inApp.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="quietStart">Start Time</Label>
                      <Select
                        value={preferences.inApp.quietHours.start}
                        onValueChange={(value) => { updateQuietHours('start', value); }}
                      >
                        <SelectTrigger id="quietStart">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={i} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietEnd">End Time</Label>
                      <Select
                        value={preferences.inApp.quietHours.end}
                        onValueChange={(value) => { updateQuietHours('end', value); }}
                      >
                        <SelectTrigger id="quietEnd">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={i} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <AnimatedButton 
          onClick={handleSavePreferences}
          disabled={isLoading}
          variant="default"
          animation="scale"
          className="min-w-40"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </AnimatedButton>
      </div>
    </div>
  );
}