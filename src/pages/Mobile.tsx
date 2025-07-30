import { Header } from '@/components/Header';
import { MobileFieldInterface } from '@/components/MobileFieldInterface';
import { EnhancedMobileFieldInterface } from '@/components/EnhancedMobileFieldInterface';
import { TouchOptimizedMobileInterface } from '@/components/TouchOptimizedMobileInterface';
import { AdvancedOfflineManager } from '@/components/AdvancedOfflineManager';
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
  Users,
  Zap,
  Shield,
  Rocket,
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
              Native mobile app with full device integration and offline capabilities
            </p>
          </div>
        </div>

        {/* Mobile Features Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                GPS & Location
              </CardTitle>
              <CardDescription>
                High-accuracy GPS tracking with continuous monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Native API</Badge>
                <Badge variant="secondary">Background</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Camera & Media
              </CardTitle>
              <CardDescription>
                Native camera integration with gallery sync
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Full Resolution</Badge>
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
                Advanced offline capabilities with smart sync
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Smart Queue</Badge>
                <Badge variant="secondary">Auto-Retry</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Native Features
              </CardTitle>
              <CardDescription>
                Haptics, push notifications, and device integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Native UI</Badge>
                <Badge variant="secondary">Optimized</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="touch-optimized" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="touch-optimized" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Touch UI
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Enhanced
            </TabsTrigger>
            <TabsTrigger value="field" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Field Interface
            </TabsTrigger>
            <TabsTrigger value="advanced-offline" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Advanced Offline
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Basic Offline
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              App Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="touch-optimized" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Touch-Optimized Mobile Interface
                </CardTitle>
                <CardDescription>
                  Advanced mobile interface with native touch optimization, device-aware UI,
                  comprehensive gesture support, and adaptive layouts for all screen sizes.
                  Features include haptic feedback, safe area support, and accessibility compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <TouchOptimizedMobileInterface />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Enhanced Mobile Field Interface
                </CardTitle>
                <CardDescription>
                  Next-generation mobile interface with full native device integration.
                  Features real-time GPS tracking, native camera access, haptic feedback,
                  motion detection, and advanced offline capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <EnhancedMobileFieldInterface />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="field" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Standard Field Operations Interface
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

          <TabsContent value="advanced-offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Advanced Offline Data Management
                </CardTitle>
                <CardDescription>
                  Comprehensive offline data management with intelligent sync, conflict resolution,
                  data compression, encryption, and advanced analytics. Includes batch processing,
                  priority queuing, and network-aware synchronization strategies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedOfflineManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Advanced Offline Data Management
                </CardTitle>
                <CardDescription>
                  Manage offline data synchronization, storage usage, and connectivity settings
                  with intelligent retry mechanisms and conflict resolution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OfflineManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Production-Ready Mobile App
                  </CardTitle>
                  <CardDescription>
                    Full-featured native mobile application for iOS and Android
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Native Platforms</span>
                      <Badge variant="default">iOS & Android</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Capacitor Version</span>
                      <Badge variant="default">v7.4.2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bundle ID</span>
                      <Badge variant="secondary">com.pavemaster.suite</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">App Name</span>
                      <Badge variant="secondary">PaveMaster Suite</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Build Status</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deployment Instructions</CardTitle>
                  <CardDescription>
                    Steps to build and deploy the native mobile applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Build Commands:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Install dependencies: <code className="bg-background px-1 rounded">npm install</code></li>
                      <li>Build web assets: <code className="bg-background px-1 rounded">npm run build</code></li>
                      <li>Sync with native: <code className="bg-background px-1 rounded">npx cap sync</code></li>
                      <li>Open in Xcode: <code className="bg-background px-1 rounded">npx cap open ios</code></li>
                      <li>Open in Android Studio: <code className="bg-background px-1 rounded">npx cap open android</code></li>
                    </ol>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Native Features Available:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Camera with gallery access</li>
                      <li>• High-accuracy GPS and location services</li>
                      <li>• Push notifications</li>
                      <li>• Haptic feedback</li>
                      <li>• Motion and accelerometer data</li>
                      <li>• Secure storage and preferences</li>
                      <li>• File system access</li>
                      <li>• Native sharing</li>
                      <li>• Status bar and keyboard management</li>
                      <li>• Network monitoring</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>App Store Deployment:</strong> The app is configured with proper
                      bundle identifiers, icons, and metadata for submission to both
                      Apple App Store and Google Play Store.
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