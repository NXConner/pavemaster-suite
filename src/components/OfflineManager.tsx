import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Download,
  Upload,
  Wifi,
  WifiOff,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Smartphone,
  HardDrive
} from 'lucide-react';

interface OfflineData {
  projects: number;
  tasks: number;
  photos: number;
  measurements: number;
  reports: number;
  lastSync: Date | null;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingUploads: number;
  pendingDownloads: number;
  lastSync: Date | null;
  syncProgress: number;
}

interface OfflineManagerProps {
  className?: string;
}

export function OfflineManager({ className = "" }: OfflineManagerProps) {
  const { toast } = useToast();
  const [offlineData, setOfflineData] = useState<OfflineData>({
    projects: 0,
    tasks: 0,
    photos: 0,
    measurements: 0,
    reports: 0,
    lastSync: null
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingUploads: 0,
    pendingDownloads: 0,
    lastSync: null,
    syncProgress: 0
  });

  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 0,
    percentage: 0
  });

  useEffect(() => {
    loadOfflineData();
    checkStorageUsage();
    setupNetworkListeners();
    
    // Setup auto-sync when coming online
    if (syncStatus.isOnline && syncStatus.pendingUploads > 0) {
      startSync();
    }
  }, [syncStatus.isOnline]);

  const setupNetworkListeners = () => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Connection Restored",
        description: "Back online - starting sync...",
      });
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Offline Mode",
        description: "Working offline - data will sync when reconnected",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const loadOfflineData = () => {
    // Simulate loading offline data from local storage
    const mockData: OfflineData = {
      projects: 3,
      tasks: 12,
      photos: 45,
      measurements: 28,
      reports: 6,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
    
    const mockSyncStatus: Partial<SyncStatus> = {
      pendingUploads: 8,
      pendingDownloads: 2,
      lastSync: mockData.lastSync
    };

    setOfflineData(mockData);
    setSyncStatus(prev => ({ ...prev, ...mockSyncStatus }));
  };

  const checkStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const percentage = total > 0 ? (used / total) * 100 : 0;
        
        setStorageUsage({
          used: Math.round(used / 1024 / 1024), // Convert to MB
          total: Math.round(total / 1024 / 1024), // Convert to MB
          percentage: Math.round(percentage)
        });
      }
    } catch (error) {
      console.error('Error checking storage:', error);
    }
  };

  const startSync = async () => {
    if (!syncStatus.isOnline) {
      toast({
        title: "No Connection",
        description: "Cannot sync while offline",
        variant: "destructive",
      });
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));

    try {
      // Simulate sync process with progress updates
      const totalItems = syncStatus.pendingUploads + syncStatus.pendingDownloads;
      let completed = 0;

      for (let i = 0; i < totalItems; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        completed++;
        const progress = (completed / totalItems) * 100;
        setSyncStatus(prev => ({ ...prev, syncProgress: progress }));
      }

      // Update status after successful sync
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingUploads: 0,
        pendingDownloads: 0,
        lastSync: new Date(),
        syncProgress: 100
      }));

      toast({
        title: "Sync Complete",
        description: "All data has been synchronized successfully",
      });

      // Reset progress after a moment
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));
      }, 2000);

    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, syncProgress: 0 }));
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadForOffline = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));
    
    try {
      // Simulate downloading essential data for offline use
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncStatus(prev => ({ ...prev, syncProgress: i }));
      }

      toast({
        title: "Download Complete",
        description: "Essential data downloaded for offline use",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download offline data",
        variant: "destructive",
      });
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false, syncProgress: 0 }));
    }
  };

  const clearOfflineData = () => {
    setOfflineData({
      projects: 0,
      tasks: 0,
      photos: 0,
      measurements: 0,
      reports: 0,
      lastSync: null
    });
    
    toast({
      title: "Data Cleared",
      description: "Offline data has been cleared",
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    return `${bytes} MB`;
  };

  const getConnectionStatus = () => {
    if (syncStatus.isOnline) {
      return {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        label: "Online",
        variant: "default" as const
      };
    } else {
      return {
        icon: <WifiOff className="h-4 w-4 text-red-500" />,
        label: "Offline",
        variant: "destructive" as const
      };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {status.icon}
              Connection Status
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus.isSyncing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Syncing...</span>
                <span className="text-sm">{Math.round(syncStatus.syncProgress)}%</span>
              </div>
              <Progress value={syncStatus.syncProgress} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-orange-500" />
              <span>Pending Uploads: {syncStatus.pendingUploads}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-500" />
              <span>Pending Downloads: {syncStatus.pendingDownloads}</span>
            </div>
          </div>

          {syncStatus.lastSync && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last sync: {syncStatus.lastSync.toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={startSync}
              disabled={!syncStatus.isOnline || syncStatus.isSyncing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Sync Now
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadForOffline}
              disabled={!syncStatus.isOnline || syncStatus.isSyncing}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download for Offline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{offlineData.projects}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{offlineData.tasks}</div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{offlineData.photos}</div>
              <div className="text-sm text-muted-foreground">Photos</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{offlineData.measurements}</div>
              <div className="text-sm text-muted-foreground">Measurements</div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={clearOfflineData}
            className="w-full text-red-600 hover:text-red-700"
          >
            Clear Offline Data
          </Button>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {formatBytes(storageUsage.used)}</span>
              <span>Total: {formatBytes(storageUsage.total)}</span>
            </div>
            <Progress value={storageUsage.percentage} />
            <div className="text-xs text-muted-foreground text-center">
              {storageUsage.percentage}% of available storage used
            </div>
          </div>

          {storageUsage.percentage > 80 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-700">
                Storage space is running low. Consider clearing old data.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile App Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Background Sync</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Offline Mode</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Camera Access</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Available
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">GPS Tracking</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}