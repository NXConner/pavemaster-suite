import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import {
  Settings,
  Shield,
  RefreshCw,
  Save,
  User,
  Bell,
  Palette,
  Globe,
  Database,
  Lock,
  Mail,
  Smartphone,
  Monitor,
  HardDrive,
  Wifi,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Camera,
  Users,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';

import { JargonSwitcher } from '../ui/jargon-switcher';
import { SystemStatus } from '../system/SystemStatus';
import { AdvancedThemeSwitcher } from '../themes/AdvancedThemeSwitcher';
import { useJargon } from '../../contexts/JargonContext';

export function SettingsManager() {
  const { getText } = useJargon();
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Elite Paving Solutions',
    position: 'Project Manager',
    bio: 'Experienced paving professional with 10+ years in the industry.',
    avatar: '',

    // General Settings
    autoSave: true,
    darkMode: false,
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    soundAlerts: true,
    notifyProjectUpdates: true,
    notifyEquipmentAlerts: true,
    notifyScheduleChanges: true,
    notifyWeatherAlerts: true,
    notifyPaymentReminders: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    auditLogs: true,
    encryption: true,
    passwordStrength: 'strong',
    loginAttempts: 3,
    secureConnection: true,

    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    performanceMode: 'balanced',
    debugMode: false,
    analyticsEnabled: true,
    crashReporting: true,

    // Interface Settings
    sidebarCollapsed: false,
    showTooltips: true,
    animationsEnabled: true,
    compactMode: false,
    showMinimap: false,
    autoRefresh: true,
    refreshInterval: 30,
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
    setUnsavedChanges(false);
    // Show success message
  };

  const resetSettings = () => {
    // Reset to defaults
    setUnsavedChanges(true);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'pavemaster-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={!unsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            {unsavedChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {unsavedChanges && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-700">You have unsaved changes</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system">
            <Database className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="interface">
            <Monitor className="h-4 w-4 mr-2" />
            Interface
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={settings.avatar} />
                  <AvatarFallback>{settings.firstName[0]}{settings.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 5MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    value={settings.firstName} 
                    onChange={(e) => updateSetting('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    value={settings.lastName} 
                    onChange={(e) => updateSetting('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  value={settings.email} 
                  onChange={(e) => updateSetting('email', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    value={settings.phone} 
                    onChange={(e) => updateSetting('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position"
                    value={settings.position} 
                    onChange={(e) => updateSetting('position', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company"
                  value={settings.company} 
                  onChange={(e) => updateSetting('company', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio"
                  value={settings.bio} 
                  onChange={(e) => updateSetting('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Language, timezone, and format preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => updateSetting('timeFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>General application behavior settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save changes as you work
                    </p>
                  </div>
                  <Switch 
                    checked={settings.autoSave} 
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">
                      Refresh data automatically
                    </p>
                  </div>
                  <Switch 
                    checked={settings.autoRefresh} 
                    onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                  />
                </div>

                {settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <Slider
                      value={[settings.refreshInterval]}
                      onValueChange={([value]) => updateSetting('refreshInterval', value)}
                      max={300}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {settings.refreshInterval} seconds
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <Label className="text-base">Theme Settings</Label>
                  <div className="mt-2">
                    <AdvancedThemeSwitcher />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Communication Style</Label>
                  <div className="mt-2">
                    <JargonSwitcher />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications} 
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications} 
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important alerts via SMS
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications} 
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <volume-2 className="h-4 w-4" />
                    <div>
                      <Label>Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound for notifications
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.soundAlerts} 
                    onCheckedChange={(checked) => updateSetting('soundAlerts', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                
                {[
                  { key: 'notifyProjectUpdates', label: 'Project Updates', icon: Users },
                  { key: 'notifyEquipmentAlerts', label: 'Equipment Alerts', icon: AlertCircle },
                  { key: 'notifyScheduleChanges', label: 'Schedule Changes', icon: Clock },
                  { key: 'notifyWeatherAlerts', label: 'Weather Alerts', icon: Globe },
                  { key: 'notifyPaymentReminders', label: 'Payment Reminders', icon: DollarSign },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <Label>{label}</Label>
                    </div>
                    <Switch 
                      checked={settings[key as keyof typeof settings] as boolean} 
                      onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Authentication & Access</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch 
                    checked={settings.twoFactorAuth} 
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Slider
                    value={[settings.sessionTimeout]}
                    onValueChange={([value]) => updateSetting('sessionTimeout', value)}
                    max={480}
                    min={15}
                    step={15}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {settings.sessionTimeout} minutes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Password Strength</Label>
                  <Select value={settings.passwordStrength} onValueChange={(value) => updateSetting('passwordStrength', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="very-strong">Very Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Login Attempts</Label>
                  <Input 
                    type="number"
                    value={settings.loginAttempts} 
                    onChange={(e) => updateSetting('loginAttempts', parseInt(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Control how your data is handled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logs</Label>
                    <p className="text-sm text-muted-foreground">
                      Track all system activities
                    </p>
                  </div>
                  <Switch 
                    checked={settings.auditLogs} 
                    onCheckedChange={(checked) => updateSetting('auditLogs', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt sensitive data at rest
                    </p>
                  </div>
                  <Switch 
                    checked={settings.encryption} 
                    onCheckedChange={(checked) => updateSetting('encryption', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Secure Connection</Label>
                    <p className="text-sm text-muted-foreground">
                      Require HTTPS for all connections
                    </p>
                  </div>
                  <Switch 
                    checked={settings.secureConnection} 
                    onCheckedChange={(checked) => updateSetting('secureConnection', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Storage</CardTitle>
                <CardDescription>Manage data backup and storage settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data
                    </p>
                  </div>
                  <Switch 
                    checked={settings.autoBackup} 
                    onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                  />
                </div>

                {settings.autoBackup && (
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Data Retention (days)</Label>
                  <Slider
                    value={[settings.dataRetention]}
                    onValueChange={([value]) => updateSetting('dataRetention', value)}
                    max={1095}
                    min={30}
                    step={30}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {settings.dataRetention} days
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance & Monitoring</CardTitle>
                <CardDescription>System performance and diagnostic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Performance Mode</Label>
                  <Select value={settings.performanceMode} onValueChange={(value) => updateSetting('performanceMode', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-performance">High Performance</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="power-saver">Power Saver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect usage analytics
                    </p>
                  </div>
                  <Switch 
                    checked={settings.analyticsEnabled} 
                    onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Crash Reporting</Label>
                    <p className="text-sm text-muted-foreground">
                      Send crash reports automatically
                    </p>
                  </div>
                  <Switch 
                    checked={settings.crashReporting} 
                    onCheckedChange={(checked) => updateSetting('crashReporting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable debug information
                    </p>
                  </div>
                  <Switch 
                    checked={settings.debugMode} 
                    onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStatus />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interface Preferences</CardTitle>
              <CardDescription>Customize your user interface experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sidebar Collapsed</Label>
                  <p className="text-sm text-muted-foreground">
                    Start with sidebar collapsed
                  </p>
                </div>
                <Switch 
                  checked={settings.sidebarCollapsed} 
                  onCheckedChange={(checked) => updateSetting('sidebarCollapsed', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Tooltips</Label>
                  <p className="text-sm text-muted-foreground">
                    Display helpful tooltips
                  </p>
                </div>
                <Switch 
                  checked={settings.showTooltips} 
                  onCheckedChange={(checked) => updateSetting('showTooltips', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Animations Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable UI animations and transitions
                  </p>
                </div>
                <Switch 
                  checked={settings.animationsEnabled} 
                  onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use more compact interface
                  </p>
                </div>
                <Switch 
                  checked={settings.compactMode} 
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Minimap</Label>
                  <p className="text-sm text-muted-foreground">
                    Display navigation minimap
                  </p>
                </div>
                <Switch 
                  checked={settings.showMinimap} 
                  onCheckedChange={(checked) => updateSetting('showMinimap', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}