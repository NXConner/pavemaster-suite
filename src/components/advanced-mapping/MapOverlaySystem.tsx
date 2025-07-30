import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Map, Layers, Ruler, Eye, EyeOff, Square, Circle, Polygon, 
  Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Move3D,
  Calculator, Camera, Download, Settings, Palette, Grid3X3,
  Route, Car, MapPin, Compass, Crosshair, Target, Scan
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
import * as THREE from 'three';

interface MapOverlay {
  id: string;
  name: string;
  type: 'measurement' | 'asphalt_detection' | 'parking_layout' | 'optimization' | 'boundary' | 'route';
  visible: boolean;
  opacity: number;
  color: string;
  data: any;
  measurements?: {
    area: number;
    perimeter: number;
    volume?: number;
    coordinates: Array<{lat: number, lng: number}>;
  };
  asphaltProperties?: {
    surfaceType: 'asphalt' | 'concrete' | 'gravel' | 'dirt';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    thickness: number;
    age: number;
    maintenanceRequired: boolean;
  };
  parkingLayout?: {
    totalSpaces: number;
    accessibleSpaces: number;
    efficiency: number;
    layout: Array<{
      id: string;
      type: 'standard' | 'accessible' | 'compact' | 'electric';
      position: {lat: number, lng: number};
      angle: number;
      occupied: boolean;
    }>;
  };
}

interface MeasurementTool {
  id: string;
  name: string;
  icon: React.ElementType;
  type: 'line' | 'area' | 'volume' | 'angle' | 'radius';
  active: boolean;
  measurements: Array<{
    id: string;
    value: number;
    unit: string;
    coordinates: Array<{lat: number, lng: number}>;
    timestamp: Date;
  }>;
}

interface AsphaltDetectionResult {
  id: string;
  confidence: number;
  boundingBox: Array<{lat: number, lng: number}>;
  surfaceType: string;
  condition: string;
  area: number;
  recommendations: string[];
  estimatedCost?: {
    sealcoating: number;
    resurfacing: number;
    maintenance: number;
  };
}

interface ParkingOptimization {
  id: string;
  originalLayout: any;
  optimizedLayout: any;
  improvements: {
    spaceIncrease: number;
    efficiencyGain: number;
    accessibilityCompliance: boolean;
    trafficFlow: 'improved' | 'maintained' | 'degraded';
  };
  costBenefit: {
    implementationCost: number;
    annualSavings: number;
    paybackPeriod: number;
  };
}

const MapOverlaySystem: React.FC = () => {
  const [overlays, setOverlays] = useState<MapOverlay[]>([]);
  const [measurementTools, setMeasurementTools] = useState<MeasurementTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<AsphaltDetectionResult[]>([]);
  const [parkingOptimizations, setParkingOptimizations] = useState<ParkingOptimization[]>([]);
  const [showPopout, setShowPopout] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<MapOverlay | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [mapMode, setMapMode] = useState<'2d' | '3d' | '360'>('2d');
  const [measurementUnit, setMeasurementUnit] = useState<'metric' | 'imperial'>('metric');
  const [backgroundMode, setBackgroundMode] = useState<'map' | 'white' | 'blueprint'>('map');

  const mapRef = useRef<HTMLDivElement>(null);
  const threejsRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Initialize measurement tools
  useEffect(() => {
    const tools: MeasurementTool[] = [
      {
        id: 'distance',
        name: 'Distance',
        icon: Ruler,
        type: 'line',
        active: false,
        measurements: []
      },
      {
        id: 'area',
        name: 'Area',
        icon: Square,
        type: 'area',
        active: false,
        measurements: []
      },
      {
        id: 'perimeter',
        name: 'Perimeter',
        icon: Polygon,
        type: 'area',
        active: false,
        measurements: []
      },
      {
        id: 'radius',
        name: 'Radius',
        icon: Circle,
        type: 'radius',
        active: false,
        measurements: []
      },
      {
        id: 'volume',
        name: 'Volume',
        icon: Calculator,
        type: 'volume',
        active: false,
        measurements: []
      }
    ];
    setMeasurementTools(tools);
  }, []);

  // Initialize 3D scene
  useEffect(() => {
    if (show3D && mapRef.current && !threejsRef.current) {
      initThreeJS();
    }
  }, [show3D]);

  const initThreeJS = () => {
    if (!mapRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    if (backgroundMode === 'white') {
      scene.background = new THREE.Color(0xffffff);
    } else if (backgroundMode === 'blueprint') {
      scene.background = new THREE.Color(0x001133);
    }

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mapRef.current.clientWidth / mapRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 10);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mapRef.current.clientWidth, mapRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add to DOM
    mapRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: backgroundMode === 'white' ? 0xf0f0f0 : 0x333333 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    threejsRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (mapMode === '360' && cameraRef.current) {
        cameraRef.current.position.x = Math.cos(Date.now() * 0.001) * 15;
        cameraRef.current.position.z = Math.sin(Date.now() * 0.001) * 15;
        cameraRef.current.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();
  };

  const addOverlay = useCallback((type: MapOverlay['type'], data: any) => {
    const newOverlay: MapOverlay = {
      id: `overlay-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${overlays.length + 1}`,
      type,
      visible: true,
      opacity: 0.7,
      color: getOverlayColor(type),
      data,
      measurements: type === 'measurement' ? data.measurements : undefined,
      asphaltProperties: type === 'asphalt_detection' ? data.asphaltProperties : undefined,
      parkingLayout: type === 'parking_layout' ? data.parkingLayout : undefined
    };

    setOverlays(prev => [...prev, newOverlay]);
    return newOverlay;
  }, [overlays.length]);

  const getOverlayColor = (type: MapOverlay['type']): string => {
    const colors = {
      measurement: '#ff6b6b',
      asphalt_detection: '#4ecdc4',
      parking_layout: '#45b7d1',
      optimization: '#96ceb4',
      boundary: '#ffa726',
      route: '#ab47bc'
    };
    return colors[type] || '#666666';
  };

  const toggleOverlay = (id: string) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, visible: !overlay.visible } : overlay
    ));
  };

  const updateOverlayOpacity = (id: string, opacity: number) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, opacity } : overlay
    ));
  };

  const selectMeasurementTool = (toolId: string) => {
    setMeasurementTools(prev => prev.map(tool => ({
      ...tool,
      active: tool.id === toolId ? !tool.active : false
    })));
    setSelectedTool(toolId);
  };

  const startAsphaltDetection = async () => {
    setIsDetecting(true);
    
    // Simulate AI-powered asphalt detection
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
      
      const mockResults: AsphaltDetectionResult[] = [
        {
          id: 'asphalt-1',
          confidence: 0.95,
          boundingBox: [
            { lat: 37.7749, lng: -122.4194 },
            { lat: 37.7750, lng: -122.4194 },
            { lat: 37.7750, lng: -122.4190 },
            { lat: 37.7749, lng: -122.4190 }
          ],
          surfaceType: 'asphalt',
          condition: 'good',
          area: 2500, // square feet
          recommendations: [
            'Sealcoating recommended within 12 months',
            'Minor crack sealing required in northeast corner',
            'Drainage improvement suggested'
          ],
          estimatedCost: {
            sealcoating: 1250,
            resurfacing: 8500,
            maintenance: 350
          }
        },
        {
          id: 'asphalt-2',
          confidence: 0.88,
          boundingBox: [
            { lat: 37.7751, lng: -122.4195 },
            { lat: 37.7753, lng: -122.4195 },
            { lat: 37.7753, lng: -122.4192 },
            { lat: 37.7751, lng: -122.4192 }
          ],
          surfaceType: 'asphalt',
          condition: 'fair',
          area: 1800,
          recommendations: [
            'Immediate crack sealing required',
            'Consider overlay within 6 months',
            'Improve edge support'
          ],
          estimatedCost: {
            sealcoating: 900,
            resurfacing: 6120,
            maintenance: 580
          }
        }
      ];

      setDetectionResults(mockResults);

      // Add overlays for detected asphalt areas
      mockResults.forEach(result => {
        addOverlay('asphalt_detection', {
          asphaltProperties: {
            surfaceType: result.surfaceType,
            condition: result.condition,
            thickness: 3, // inches
            age: Math.floor(Math.random() * 15) + 5, // 5-20 years
            maintenanceRequired: result.condition !== 'excellent'
          },
          measurements: {
            area: result.area,
            perimeter: Math.sqrt(result.area) * 4, // Approximate for square
            coordinates: result.boundingBox
          }
        });
      });

    } catch (error) {
      console.error('Asphalt detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const optimizeParkingLayout = async (overlayId: string) => {
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay || !overlay.parkingLayout) return;

    // Simulate AI optimization
    const currentLayout = overlay.parkingLayout;
    const optimized: ParkingOptimization = {
      id: `optimization-${Date.now()}`,
      originalLayout: currentLayout,
      optimizedLayout: {
        ...currentLayout,
        totalSpaces: Math.floor(currentLayout.totalSpaces * 1.15), // 15% increase
        efficiency: Math.min(currentLayout.efficiency * 1.25, 100), // 25% efficiency gain
        layout: currentLayout.layout.map(space => ({
          ...space,
          angle: space.angle === 90 ? 60 : space.angle, // Angled parking for more spaces
        }))
      },
      improvements: {
        spaceIncrease: Math.floor(currentLayout.totalSpaces * 0.15),
        efficiencyGain: 25,
        accessibilityCompliance: true,
        trafficFlow: 'improved'
      },
      costBenefit: {
        implementationCost: 15000,
        annualSavings: 8500,
        paybackPeriod: 1.8 // years
      }
    };

    setParkingOptimizations(prev => [...prev, optimized]);

    // Add optimization overlay
    addOverlay('optimization', {
      parkingLayout: optimized.optimizedLayout,
      improvements: optimized.improvements
    });
  };

  const exportMeasurements = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      overlays: overlays.filter(o => o.measurements),
      unit: measurementUnit,
      tools: measurementTools
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurements-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showOverlayPopout = (overlay: MapOverlay) => {
    setSelectedOverlay(overlay);
    setShowPopout(true);
  };

  const convertUnit = (value: number, from: 'metric' | 'imperial', to: 'metric' | 'imperial'): number => {
    if (from === to) return value;
    if (from === 'metric' && to === 'imperial') {
      return value * 3.28084; // meters to feet
    }
    return value * 0.3048; // feet to meters
  };

  const render3DOverlay = (overlay: MapOverlay) => {
    if (!threejsRef.current || !overlay.measurements) return;

    const geometry = new THREE.BoxGeometry(1, 0.1, 1);
    const material = new THREE.MeshLambertMaterial({ 
      color: overlay.color,
      transparent: true,
      opacity: overlay.opacity
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    threejsRef.current.add(mesh);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Map className="mr-2" />
            Advanced Mapping System
          </h2>
          <Badge variant="outline">{overlays.length} Overlays</Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <Select value={mapMode} onValueChange={(value: '2d' | '3d' | '360') => setMapMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2d">2D Map</SelectItem>
              <SelectItem value="3d">3D View</SelectItem>
              <SelectItem value="360">360° View</SelectItem>
            </SelectContent>
          </Select>

          {/* Background Mode */}
          <Select value={backgroundMode} onValueChange={(value: 'map' | 'white' | 'blueprint') => setBackgroundMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Background" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="map">Map View</SelectItem>
              <SelectItem value="white">White Background</SelectItem>
              <SelectItem value="blueprint">Blueprint</SelectItem>
            </SelectContent>
          </Select>

          {/* Unit Toggle */}
          <Select value={measurementUnit} onValueChange={(value: 'metric' | 'imperial') => setMeasurementUnit(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="imperial">Imperial</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportMeasurements} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-80 bg-background border-r flex flex-col">
          <Tabs defaultValue="tools" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="overlays">Overlays</TabsTrigger>
              <TabsTrigger value="detection">AI Detect</TabsTrigger>
              <TabsTrigger value="optimize">Optimize</TabsTrigger>
            </TabsList>

            {/* Measurement Tools */}
            <TabsContent value="tools" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Measurement Tools</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {measurementTools.map(tool => {
                      const Icon = tool.icon;
                      return (
                        <Button
                          key={tool.id}
                          variant={tool.active ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectMeasurementTool(tool.id)}
                          className="flex flex-col h-16"
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-xs">{tool.name}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-1" />
                        Capture
                      </Button>
                      <Button variant="outline" size="sm">
                        <Grid3X3 className="w-4 h-4 mr-1" />
                        Grid
                      </Button>
                      <Button variant="outline" size="sm">
                        <Compass className="w-4 h-4 mr-1" />
                        North
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4 mr-1" />
                        Center
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Recent Measurements</Label>
                    <div className="space-y-2">
                      {measurementTools.flatMap(tool => 
                        tool.measurements.slice(0, 3).map(measurement => (
                          <div key={measurement.id} className="p-2 bg-muted rounded text-sm">
                            <div className="font-medium">{tool.name}</div>
                            <div>{measurement.value.toFixed(2)} {measurement.unit}</div>
                            <div className="text-xs text-muted-foreground">
                              {measurement.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Overlays Management */}
            <TabsContent value="overlays" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Map Overlays</h3>
                    <Button size="sm" variant="outline">
                      <Layers className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {overlays.map(overlay => (
                      <Card key={overlay.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: overlay.color }}
                              />
                              <span className="font-medium text-sm">{overlay.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleOverlay(overlay.id)}
                              >
                                {overlay.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </Button>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <Label className="text-xs">Opacity</Label>
                              <Slider
                                value={[overlay.opacity * 100]}
                                onValueChange={([value]) => updateOverlayOpacity(overlay.id, value / 100)}
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            {overlay.measurements && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Area: {overlay.measurements.area.toFixed(2)} {measurementUnit === 'metric' ? 'm²' : 'ft²'}
                              </div>
                            )}

                            <div className="flex space-x-1 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => showOverlayPopout(overlay)}
                              >
                                <Maximize2 className="w-3 h-3" />
                              </Button>
                              {overlay.type === 'parking_layout' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => optimizeParkingLayout(overlay.id)}
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI Detection */}
            <TabsContent value="detection" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Asphalt Detection</h3>
                  
                  <Button 
                    onClick={startAsphaltDetection} 
                    disabled={isDetecting}
                    className="w-full"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isDetecting ? 'Detecting...' : 'Auto-Detect Asphalt'}
                  </Button>

                  {detectionResults.length > 0 && (
                    <div className="space-y-2">
                      <Label>Detection Results</Label>
                      {detectionResults.map(result => (
                        <Card key={result.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">Asphalt Area {result.id.split('-')[1]}</span>
                              <Badge variant={result.condition === 'good' ? 'default' : 'destructive'}>
                                {result.condition}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Confidence: {(result.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs">
                              Area: {result.area} ft²
                            </div>
                            {result.estimatedCost && (
                              <div className="text-xs">
                                <div>Sealcoating: ${result.estimatedCost.sealcoating}</div>
                                <div>Resurfacing: ${result.estimatedCost.resurfacing}</div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Optimization */}
            <TabsContent value="optimize" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Parking Optimization</h3>
                  
                  {parkingOptimizations.map(optimization => (
                    <Card key={optimization.id} className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Optimization Result</h4>
                        <div className="space-y-1 text-xs">
                          <div>Space Increase: +{optimization.improvements.spaceIncrease} spaces</div>
                          <div>Efficiency Gain: +{optimization.improvements.efficiencyGain}%</div>
                          <div>Implementation Cost: ${optimization.costBenefit.implementationCost.toLocaleString()}</div>
                          <div>Payback Period: {optimization.costBenefit.paybackPeriod} years</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="w-full h-full"
            style={{ 
              backgroundColor: backgroundMode === 'white' ? '#ffffff' : 
                              backgroundMode === 'blueprint' ? '#001133' : '#f0f0f0' 
            }}
          >
            {mapMode === '2d' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Interactive Map View</h3>
                  <p className="text-muted-foreground">2D mapping with measurement overlays</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button variant="outline" size="sm">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Move3D className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Popout Window */}
      <Dialog open={showPopout} onOpenChange={setShowPopout}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedOverlay?.name} - Detailed View
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Crosshair className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {mapMode === '360' ? '360° View' : '3D Visualization'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {selectedOverlay?.measurements && (
                <div className="space-y-2">
                  <h4 className="font-medium">Measurements</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Area: {selectedOverlay.measurements.area.toFixed(2)} {measurementUnit === 'metric' ? 'm²' : 'ft²'}</div>
                    <div>Perimeter: {selectedOverlay.measurements.perimeter.toFixed(2)} {measurementUnit === 'metric' ? 'm' : 'ft'}</div>
                  </div>
                </div>
              )}
              
              {selectedOverlay?.asphaltProperties && (
                <div className="space-y-2">
                  <h4 className="font-medium">Asphalt Properties</h4>
                  <div className="space-y-1 text-sm">
                    <div>Condition: {selectedOverlay.asphaltProperties.condition}</div>
                    <div>Thickness: {selectedOverlay.asphaltProperties.thickness}"</div>
                    <div>Age: {selectedOverlay.asphaltProperties.age} years</div>
                    <div>Maintenance Required: {selectedOverlay.asphaltProperties.maintenanceRequired ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {selectedOverlay?.parkingLayout && (
                <div className="space-y-2">
                  <h4 className="font-medium">Parking Layout</h4>
                  <div className="space-y-1 text-sm">
                    <div>Total Spaces: {selectedOverlay.parkingLayout.totalSpaces}</div>
                    <div>Accessible Spaces: {selectedOverlay.parkingLayout.accessibleSpaces}</div>
                    <div>Efficiency: {selectedOverlay.parkingLayout.efficiency.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapOverlaySystem;