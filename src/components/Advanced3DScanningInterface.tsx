import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Camera, 
  ScanLine, 
  Brain, 
  Map, 
  Play, 
  Pause, 
  Square, 
  Eye, 
  MapPin, 
  Target, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Download,
  Settings,
  Info,
  TrendingUp,
  Layers,
  Search
} from 'lucide-react';
import { mobileService } from '@/services/mobileService';
import { ar3dScanningService, type ScanSession, type ScanGuidance } from '@/services/ar3dScanningService';
import { aiDefectDetectionService, type AIModelInfo, type DetectionResult } from '@/services/aiDefectDetectionService';
import { visualDefectMappingService, type DefectPin, type DefectCluster } from '@/services/visualDefectMappingService';

interface ScanningState {
  isActive: boolean;
  currentSession: ScanSession | null;
  photoCount: number;
  scanProgress: number;
  guidance: ScanGuidance[];
  arCapabilities: any;
  aiModel: AIModelInfo | null;
  isProcessing: boolean;
  lastDetection: DetectionResult | null;
  defectPins: DefectPin[];
}

export function Advanced3DScanningInterface() {
  const [scanningState, setScanningState] = useState<ScanningState>({
    isActive: false,
    currentSession: null,
    photoCount: 0,
    scanProgress: 0,
    guidance: [],
    arCapabilities: null,
    aiModel: null,
    isProcessing: false,
    lastDetection: null,
    defectPins: [],
  });

  const [sessionName, setSessionName] = useState('');
  const [scanQuality, setScanQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('medium');
  const [selectedTab, setSelectedTab] = useState('scanner');
  const [modelInfo, setModelInfo] = useState<AIModelInfo[]>([]);
  const [clusters, setClusters] = useState<DefectCluster[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeServices();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize mobile service
      await mobileService.initialize();

      // Get AR capabilities
      const arCapabilities = ar3dScanningService.getARCapabilities();
      
      // Get AI models
      const models = aiDefectDetectionService.getAvailableModels();
      const activeModel = aiDefectDetectionService.getActiveModel();

      // Get existing defect pins
      const pins = visualDefectMappingService.getAllDefectPins();
      const defectClusters = visualDefectMappingService.getDefectClusters();

      setScanningState(prev => ({
        ...prev,
        arCapabilities,
        aiModel: activeModel,
        defectPins: pins,
      }));

      setModelInfo(models);
      setClusters(defectClusters);

    } catch (error) {
      console.error('Failed to initialize scanning services:', error);
    }
  };

  const startScanSession = async () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    try {
      const sessionId = await ar3dScanningService.startScanSession(sessionName.trim(), scanQuality);
      const session = ar3dScanningService.getActiveScanSession();

      setScanningState(prev => ({
        ...prev,
        isActive: true,
        currentSession: session,
        photoCount: 0,
        scanProgress: 0,
      }));

      // Start guidance updates
      intervalRef.current = setInterval(updateGuidance, 2000);

    } catch (error) {
      console.error('Failed to start scan session:', error);
      alert('Failed to start scanning session');
    }
  };

  const stopScanSession = async () => {
    try {
      const completedSession = await ar3dScanningService.stopScanSession();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setScanningState(prev => ({
        ...prev,
        isActive: false,
        currentSession: completedSession,
        scanProgress: 100,
      }));

      // Reset for next session
      setSessionName('');

    } catch (error) {
      console.error('Failed to stop scan session:', error);
    }
  };

  const capturePhoto = async () => {
    if (!scanningState.isActive) return;

    try {
      setScanningState(prev => ({ ...prev, isProcessing: true }));

      // Capture photo for 3D scanning
      const photoMetadata = await ar3dScanningService.capturePhotoForScan();
      
      if (photoMetadata) {
        // Run AI defect detection on the photo
        const detectionResult = await aiDefectDetectionService.detectDefects(
          photoMetadata.path,
          photoMetadata
        );

        // Add defects to visual mapping
        if (detectionResult && detectionResult.defects.length > 0) {
          for (const defect of detectionResult.defects) {
            await visualDefectMappingService.addDefectPin(defect, [photoMetadata.path]);
          }
        }

        // Update state
        const session = ar3dScanningService.getActiveScanSession();
        const pins = visualDefectMappingService.getAllDefectPins();
        const newClusters = visualDefectMappingService.getDefectClusters();

        setScanningState(prev => ({
          ...prev,
          currentSession: session,
          photoCount: session?.photos.length || 0,
          scanProgress: Math.min((session?.photos.length || 0) / 30 * 100, 100),
          lastDetection: detectionResult,
          defectPins: pins,
          isProcessing: false,
        }));

        setClusters(newClusters);
      }

    } catch (error) {
      console.error('Failed to capture photo:', error);
      setScanningState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const updateGuidance = () => {
    // This would be updated by the scanning service
    // For now, we'll simulate guidance updates
    if (scanningState.isActive && scanningState.currentSession) {
      const photoCount = scanningState.currentSession.photos.length;
      const mockGuidance: ScanGuidance[] = [];

      if (photoCount < 10) {
        mockGuidance.push({
          type: 'coverage',
          level: 'info',
          message: `Capture ${10 - photoCount} more photos for minimum coverage`,
          icon: 'camera',
        });
      }

      if (photoCount > 5) {
        mockGuidance.push({
          type: 'movement',
          level: 'info',
          message: 'Move in gentle arcs, maintain 1.5m distance',
          icon: 'move',
        });
      }

      setScanningState(prev => ({ ...prev, guidance: mockGuidance }));
    }
  };

  const exportScan = async () => {
    if (!scanningState.currentSession) return;

    try {
      const filePath = await ar3dScanningService.exportScanSession(
        scanningState.currentSession.id,
        'obj'
      );
      alert(`3D model exported to: ${filePath}`);
    } catch (error) {
      console.error('Failed to export scan:', error);
      alert('Failed to export 3D model');
    }
  };

  const switchAIModel = async (modelId: string) => {
    try {
      await aiDefectDetectionService.switchModel(modelId);
      const newModel = aiDefectDetectionService.getActiveModel();
      setScanningState(prev => ({ ...prev, aiModel: newModel }));
    } catch (error) {
      console.error('Failed to switch AI model:', error);
    }
  };

  const renderScannerTab = () => (
    <div className="space-y-6">
      {/* AR Capabilities Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                            <ScanLine className="h-5 w-5" />
            AR Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">ARCore/ARKit</span>
              <Badge variant={scanningState.arCapabilities?.hasARCore || scanningState.arCapabilities?.hasARKit ? 'default' : 'secondary'}>
                {scanningState.arCapabilities?.hasARCore || scanningState.arCapabilities?.hasARKit ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Depth API</span>
              <Badge variant={scanningState.arCapabilities?.hasDepthAPI ? 'default' : 'secondary'}>
                {scanningState.arCapabilities?.hasDepthAPI ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">LiDAR</span>
              <Badge variant={scanningState.arCapabilities?.hasLiDAR ? 'default' : 'secondary'}>
                {scanningState.arCapabilities?.hasLiDAR ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Photogrammetry</span>
              <Badge variant="default">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle>3D Scan Session</CardTitle>
          <CardDescription>
            Capture high-resolution photos for 3D pavement reconstruction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanningState.isActive ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Session Name</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter session name..."
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Scan Quality</label>
                <select
                  value={scanQuality}
                  onChange={(e) => setScanQuality(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Quality)</option>
                  <option value="ultra">Ultra (Best)</option>
                </select>
              </div>
              <Button onClick={startScanSession} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start 3D Scan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{scanningState.currentSession?.name}</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Photos Captured</span>
                    <span>{scanningState.photoCount}</span>
                  </div>
                  <Progress value={scanningState.scanProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Target: 20-30 photos for optimal reconstruction
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={capturePhoto}
                  disabled={scanningState.isProcessing}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {scanningState.isProcessing ? 'Processing...' : 'Capture Photo'}
                </Button>
                <Button onClick={stopScanSession} variant="outline" className="flex-1">
                  <Square className="h-4 w-4 mr-2" />
                  Square Scan
                </Button>
              </div>
            </div>
          )}

          {/* Real-time Guidance */}
          {scanningState.guidance.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Scanning Guidance</h4>
              {scanningState.guidance.map((guide, index) => (
                <Alert key={index} className={guide.level === 'warning' ? 'border-orange-200' : ''}>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{guide.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Export Option */}
          {scanningState.currentSession?.status === 'completed' && (
            <Button onClick={exportScan} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export 3D Model (OBJ)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      {/* AI Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Defect Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanningState.aiModel && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{scanningState.aiModel.name}</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-2 font-medium">{scanningState.aiModel.accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inference:</span>
                    <span className="ml-2 font-medium">{scanningState.aiModel.inferenceTime}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2 font-medium">{(scanningState.aiModel.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Optimized:</span>
                    <span className="ml-2 font-medium">{scanningState.aiModel.optimized ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Supported Defect Types */}
              <div>
                <h4 className="text-sm font-medium mb-2">Supported Defect Types</h4>
                <div className="flex flex-wrap gap-2">
                  {scanningState.aiModel.supportedDefects.map((defect) => (
                    <Badge key={defect} variant="secondary" className="text-xs">
                      {defect.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Models</h4>
            <div className="space-y-2">
              {modelInfo.map((model) => (
                <div
                  key={model.name}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    scanningState.aiModel?.name === model.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => switchAIModel(model.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.accuracy}% accuracy, {model.inferenceTime}ms inference
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {model.optimized && <Badge variant="default" className="text-xs">Optimized</Badge>}
                      {model.quantized && <Badge variant="secondary" className="text-xs">Quantized</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Detection Results */}
      {scanningState.lastDetection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Latest Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Defects Found:</span>
                <Badge variant="default">{scanningState.lastDetection.defects.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Processing Time:</span>
                <span className="text-sm">{scanningState.lastDetection.processingTime.toFixed(2)}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence:</span>
                <span className="text-sm">{(scanningState.lastDetection.confidence * 100).toFixed(1)}%</span>
              </div>

              {scanningState.lastDetection.defects.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Detected Defects</h4>
                  <div className="space-y-2">
                    {scanningState.lastDetection.defects.map((defect) => (
                      <div key={defect.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{defect.type.replace('_', ' ')}</span>
                          <Badge variant={
                            defect.severity === 'critical' ? 'destructive' :
                            defect.severity === 'high' ? 'default' :
                            'secondary'
                          }>
                            {defect.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {(defect.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMappingTab = () => (
    <div className="space-y-6">
      {/* Defect Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Defect Mapping Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{scanningState.defectPins.length}</div>
              <div className="text-sm text-muted-foreground">Total Defects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{clusters.length}</div>
              <div className="text-sm text-muted-foreground">Defect Clusters</div>
            </div>
          </div>

          {/* Defect Types Distribution */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Defect Types</h4>
            <div className="space-y-2">
              {Object.entries(
                scanningState.defectPins.reduce((acc, pin) => {
                  acc[pin.type] = (acc[pin.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type.replace('_', ' ')}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defect Clusters */}
      {clusters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Defect Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">
                      {cluster.dominantType.replace('_', ' ')} Cluster
                    </div>
                    <Badge variant={
                      cluster.priority === 'critical' ? 'destructive' :
                      cluster.priority === 'high' ? 'default' :
                      'secondary'
                    }>
                      {cluster.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Defects: {cluster.defectCount}</div>
                    <div>Radius: {cluster.radius.toFixed(1)}m</div>
                    <div>Area: {cluster.totalArea.toFixed(1)}m²</div>
                    <div>Cost: ${cluster.estimatedCost.toFixed(0)}</div>
                  </div>
                  <div className="mt-2 text-xs">
                    {cluster.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Defects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recent Defects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scanningState.defectPins
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map((pin) => (
                <div key={pin.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium">{pin.type.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(pin.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      pin.severity === 'critical' ? 'destructive' :
                      pin.severity === 'high' ? 'default' :
                      'secondary'
                    }>
                      {pin.severity}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {(pin.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-primary" />
            Advanced 3D Scanning & AI Detection
          </CardTitle>
          <CardDescription>
            Professional-grade pavement scanning with real-time AI defect detection and visual mapping
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            3D Scanner
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Detection
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Defect Mapping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          {renderScannerTab()}
        </TabsContent>

        <TabsContent value="ai">
          {renderAITab()}
        </TabsContent>

        <TabsContent value="mapping">
          {renderMappingTab()}
        </TabsContent>
      </Tabs>

      {/* Status Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span>All systems operational</span>
            </div>
            <div className="text-muted-foreground">
              {scanningState.isActive ? 'Scanning active' : 'Ready to scan'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}