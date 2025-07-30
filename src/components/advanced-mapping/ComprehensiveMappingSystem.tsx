import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Map, Layers, Scan, Settings, Download, Upload, Play, Pause,
  RotateCcw, Maximize2, Eye, EyeOff, Zap, Target, Grid3X3,
  Calculator, Ruler, Square, Circle, Camera, FileImage,
  Car, Route, Navigation, AlertTriangle, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

import MapOverlaySystem from './MapOverlaySystem';
import Enhanced3DVisualization, { MeasurementOverlay3D, AsphaltArea3D, ParkingSpace3D } from './Enhanced3DVisualization';
import AsphaltDetectionService, { 
  AsphaltDetectionConfig, 
  ImageSource, 
  DetectedAsphaltArea,
  ParkingLotLayout,
  OptimizedParkingLayout 
} from '../../services/AsphaltDetectionService';

interface MappingProject {
  id: string;
  name: string;
  description: string;
  created: Date;
  lastModified: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  measurements: MeasurementOverlay3D[];
  asphaltAreas: AsphaltArea3D[];
  parkingSpaces: ParkingSpace3D[];
  detectionResults: DetectedAsphaltArea[];
  parkingOptimizations: OptimizedParkingLayout[];
  status: 'draft' | 'analyzing' | 'completed' | 'archived';
}

interface AnalysisSession {
  id: string;
  projectId: string;
  type: 'asphalt_detection' | 'parking_optimization' | 'measurement' | 'full_analysis';
  progress: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  estimatedCompletion?: Date;
  results?: any;
}

const ComprehensiveMappingSystem: React.FC = () => {
  // Core state management
  const [currentProject, setCurrentProject] = useState<MappingProject | null>(null);
  const [projects, setProjects] = useState<MappingProject[]>([]);
  const [activeSession, setActiveSession] = useState<AnalysisSession | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'split'>('2d');
  const [isProcessing, setIsProcessing] = useState(false);

  // Services
  const [detectionService, setDetectionService] = useState<AsphaltDetectionService | null>(null);
  const detectionServiceRef = useRef<AsphaltDetectionService | null>(null);

  // UI state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const config: AsphaltDetectionConfig = {
          minConfidence: 0.8,
          maxAreaSize: 10000,
          minAreaSize: 10,
          enableRealTimeProcessing: true,
          enableConditionAnalysis: true,
          enableCostEstimation: true
        };

        const service = new AsphaltDetectionService(config);
        
        // Set up event listeners
        service.on('initialized', () => {
          addNotification('success', 'AI detection service initialized successfully');
        });

        service.on('processingStarted', (data) => {
          addNotification('info', `Processing started for ${data.source.type} image`);
          setIsProcessing(true);
        });

        service.on('processingComplete', (data) => {
          addNotification('success', `Analysis complete: ${data.results.length} areas detected`);
          setIsProcessing(false);
          if (currentProject) {
            updateProjectWithResults(data.results);
          }
        });

        service.on('processingError', (data) => {
          addNotification('error', `Processing failed: ${data.error}`);
          setIsProcessing(false);
        });

        await service.initialize();
        setDetectionService(service);
        detectionServiceRef.current = service;
      } catch (error) {
        addNotification('error', `Failed to initialize services: ${error.message}`);
      }
    };

    initializeServices();

    return () => {
      if (detectionServiceRef.current) {
        detectionServiceRef.current.cleanup();
      }
    };
  }, []);

  // Project management
  const createNewProject = useCallback((name: string, description: string, location: any) => {
    const newProject: MappingProject = {
      id: `project_${Date.now()}`,
      name,
      description,
      created: new Date(),
      lastModified: new Date(),
      location,
      measurements: [],
      asphaltAreas: [],
      parkingSpaces: [],
      detectionResults: [],
      parkingOptimizations: [],
      status: 'draft'
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    addNotification('success', `Project "${name}" created successfully`);
  }, []);

  const saveProject = useCallback(() => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      lastModified: new Date()
    };

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    addNotification('success', 'Project saved successfully');
  }, [currentProject]);

  // File upload and processing
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!detectionService || !currentProject) return;

    setIsProcessing(true);
    setAnalysisProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setAnalysisProgress((i / files.length) * 100);

        const imageSource: ImageSource = {
          id: `upload_${Date.now()}_${i}`,
          type: 'file',
          data: await file.arrayBuffer() as Buffer,
          coordinates: currentProject.location ? {
            lat: currentProject.location.lat,
            lng: currentProject.location.lng
          } : undefined,
          metadata: {
            timestamp: new Date(),
            resolution: { width: 0, height: 0 }, // Would be extracted from image
            format: file.type
          }
        };

        await detectionService.processImage(imageSource);
      }

      setAnalysisProgress(100);
      addNotification('success', `Processed ${files.length} images successfully`);
    } catch (error) {
      addNotification('error', `Upload processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [detectionService, currentProject]);

  // Analysis functions
  const startAutomaticDetection = useCallback(async () => {
    if (!detectionService || !currentProject) return;

    setCurrentProject(prev => prev ? { ...prev, status: 'analyzing' } : null);
    
    try {
      // Simulate automated detection process
      const mockImageSource: ImageSource = {
        id: 'auto_detect_001',
        type: 'drone',
        data: 'mock_image_data',
        coordinates: currentProject.location,
        metadata: {
          timestamp: new Date(),
          resolution: { width: 4096, height: 2304 },
          format: 'image/jpeg'
        }
      };

      await detectionService.processImage(mockImageSource);
    } catch (error) {
      addNotification('error', `Automatic detection failed: ${error.message}`);
      setCurrentProject(prev => prev ? { ...prev, status: 'draft' } : null);
    }
  }, [detectionService, currentProject]);

  const optimizeParkingLayout = useCallback(async () => {
    if (!detectionService || !currentProject) return;

    try {
      // Analyze current parking layout
      const mockImageSource: ImageSource = {
        id: 'parking_analysis_001',
        type: 'drone',
        data: 'mock_parking_image',
        coordinates: currentProject.location
      };

      const layout = await detectionService.analyzeParkingLot(mockImageSource);
      const optimizedLayout = await detectionService.optimizeParkingLayout(layout.id);

      setCurrentProject(prev => prev ? {
        ...prev,
        parkingOptimizations: [...prev.parkingOptimizations, optimizedLayout]
      } : null);

      addNotification('success', `Parking optimization complete: +${optimizedLayout.improvements.spaceIncrease} spaces`);
    } catch (error) {
      addNotification('error', `Parking optimization failed: ${error.message}`);
    }
  }, [detectionService, currentProject]);

  // Helper functions
  const updateProjectWithResults = useCallback((results: DetectedAsphaltArea[]) => {
    if (!currentProject) return;

    const asphaltAreas: AsphaltArea3D[] = results.map(result => ({
      id: result.id,
      name: `Asphalt Area ${result.id.split('_').pop()}`,
      vertices: result.polygonCoordinates.map(coord => ({
        x: coord.x,
        y: 0,
        z: coord.y
      })) as any,
      height: result.measurements.estimatedThickness / 100, // convert cm to meters
      condition: result.condition.overall,
      color: getConditionColor(result.condition.overall),
      measurements: {
        area: result.measurements.area,
        volume: result.measurements.area * (result.measurements.estimatedThickness / 100),
        thickness: result.measurements.estimatedThickness
      }
    }));

    setCurrentProject(prev => prev ? {
      ...prev,
      detectionResults: [...prev.detectionResults, ...results],
      asphaltAreas: [...prev.asphaltAreas, ...asphaltAreas],
      status: 'completed'
    } : null);
  }, [currentProject]);

  const getConditionColor = (condition: string): string => {
    switch (condition) {
      case 'excellent': return '#4ade80';
      case 'good': return '#22d3ee';
      case 'fair': return '#fbbf24';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const addNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const exportProject = useCallback(() => {
    if (!currentProject) return;

    const exportData = {
      project: currentProject,
      exportTimestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addNotification('success', 'Project exported successfully');
  }, [currentProject]);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold flex items-center">
            <Map className="mr-3 w-8 h-8" />
            Comprehensive Mapping System
          </h1>
          {currentProject && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{currentProject.name}</Badge>
              <Badge variant={currentProject.status === 'completed' ? 'default' : 'secondary'}>
                {currentProject.status}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <Select value={viewMode} onValueChange={(value: '2d' | '3d') => setViewMode(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2d">2D</SelectItem>
              <SelectItem value="3d">3D</SelectItem>
              <SelectItem value="split">Split</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setShowUploadDialog(true)}
            disabled={!currentProject}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>

          <Button 
            variant="outline" 
            onClick={startAutomaticDetection}
            disabled={!currentProject || isProcessing}
          >
            <Scan className="w-4 h-4 mr-2" />
            Auto Detect
          </Button>

          <Button 
            variant="outline" 
            onClick={optimizeParkingLayout}
            disabled={!currentProject || isProcessing}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Optimize
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowExportDialog(true)}
            disabled={!currentProject}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => setShowProjectDialog(true)}>
            New Project
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="absolute top-20 right-4 z-50 space-y-2 w-96">
          {notifications.map(notification => (
            <Alert 
              key={notification.id} 
              variant={notification.type === 'error' ? 'destructive' : 'default'}
              className="bg-background/95 backdrop-blur-sm border shadow-lg"
            >
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="px-4 py-2 border-b">
          <Progress value={analysisProgress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-1">
            Processing... {analysisProgress.toFixed(0)}%
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {currentProject ? (
          <>
            {viewMode === '2d' && (
              <MapOverlaySystem />
            )}
            
            {viewMode === '3d' && (
              <Enhanced3DVisualization
                measurements={currentProject.measurements}
                asphaltAreas={currentProject.asphaltAreas}
                parkingSpaces={currentProject.parkingSpaces}
                onExport={exportProject}
              />
            )}
            
            {viewMode === 'split' && (
              <div className="flex w-full">
                <div className="w-1/2 border-r">
                  <MapOverlaySystem />
                </div>
                <div className="w-1/2">
                  <Enhanced3DVisualization
                    measurements={currentProject.measurements}
                    asphaltAreas={currentProject.asphaltAreas}
                    parkingSpaces={currentProject.parkingSpaces}
                    onExport={exportProject}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Map className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-4">Welcome to Comprehensive Mapping</h2>
              <p className="text-muted-foreground mb-6">
                Create a new project to start analyzing asphalt surfaces, optimizing parking layouts, 
                and generating detailed measurements with our advanced AI-powered tools.
              </p>
              <Button onClick={() => setShowProjectDialog(true)} size="lg">
                Create New Project
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Project Creation Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            createNewProject(
              formData.get('name') as string,
              formData.get('description') as string,
              {
                lat: parseFloat(formData.get('lat') as string) || 37.7749,
                lng: parseFloat(formData.get('lng') as string) || -122.4194,
                address: formData.get('address') as string
              }
            );
            setShowProjectDialog(false);
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" name="name" placeholder="Enter project name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Project description" />
              </div>
              <div>
                <Label htmlFor="address">Location Address</Label>
                <Input id="address" name="address" placeholder="Project location" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" name="lat" type="number" step="any" placeholder="37.7749" />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" name="lng" type="number" step="any" placeholder="-122.4194" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowProjectDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Images for Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="files">Select Images</Label>
              <Input 
                id="files" 
                type="file" 
                multiple 
                accept="image/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: JPG, PNG, WebP. Max 10 files.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedFiles) {
                    handleFileUpload(selectedFiles);
                    setShowUploadDialog(false);
                  }
                }}
                disabled={!selectedFiles}
              >
                Upload & Analyze
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your project data including measurements, analysis results, and optimizations.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                exportProject();
                setShowExportDialog(false);
              }}>
                Export JSON
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveMappingSystem;