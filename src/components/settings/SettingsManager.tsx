import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Settings, 
  Shield, 
  RefreshCw,
  Save
} from 'lucide-react';
import { ThemeSwitcher } from "../ui/theme-switcher";
import { JargonSwitcher } from "../ui/jargon-switcher";
import { SystemStatus } from "../system/SystemStatus";
import { useJargon } from "../../contexts/JargonContext";

export function SettingsManager() {
  const { getText } = useJargon();
  const [settings, setSettings] = useState({
    // General Settings
    autoSave: true,
    darkMode: false,
    notifications: true,
    soundAlerts: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    auditLogs: true,
    encryption: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and system configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">{getText('general')}</TabsTrigger>
          <TabsTrigger value="security">{getText('security')}</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Preferences
              </CardTitle>
              <CardDescription>
                Configure basic application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-save</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically save changes as you work
                  </div>
                </div>
                <Switch 
                  checked={settings.autoSave}
                  onCheckedChange={(checked: boolean) => updateSetting('autoSave', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Use dark theme throughout the application
                  </div>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked: boolean) => updateSetting('darkMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications for important events
                  </div>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => updateSetting('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Sound Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Play sounds for alerts and notifications
                  </div>
                </div>
                <Switch 
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked: boolean) => updateSetting('soundAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage security features and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Add extra security to your account
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked: boolean) => updateSetting('twoFactorAuth', checked)}
                  />
                  {settings.twoFactorAuth && <Badge>Enabled</Badge>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Audit Logs</div>
                  <div className="text-sm text-muted-foreground">
                    Keep detailed logs of user activities
                  </div>
                </div>
                <Switch 
                  checked={settings.auditLogs}
                  onCheckedChange={(checked: boolean) => updateSetting('auditLogs', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Encryption</div>
                  <div className="text-sm text-muted-foreground">
                    Encrypt sensitive data at rest
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={settings.encryption}
                    onCheckedChange={(checked: boolean) => updateSetting('encryption', checked)}
                  />
                  <Badge variant="outline">AES-256</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Interface Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemeSwitcher />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Terminology & Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <JargonSwitcher />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}