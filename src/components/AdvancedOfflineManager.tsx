import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import advancedOfflineManager, { 
  OfflineEntity, 
  SyncConflict, 
  SyncStats,
  OfflineConfig 
} from '@/services/advancedOfflineManager';
import {
  Cloud,
  CloudOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Settings,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  BarChart3,
  FileText,
  Camera,
  MapPin,
  Users,
  Shield,
  Activity,
  Zap,
  HardDrive,
  Signal,
  Timer,
  Archive
} from 'lucide-react';

interface AdvancedOfflineManagerProps {
  className?: string;
}

export function AdvancedOfflineManager({ className = '' }: AdvancedOfflineManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalItems: 0,
    pendingSync: 0,
    syncedItems: 0,
    failedItems: 0,
    conflictItems: 0,
    lastSyncTime: 0,
    syncDuration: 0,
    bandwidthUsed: 0
  });
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [recentEntities, setRecentEntities] = useState<OfflineEntity[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [networkThreshold, setNetworkThreshold] = useState<'any' | 'wifi' | 'good'>('any');
  const [syncProgress, setSyncProgress] = useState({ completed: 0, total: 0, synced: 0, failed: 0 });
  
  const { toast } = useToast();

  useEffect(() => {
    initializeOfflineManager();
  }, []);

  const initializeOfflineManager = async () => {
    try {
      await advancedOfflineManager.initialize();
      setIsInitialized(true);
      
      // Load initial data
      await updateStats();
      await loadConflicts();
      await loadRecentEntities();
      
      // Set up event listeners
      setupEventListeners();
      
      toast({
        title: "Offline Manager Ready",
        description: "Advanced offline capabilities initialized successfully",
      });
    } catch (error) {
      console.error('Failed to initialize offline manager:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize offline manager",
        variant: "destructive"
      });
    }
  };

  const setupEventListeners = () => {
    advancedOfflineManager.addEventListener('syncStarted', (data) => {
      setSyncInProgress(true);
      setSyncProgress({ completed: 0, total: data.queueSize, synced: 0, failed: 0 });
      toast({
        title: "Sync Started",
        description: `Syncing ${data.queueSize} items...`,
      });
    });

    advancedOfflineManager.addEventListener('syncProgress', (data) => {
      setSyncProgress(data);
    });

    advancedOfflineManager.addEventListener('syncCompleted', (data) => {
      setSyncInProgress(false);
      updateStats();
      toast({
        title: "Sync Completed",
        description: `${data.synced} items synced, ${data.failed} failed`,
      });
    });

    advancedOfflineManager.addEventListener('syncFailed', (data) => {
      setSyncInProgress(false);
      toast({
        title: "Sync Failed",
        description: data.error,
        variant: "destructive"
      });
    });

    advancedOfflineManager.addEventListener('conflictDetected', () => {
      loadConflicts();
      toast({
        title: "Sync Conflict",
        description: "Data conflict detected - review required",
        variant: "destructive"
      });
    });

    advancedOfflineManager.addEventListener('entitySaved', () => {
      updateStats();
      loadRecentEntities();
    });
  };

  const updateStats = async () => {
    try {
      const stats = advancedOfflineManager.stats;
      setSyncStats(stats);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  const loadConflicts = async () => {
    try {
      const conflictsList = await advancedOfflineManager.getConflicts();
      setConflicts(conflictsList);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const loadRecentEntities = async () => {
    try {
      const entities = await advancedOfflineManager.getEntitiesByType('task', 10);
      setRecentEntities(entities);
    } catch (error) {
      console.error('Failed to load recent entities:', error);
    }
  };

  const handleManualSync = async () => {
    try {
      await advancedOfflineManager.syncWithServer();
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to start sync",
        variant: "destructive"
      });
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    try {
      await advancedOfflineManager.resolveConflict(conflictId, resolution);
      await loadConflicts();
      
      toast({
        title: "Conflict Resolved",
        description: `Conflict resolved using ${resolution} data`,
      });
    } catch (error) {
      toast({
        title: "Resolution Error",
        description: "Failed to resolve conflict",
        variant: "destructive"
      });
    }
  };

  const handleClearOldData = async () => {
    try {
      const deletedCount = await advancedOfflineManager.clearOldData();
      await updateStats();
      
      toast({
        title: "Data Cleaned",
        description: `Removed ${deletedCount} old synced items`,
      });
    } catch (error) {
      toast({
        title: "Cleanup Error",
        description: "Failed to clean old data",
        variant: "destructive"
      });
    }
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <FileText className="h-4 w-4" />;
      case 'photo': return <Camera className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'measurement': return <BarChart3 className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      case 'inspection': return <CheckCircle className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'syncing':
        return <Badge variant="outline" className="text-blue-600"><RefreshCw className="h-3 w-3 mr-1" />Syncing</Badge>;
      case 'synced':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Synced</Badge>;
      case 'conflict':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Conflict</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Initializing offline manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sync Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <HardDrive className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{syncStats.totalItems}</span>
              </div>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Upload className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{syncStats.pendingSync}</span>
              </div>
              <p className="text-sm text-gray-600">Pending Sync</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{syncStats.syncedItems}</span>
              </div>
              <p className="text-sm text-gray-600">Synced</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{syncStats.conflictItems}</span>
              </div>
              <p className="text-sm text-gray-600">Conflicts</p>
            </div>
          </div>

          {syncInProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Sync Progress</span>
                <span>{syncProgress.completed}/{syncProgress.total}</span>
              </div>
              <Progress 
                value={(syncProgress.completed / syncProgress.total) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{syncProgress.synced} synced</span>
                <span>{syncProgress.failed} failed</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Last sync: {formatLastSync(syncStats.lastSyncTime)}</span>
              <span>Bandwidth used: {formatBytes(syncStats.bandwidthUsed)}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleManualSync}
                disabled={syncInProgress}
                className="flex items-center gap-2"
              >
                                 {syncInProgress ? (
                   <RefreshCw className="h-4 w-4 animate-spin" />
                 ) : (
                   <RefreshCw className="h-4 w-4" />
                 )}
                 Sync Now
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearOldData}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Cleanup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entities">Recent Data</TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflicts {conflicts.length > 0 && <Badge variant="destructive" className="ml-2">{conflicts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Offline Entities</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEntities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No offline data found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntities.map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEntityTypeIcon(entity.type)}
                        <div>
                          <p className="font-medium text-sm">
                            {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} #{entity.id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(entity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {entity.priority}
                        </Badge>
                        {getSyncStatusBadge(entity.syncStatus)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Data Conflicts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No conflicts to resolve</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Conflict #{conflict.id.slice(-8)}</h4>
                        <Badge variant="destructive">{conflict.conflictType}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded border">
                          <h5 className="font-medium text-sm text-blue-800 mb-2">Local Data</h5>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(conflict.localData, null, 2)}
                          </pre>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded border">
                          <h5 className="font-medium text-sm text-green-800 mb-2">Server Data</h5>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(conflict.remoteData, null, 2)}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict.id, 'local')}
                        >
                          Use Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict.id, 'remote')}
                        >
                          Use Server
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveConflict(conflict.id, 'merge')}
                        >
                          Merge
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Offline Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <Label htmlFor="autoSync">Auto Sync</Label>
                </div>
                <Switch
                  id="autoSync"
                  checked={autoSyncEnabled}
                  onCheckedChange={setAutoSyncEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <Label htmlFor="compression">Data Compression</Label>
                </div>
                <Switch
                  id="compression"
                  checked={compressionEnabled}
                  onCheckedChange={setCompressionEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <Label htmlFor="encryption">Data Encryption</Label>
                </div>
                <Switch
                  id="encryption"
                  checked={encryptionEnabled}
                  onCheckedChange={setEncryptionEnabled}
                />
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Signal className="h-4 w-4" />
                  Network Sync Threshold
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="networkThreshold"
                      value="any"
                      checked={networkThreshold === 'any'}
                      onChange={(e) => setNetworkThreshold(e.target.value as any)}
                    />
                    Any connection
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="networkThreshold"
                      value="good"
                      checked={networkThreshold === 'good'}
                      onChange={(e) => setNetworkThreshold(e.target.value as any)}
                    />
                    Good connection only
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="networkThreshold"
                      value="wifi"
                      checked={networkThreshold === 'wifi'}
                      onChange={(e) => setNetworkThreshold(e.target.value as any)}
                    />
                    WiFi only
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}