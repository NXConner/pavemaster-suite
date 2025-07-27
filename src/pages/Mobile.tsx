import { Header } from '@/components/Header';
import { MobileFieldInterface } from '@/components/MobileFieldInterface';
import { OfflineManager } from '@/components/OfflineManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Wifi,
  MapPin,
  Camera,
  Activity,
  Download,
  Settings,
  Users
} from 'lucide-react';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Smartphone className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mobile Operations</h1>
            <p className="text-muted-foreground">
              Field-optimized interface for mobile crews and operations
            </p>
          </div>
        </div>

        {/* Mobile Features Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                GPS Tracking
              </CardTitle>
              <CardDescription>
                Real-time location tracking for crews and equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">High Accuracy</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photo Capture
              </CardTitle>
              <CardDescription>
                Instant photo documentation with GPS metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Ready</Badge>
                <Badge variant="secondary">Auto-Sync</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Offline Mode
              </CardTitle>
              <CardDescription>
                Work without internet - sync when connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Enabled</Badge>
                <Badge variant="secondary">8 Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Updates
              </CardTitle>
              <CardDescription>
                Real-time synchronization with central systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Synced</Badge>
                <Badge variant="secondary">2 sec ago</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="field" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="field" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Field Interface
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Offline Manager
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mobile Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="field" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Field Operations Interface
                </CardTitle>
                <CardDescription>
                  Touch-optimized interface designed for field crews working on-site.
                  Features GPS tracking, task management, and offline capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <MobileFieldInterface />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Offline Data Management
                </CardTitle>
                <CardDescription>
                  Manage offline data synchronization, storage usage, and connectivity settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OfflineManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Mobile App Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure mobile-specific settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">GPS High Accuracy</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto Photo Sync</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Offline Mode</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Background Sync</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Push Notifications</span>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Native App Instructions</CardTitle>
                  <CardDescription>
                    Steps to build and deploy the native mobile app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">For Native Mobile App:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Export project to GitHub</li>
                      <li>Run <code className="bg-background px-1 rounded">npm install</code></li>
                      <li>Add platforms: <code className="bg-background px-1 rounded">npx cap add ios android</code></li>
                      <li>Build project: <code className="bg-background px-1 rounded">npm run build</code></li>
                      <li>Sync with native: <code className="bg-background px-1 rounded">npx cap sync</code></li>
                      <li>Run on device: <code className="bg-background px-1 rounded">npx cap run ios/android</code></li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Native mobile features like camera, GPS, and offline storage 
                      work best in the native app. The web version provides a preview of the mobile interface.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}