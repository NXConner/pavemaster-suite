import { useState } from 'react';
import { Badge } from '../ui/badge';
import { 
  Settings, 
  Shield, 
  Map, 
  Database,
  Smartphone,
  Save,
  RefreshCw,
  Download,
  Upload,
  Monitor,
  Users,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CardDescription } from "../ui/card";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { ThemeSwitcher } from "../ui/theme-switcher";
import { JargonSwitcher } from "../ui/jargon-switcher";
import { useJargon } from "../../contexts/JargonContext";

export function SettingsManager() {
  const { getText } = useJargon();
  const [settings, setSettings] = useState({
    // General Settings
    autoSave: true,
    darkMode: false,
    notifications: true,
    soundAlerts: false,
    
    // Tracking Settings
    gpsAccuracy: 'high',
    updateInterval: 30,
    offlineMode: true,
    dataRetention: 90,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    auditLogs: true,
    encryption: true,
    
    // Mobile Settings
    pushNotifications: true,
    batteryOptimization: true,
    backgroundSync: false,
    wifiOnly: false
  });

  const [systemInfo] = useState({
    version: '2.1.0',
    build: '20241201',
    database: 'PostgreSQL 14.2',
    storage: '2.4 GB / 10 GB',
    uptime: '12d 14h 32m',
    lastBackup: '2024-01-15 03:00 AM'
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {getText('settings')}
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System Info
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="jargon" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Terminology
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Backup
          </TabsTrigger>
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

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                GPS & Tracking Settings
              </CardTitle>
              <CardDescription>
                Configure location tracking and data collection preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="font-medium">GPS Accuracy</label>
                <select 
                  value={settings.gpsAccuracy}
                  onChange={(e) => updateSetting('gpsAccuracy', e.target.value)}
                  className="w-full mt-1 border rounded px-3 py-2"
                >
                  <option value="low">Low (500m accuracy)</option>
                  <option value="medium">Medium (100m accuracy)</option>
                  <option value="high">High (10m accuracy)</option>
                  <option value="precise">Precise (1m accuracy)</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Update Interval (seconds)</label>
                <input 
                  type="number"
                  value={settings.updateInterval}
                  onChange={(e) => updateSetting('updateInterval', Number(e.target.value))}
                  className="w-full mt-1 border rounded px-3 py-2"
                  min="10"
                  max="300"
                />
              </div>

              <div>
                <label className="font-medium">Data Retention (days)</label>
                <input 
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', Number(e.target.value))}
                  className="w-full mt-1 border rounded px-3 py-2"
                  min="30"
                  max="365"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Offline Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Cache data for offline access
                  </div>
                </div>
                <Switch 
                  checked={settings.offlineMode}
                  onCheckedChange={(checked: boolean) => updateSetting('offlineMode', checked)}
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

              <div>
                <label className="font-medium">Session Timeout (minutes)</label>
                <input 
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                  className="w-full mt-1 border rounded px-3 py-2"
                  min="15"
                  max="480"
                />
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

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Settings
              </CardTitle>
              <CardDescription>
                Configure mobile app behavior and synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications on mobile devices
                  </div>
                </div>
                <Switch 
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked: boolean) => updateSetting('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Battery Optimization</div>
                  <div className="text-sm text-muted-foreground">
                    Optimize for longer battery life
                  </div>
                </div>
                <Switch 
                  checked={settings.batteryOptimization}
                  onCheckedChange={(checked: boolean) => updateSetting('batteryOptimization', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Background Sync</div>
                  <div className="text-sm text-muted-foreground">
                    Sync data when app is in background
                  </div>
                </div>
                <Switch 
                  checked={settings.backgroundSync}
                  onCheckedChange={(checked: boolean) => updateSetting('backgroundSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">WiFi Only Sync</div>
                  <div className="text-sm text-muted-foreground">
                    Only sync when connected to WiFi
                  </div>
                </div>
                <Switch 
                  checked={settings.wifiOnly}
                  onCheckedChange={(checked: boolean) => updateSetting('wifiOnly', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                View system status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Application Version</div>
                  <div className="text-sm text-muted-foreground">{systemInfo.version}</div>
                </div>
                <div>
                  <div className="font-medium">Build</div>
                  <div className="text-sm text-muted-foreground">{systemInfo.build}</div>
                </div>
                <div>
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-muted-foreground">{systemInfo.database}</div>
                </div>
                <div>
                  <div className="font-medium">Storage Usage</div>
                  <div className="text-sm text-muted-foreground">{systemInfo.storage}</div>
                </div>
                <div>
                  <div className="font-medium">System Uptime</div>
                  <div className="text-sm text-muted-foreground">{systemInfo.uptime}</div>
                </div>
                <div>
                  <div className="font-medium">Last Backup</div>
                  <div className="text-sm text-muted-foreground">{systemInfo.lastBackup}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Interface Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jargon/Terminology Tab */}
        <TabsContent value="jargon" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Terminology & Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <JargonSwitcher />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>
                Manage data backups and restoration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  Create Backup
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  Restore Backup
                </Button>
              </div>

              <div>
                <div className="font-medium mb-2">Automatic Backups</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Daily at 3:00 AM</span>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Weekly on Sunday</span>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Monthly on 1st</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Recent Backups</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Full Backup - 2024-01-15</span>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                  <div className="flex justify-between">
                    <span>Incremental - 2024-01-14</span>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                  <div className="flex justify-between">
                    <span>Full Backup - 2024-01-08</span>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}