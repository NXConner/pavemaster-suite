import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Layout,
  Car,
  Maximize,
  RotateCw,
  Grid3X3,
  Ruler,
  Palette,
  Save,
  Download,
  Upload,
  Trash2,
  Copy,
  Move,
  Plus,
  Settings,
  Eye,
  Calculator,
  Zap
} from 'lucide-react';

interface ParkingSpace {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  type: 'standard' | 'compact' | 'handicap' | 'electric';
  accessible: boolean;
}

interface LayoutDesign {
  id: string;
  name: string;
  totalArea: number;
  spaces: ParkingSpace[];
  efficiency: number;
  aisleWidth: number;
  driveways: Array<{ x: number; y: number; width: number; height: number }>;
  landscaping: Array<{ x: number; y: number; width: number; height: number; type: string }>;
  createdAt: string;
  estimatedCost: number;
}

interface OptimizationSettings {
  spaceWidth: number;
  spaceLength: number;
  aisleWidth: number;
  handicapRatio: number;
  compactRatio: number;
  electricRatio: number;
  maxAngle: number;
  prioritizeCapacity: boolean;
  minimumTurningRadius: number;
}

export default function ParkingLotDesigner() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [designs, setDesigns] = useState<LayoutDesign[]>([]);
  const [currentDesign, setCurrentDesign] = useState<LayoutDesign | null>(null);
  const [selectedTool, setSelectedTool] = useState<'space' | 'aisle' | 'landscape' | 'move'>('space');
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lotDimensions, setLotDimensions] = useState({ width: 200, height: 150 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showGrid, setShowGrid] = useState(true);
  
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    spaceWidth: 9,
    spaceLength: 18,
    aisleWidth: 24,
    handicapRatio: 0.02,
    compactRatio: 0.2,
    electricRatio: 0.05,
    maxAngle: 90,
    prioritizeCapacity: true,
    minimumTurningRadius: 20
  });

  useEffect(() => {
    loadDesigns();
    initializeCanvas();
  }, []);

  const loadDesigns = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockDesigns: LayoutDesign[] = [
      {
        id: '1',
        name: 'Church Main Lot - Optimized',
        totalArea: 15000,
        spaces: [],
        efficiency: 85,
        aisleWidth: 24,
        driveways: [],
        landscaping: [],
        createdAt: new Date().toISOString(),
        estimatedCost: 125000
      }
    ];
    setDesigns(mockDesigns);
  };

  const initializeCanvas = () => {
    if (canvasRef.current) {
      redrawCanvas();
    }
  };

  const startNewDesign = () => {
    const newDesign: LayoutDesign = {
      id: Date.now().toString(),
      name: `Design ${designs.length + 1}`,
      totalArea: lotDimensions.width * lotDimensions.height,
      spaces: [],
      efficiency: 0,
      aisleWidth: optimizationSettings.aisleWidth,
      driveways: [],
      landscaping: [],
      createdAt: new Date().toISOString(),
      estimatedCost: 0
    };
    setCurrentDesign(newDesign);
    redrawCanvas();
  };

  const optimizeLayout = () => {
    if (!currentDesign) return;

    const optimizedSpaces = generateOptimizedSpaces();
    const efficiency = calculateEfficiency(optimizedSpaces);
    const cost = estimateCost(optimizedSpaces);

    const updatedDesign: LayoutDesign = {
      ...currentDesign,
      spaces: optimizedSpaces,
      efficiency,
      estimatedCost: cost
    };

    setCurrentDesign(updatedDesign);
    redrawCanvas();

    toast({
      title: "Layout Optimized",
      description: `Generated ${optimizedSpaces.length} spaces with ${efficiency.toFixed(1)}% efficiency`,
    });
  };

  const generateOptimizedSpaces = (): ParkingSpace[] => {
    const spaces: ParkingSpace[] = [];
    const { width, height } = lotDimensions;
    const { spaceWidth, spaceLength, aisleWidth } = optimizationSettings;
    
    // Calculate optimal layout
    const rowHeight = spaceLength + aisleWidth;
    const numRows = Math.floor(height / rowHeight);
    const spacesPerRow = Math.floor(width / spaceWidth);
    
    let spaceId = 1;
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < spacesPerRow; col++) {
        const x = col * spaceWidth;
        const y = row * rowHeight;
        
        // Determine space type based on ratios
        let type: ParkingSpace['type'] = 'standard';
        const random = Math.random();
        
        if (random < optimizationSettings.handicapRatio) {
          type = 'handicap';
        } else if (random < optimizationSettings.handicapRatio + optimizationSettings.compactRatio) {
          type = 'compact';
        } else if (random < optimizationSettings.handicapRatio + optimizationSettings.compactRatio + optimizationSettings.electricRatio) {
          type = 'electric';
        }
        
        spaces.push({
          id: spaceId.toString(),
          x,
          y,
          width: type === 'compact' ? spaceWidth * 0.8 : spaceWidth,
          height: type === 'handicap' ? spaceLength * 1.2 : spaceLength,
          angle: 0,
          type,
          accessible: type === 'handicap'
        });
        
        spaceId++;
      }
    }
    
    return spaces;
  };

  const calculateEfficiency = (spaces: ParkingSpace[]): number => {
    if (!currentDesign) return 0;
    
    const totalSpaceArea = spaces.reduce((sum, space) => sum + (space.width * space.height), 0);
    const efficiency = (totalSpaceArea / currentDesign.totalArea) * 100;
    
    return Math.min(efficiency, 100);
  };

  const estimateCost = (spaces: ParkingSpace[]): number => {
    const baseRate = 8.5; // dollars per square foot
    const totalArea = currentDesign?.totalArea || 0;
    
    // Additional costs for special spaces
    const handicapSpaces = spaces.filter(s => s.type === 'handicap').length;
    const electricSpaces = spaces.filter(s => s.type === 'electric').length;
    
    const baseCost = totalArea * baseRate;
    const handicapCost = handicapSpaces * 500; // Additional cost for handicap features
    const electricCost = electricSpaces * 1200; // EV charging infrastructure
    
    return Math.round(baseCost + handicapCost + electricCost);
  };

  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx);
    }
    
    // Draw lot boundary
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, lotDimensions.width, lotDimensions.height);
    
    // Draw parking spaces
    if (currentDesign?.spaces) {
      currentDesign.spaces.forEach(space => drawParkingSpace(ctx, space));
    }
    
    // Draw driveways
    if (currentDesign?.driveways) {
      currentDesign.driveways.forEach(driveway => drawDriveway(ctx, driveway));
    }
    
    // Draw landscaping
    if (currentDesign?.landscaping) {
      currentDesign.landscaping.forEach(landscape => drawLandscaping(ctx, landscape));
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 10;
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= lotDimensions.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, lotDimensions.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= lotDimensions.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(lotDimensions.width, y);
      ctx.stroke();
    }
  };

  const drawParkingSpace = (ctx: CanvasRenderingContext2D, space: ParkingSpace) => {
    const colors = {
      standard: '#3b82f6',
      compact: '#8b5cf6',
      handicap: '#ef4444',
      electric: '#10b981'
    };
    
    ctx.fillStyle = selectedSpaces.includes(space.id) ? '#fbbf24' : colors[space.type];
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    ctx.save();
    ctx.translate(space.x + space.width / 2, space.y + space.height / 2);
    ctx.rotate((space.angle * Math.PI) / 180);
    
    ctx.fillRect(-space.width / 2, -space.height / 2, space.width, space.height);
    ctx.strokeRect(-space.width / 2, -space.height / 2, space.width, space.height);
    
    // Draw space number
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(space.id, 0, 0);
    
    // Draw type indicator
    if (space.type === 'handicap') {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('♿', 0, -8);
    } else if (space.type === 'electric') {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('⚡', 0, -8);
    }
    
    ctx.restore();
  };

  const drawDriveway = (ctx: CanvasRenderingContext2D, driveway: any) => {
    ctx.fillStyle = '#666';
    ctx.fillRect(driveway.x, driveway.y, driveway.width, driveway.height);
  };

  const drawLandscaping = (ctx: CanvasRenderingContext2D, landscape: any) => {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(landscape.x, landscape.y, landscape.width, landscape.height);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentDesign) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool === 'space') {
      addParkingSpace(x, y);
    } else if (selectedTool === 'move') {
      selectSpace(x, y);
    }
  };

  const addParkingSpace = (x: number, y: number) => {
    if (!currentDesign) return;

    const newSpace: ParkingSpace = {
      id: (currentDesign.spaces.length + 1).toString(),
      x: x - optimizationSettings.spaceWidth / 2,
      y: y - optimizationSettings.spaceLength / 2,
      width: optimizationSettings.spaceWidth,
      height: optimizationSettings.spaceLength,
      angle: 0,
      type: 'standard',
      accessible: false
    };

    const updatedDesign = {
      ...currentDesign,
      spaces: [...currentDesign.spaces, newSpace]
    };

    setCurrentDesign(updatedDesign);
    redrawCanvas();
  };

  const selectSpace = (x: number, y: number) => {
    if (!currentDesign) return;

    const clickedSpace = currentDesign.spaces.find(space => 
      x >= space.x && x <= space.x + space.width &&
      y >= space.y && y <= space.y + space.height
    );

    if (clickedSpace) {
      setSelectedSpaces(prev => 
        prev.includes(clickedSpace.id) 
          ? prev.filter(id => id !== clickedSpace.id)
          : [...prev, clickedSpace.id]
      );
      redrawCanvas();
    }
  };

  const saveDesign = () => {
    if (currentDesign) {
      setDesigns(prev => [...prev, currentDesign]);
      toast({
        title: "Design Saved",
        description: `${currentDesign.name} has been saved successfully`,
      });
    }
  };

  const exportDesign = () => {
    if (!canvasRef.current || !currentDesign) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${currentDesign.name}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Design Exported",
      description: "Layout has been exported as PNG image",
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [currentDesign, selectedSpaces, showGrid, lotDimensions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layout className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Parking Lot Designer</h1>
              <p className="text-muted-foreground">
                Design optimal parking layouts with intelligent space optimization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={startNewDesign} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Design
            </Button>
            <Button onClick={optimizeLayout} disabled={!currentDesign}>
              <Zap className="h-4 w-4 mr-2" />
              Auto Optimize
            </Button>
          </div>
        </div>

        <Tabs defaultValue="design" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="design">Design Canvas</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="saved">Saved Designs</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Grid3X3 className="h-5 w-5" />
                        Design Canvas
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGrid(!showGrid)}
                        >
                          <Grid3X3 className="h-4 w-4 mr-2" />
                          {showGrid ? 'Hide' : 'Show'} Grid
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportDesign}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant={selectedTool === 'space' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('space')}
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Add Space
                        </Button>
                        <Button
                          variant={selectedTool === 'move' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('move')}
                        >
                          <Move className="h-4 w-4 mr-2" />
                          Select/Move
                        </Button>
                        <Button
                          variant={selectedTool === 'aisle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('aisle')}
                        >
                          <Ruler className="h-4 w-4 mr-2" />
                          Add Aisle
                        </Button>
                        <Button
                          variant={selectedTool === 'landscape' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('landscape')}
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          Landscaping
                        </Button>
                      </div>
                      
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="border border-gray-300 rounded-md cursor-crosshair bg-white"
                        onClick={handleCanvasClick}
                      />
                      
                      {currentDesign && (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {currentDesign.spaces.length}
                            </div>
                            <div className="text-muted-foreground">Total Spaces</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {currentDesign.efficiency.toFixed(1)}%
                            </div>
                            <div className="text-muted-foreground">Efficiency</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {currentDesign.totalArea.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">Total Area (sq ft)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              ${currentDesign.estimatedCost.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">Est. Cost</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Lot Dimensions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Width (ft)</label>
                      <Input
                        type="number"
                        value={lotDimensions.width}
                        onChange={(e) => setLotDimensions(prev => ({
                          ...prev,
                          width: Number(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Height (ft)</label>
                      <Input
                        type="number"
                        value={lotDimensions.height}
                        onChange={(e) => setLotDimensions(prev => ({
                          ...prev,
                          height: Number(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Space Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Standard</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>Compact</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Handicap ♿</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Electric ⚡</span>
                    </div>
                  </CardContent>
                </Card>

                {currentDesign && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button onClick={saveDesign} className="w-full" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Design
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        3D Preview
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Calculator className="h-4 w-4 mr-2" />
                        Cost Analysis
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Optimization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Space Dimensions</h3>
                    <div>
                      <label className="text-sm font-medium">Space Width (ft)</label>
                      <Slider
                        value={[optimizationSettings.spaceWidth]}
                        onValueChange={([value]) => 
                          setOptimizationSettings(prev => ({ ...prev, spaceWidth: value }))
                        }
                        min={8}
                        max={12}
                        step={0.5}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {optimizationSettings.spaceWidth} ft
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Space Length (ft)</label>
                      <Slider
                        value={[optimizationSettings.spaceLength]}
                        onValueChange={([value]) => 
                          setOptimizationSettings(prev => ({ ...prev, spaceLength: value }))
                        }
                        min={16}
                        max={22}
                        step={0.5}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {optimizationSettings.spaceLength} ft
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Aisle Width (ft)</label>
                      <Slider
                        value={[optimizationSettings.aisleWidth]}
                        onValueChange={([value]) => 
                          setOptimizationSettings(prev => ({ ...prev, aisleWidth: value }))
                        }
                        min={20}
                        max={30}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {optimizationSettings.aisleWidth} ft
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Space Mix Ratios</h3>
                    <div>
                      <label className="text-sm font-medium">Handicap Spaces (%)</label>
                      <Slider
                        value={[optimizationSettings.handicapRatio * 100]}
                        onValueChange={([value]) => 
                          setOptimizationSettings(prev => ({ ...prev, handicapRatio: value / 100 }))
                        }
                        min={2}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {(optimizationSettings.handicapRatio * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Compact Spaces (%)</label>
                      <Slider
                        value={[optimizationSettings.compactRatio * 100]}
                        onValueChange={([value]) => 
                          setOptimizationSettings(prev => ({ ...prev, compactRatio: value / 100 }))
                        }
                        min={0}
                        max={40}
                        step={5}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {(optimizationSettings.compactRatio * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Electric Vehicle Spaces (%)</label>
                      <Slider
                        value={[optimizationSettings.electricRatio * 100]}
                        onValueChange={([value]) => 
                          setOptimizationSettings(prev => ({ ...prev, electricRatio: value / 100 }))
                        }
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {(optimizationSettings.electricRatio * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <Button onClick={optimizeLayout} className="w-full">
                    <Maximize className="h-4 w-4 mr-2" />
                    Generate Optimized Layout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {currentDesign ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Space Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentDesign.spaces.filter(s => s.type === 'standard').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Standard Spaces</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {currentDesign.spaces.filter(s => s.type === 'compact').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Compact Spaces</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {currentDesign.spaces.filter(s => s.type === 'handicap').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Handicap Spaces</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {currentDesign.spaces.filter(s => s.type === 'electric').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Electric Spaces</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Asphalt Cost:</span>
                        <span>${(currentDesign.totalArea * 8.5).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Striping & Marking:</span>
                        <span>${(currentDesign.spaces.length * 45).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Handicap Features:</span>
                        <span>${(currentDesign.spaces.filter(s => s.type === 'handicap').length * 500).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EV Infrastructure:</span>
                        <span>${(currentDesign.spaces.filter(s => s.type === 'electric').length * 1200).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total Estimated Cost:</span>
                        <span>${currentDesign.estimatedCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Design Selected</h3>
                  <p className="text-muted-foreground">
                    Create or select a design to view analysis data
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {designs.map((design) => (
                <Card key={design.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{design.name}</span>
                      <Badge variant="outline">{design.spaces.length} spaces</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Area</div>
                        <div className="font-medium">{design.totalArea.toLocaleString()} sq ft</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Efficiency</div>
                        <div className="font-medium">{design.efficiency.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Est. Cost</div>
                        <div className="font-medium">${design.estimatedCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div className="font-medium">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setCurrentDesign(design)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Load
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}