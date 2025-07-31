import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Ruler,
  Camera,
  MapPin,
  Calculator,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  Plus,
  Square,
  Circle,
  Triangle,
  Pentagon,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface Measurement {
  id: string;
  name: string;
  type: 'area' | 'length' | 'perimeter' | 'volume';
  value: number;
  unit: string;
  method: 'manual' | 'photo' | 'gps' | 'drawing';
  coordinates?: Array<{ x: number; y: number; lat?: number; lng?: number }>;
  projectId?: string;
  notes?: string;
  createdAt: string;
  materialCalculations?: {
    asphalt: number;
    sealcoat: number;
    striping: number;
  };
}

interface DrawingPoint {
  x: number;
  y: number;
  lat?: number;
  lng?: number;
}

export default function MeasurementsPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[]>([]);
  const [selectedTool, setSelectedTool] = useState<'polygon' | 'rectangle' | 'circle'>('polygon');
  const [scale, setScale] = useState(1); // pixels per foot
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showMaterialCalc, setShowMaterialCalc] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockMeasurements: Measurement[] = [
      {
        id: '1',
        name: 'Church Parking Lot - Main Area',
        type: 'area',
        value: 12500,
        unit: 'sq ft',
        method: 'gps',
        projectId: 'proj-1',
        notes: 'Main parking area with existing asphalt',
        createdAt: new Date().toISOString(),
        materialCalculations: {
          asphalt: 25.5,
          sealcoat: 12.5,
          striping: 850
        }
      },
      {
        id: '2',
        name: 'Side Parking Strip',
        type: 'area',
        value: 3200,
        unit: 'sq ft',
        method: 'photo',
        projectId: 'proj-1',
        notes: 'Narrow strip along building',
        createdAt: new Date().toISOString(),
        materialCalculations: {
          asphalt: 6.5,
          sealcoat: 3.2,
          striping: 220
        }
      }
    ];
    setMeasurements(mockMeasurements);
  };

  const startNewMeasurement = () => {
    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      name: `Measurement ${measurements.length + 1}`,
      type: 'area',
      value: 0,
      unit: 'sq ft',
      method: 'drawing',
      coordinates: [],
      createdAt: new Date().toISOString(),
    };
    setCurrentMeasurement(newMeasurement);
    setDrawingPoints([]);
    setIsDrawing(true);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newPoint: DrawingPoint = { x, y };
    
    if (selectedTool === 'polygon') {
      setDrawingPoints(prev => [...prev, newPoint]);
    } else if (selectedTool === 'rectangle' && drawingPoints.length === 0) {
      setDrawingPoints([newPoint]);
    } else if (selectedTool === 'rectangle' && drawingPoints.length === 1) {
      setDrawingPoints(prev => [...prev, newPoint]);
      completeDrawing([...drawingPoints, newPoint]);
    }

    redrawCanvas();
  };

  const completeDrawing = (points: DrawingPoint[] = drawingPoints) => {
    if (points.length < 3) {
      toast({
        title: "Insufficient Points",
        description: "Please draw at least 3 points to create an area",
        variant: "destructive",
      });
      return;
    }

    const area = calculatePolygonArea(points);
    
    if (currentMeasurement) {
      const updatedMeasurement: Measurement = {
        ...currentMeasurement,
        value: area,
        coordinates: points,
        materialCalculations: calculateMaterials(area)
      };
      
      setCurrentMeasurement(updatedMeasurement);
      setIsDrawing(false);
      setShowMaterialCalc(true);
    }
  };

  const calculatePolygonArea = (points: DrawingPoint[]): number => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Convert pixels to square feet using scale
    return Math.round((area / (scale * scale)) * 100) / 100;
  };

  const calculateMaterials = (areaInSqFt: number) => {
    return {
      asphalt: Math.round((areaInSqFt * 0.00204) * 100) / 100, // tons
      sealcoat: Math.round((areaInSqFt * 0.001) * 100) / 100, // gallons per sq ft
      striping: Math.round(Math.sqrt(areaInSqFt) * 4 * 8) // linear feet estimate
    };
  };

  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw uploaded image if available
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawMeasurements(ctx);
      };
      img.src = uploadedImage;
    } else {
      drawMeasurements(ctx);
    }
  };

  const drawMeasurements = (ctx: CanvasRenderingContext2D) => {
    // Draw current drawing points
    if (drawingPoints.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
      
      for (let i = 1; i < drawingPoints.length; i++) {
        ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y);
      }
      
      if (drawingPoints.length > 2) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();
      
      // Draw points
      drawingPoints.forEach((point, index) => {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw point numbers
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), point.x, point.y + 4);
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setTimeout(redrawCanvas, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMeasurement = () => {
    if (currentMeasurement) {
      setMeasurements(prev => [...prev, currentMeasurement]);
      setCurrentMeasurement(null);
      setDrawingPoints([]);
      setIsDrawing(false);
      setShowMaterialCalc(false);
      
      toast({
        title: "Measurement Saved",
        description: `${currentMeasurement.name} has been saved successfully`,
      });
    }
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Measurement Deleted",
      description: "Measurement has been removed",
    });
  };

  const clearDrawing = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
    setCurrentMeasurement(null);
    redrawCanvas();
  };

  useEffect(() => {
    redrawCanvas();
  }, [drawingPoints, uploadedImage]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ruler className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Measurements & Area Calculation</h1>
              <p className="text-muted-foreground">
                Measure areas, calculate materials, and estimate costs
              </p>
            </div>
          </div>
          <Button onClick={startNewMeasurement}>
            <Plus className="h-4 w-4 mr-2" />
            New Measurement
          </Button>
        </div>

        <Tabs defaultValue="drawing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="drawing">Drawing Tools</TabsTrigger>
            <TabsTrigger value="photo">Photo Measurement</TabsTrigger>
            <TabsTrigger value="gps">GPS Polygon</TabsTrigger>
            <TabsTrigger value="saved">Saved Measurements</TabsTrigger>
          </TabsList>

          <TabsContent value="drawing" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Square className="h-5 w-5" />
                      Drawing Canvas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant={selectedTool === 'polygon' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('polygon')}
                        >
                          <Pentagon className="h-4 w-4 mr-2" />
                          Polygon
                        </Button>
                        <Button
                          variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('rectangle')}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Rectangle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearDrawing}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                        {drawingPoints.length > 2 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => completeDrawing()}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Complete Area
                          </Button>
                        )}
                      </div>
                      
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="border border-gray-300 rounded-md cursor-crosshair bg-gray-50"
                        onClick={handleCanvasClick}
                      />
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {drawingPoints.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Points: {drawingPoints.length} | 
                          Current Area: {calculatePolygonArea(drawingPoints)} sq ft
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Scale Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Scale (pixels per foot)</label>
                      <Input
                        type="number"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Adjust scale for accurate measurements. 
                      Default: 1 pixel = 1 foot
                    </div>
                  </CardContent>
                </Card>

                {currentMeasurement && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Measurement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={currentMeasurement.name}
                          onChange={(e) => setCurrentMeasurement({
                            ...currentMeasurement,
                            name: e.target.value
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select value={currentMeasurement.type} onValueChange={(value: any) => 
                          setCurrentMeasurement({...currentMeasurement, type: value})
                        }>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="area">Area</SelectItem>
                            <SelectItem value="length">Length</SelectItem>
                            <SelectItem value="perimeter">Perimeter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Input
                          value={currentMeasurement.notes || ''}
                          onChange={(e) => setCurrentMeasurement({
                            ...currentMeasurement,
                            notes: e.target.value
                          })}
                          className="mt-1"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showMaterialCalc && currentMeasurement?.materialCalculations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Material Estimates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Asphalt:</span>
                        <span className="font-medium">
                          {currentMeasurement.materialCalculations.asphalt} tons
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sealcoat:</span>
                        <span className="font-medium">
                          {currentMeasurement.materialCalculations.sealcoat} gal
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Striping:</span>
                        <span className="font-medium">
                          {currentMeasurement.materialCalculations.striping} ft
                        </span>
                      </div>
                      <Button onClick={saveMeasurement} className="w-full mt-4">
                        <Save className="h-4 w-4 mr-2" />
                        Save Measurement
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo-Based Measurement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Photo Measurement Tools</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload photos and trace areas for automatic measurement calculation
                  </p>
                  <div className="space-y-4">
                    <Button>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Aerial Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  GPS Polygon Drawing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">GPS Area Measurement</h3>
                  <p className="text-muted-foreground mb-6">
                    Walk the perimeter with GPS to automatically calculate area
                  </p>
                  <div className="space-y-4">
                    <Button>
                      <MapPin className="h-4 w-4 mr-2" />
                      Start GPS Recording
                    </Button>
                    <Button variant="outline">
                      <Square className="h-4 w-4 mr-2" />
                      Draw on Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {measurements.map((measurement) => (
                <Card key={measurement.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{measurement.name}</span>
                      <Badge variant="outline">{measurement.method}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Area</div>
                        <div className="font-medium">{measurement.value} {measurement.unit}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div className="font-medium capitalize">{measurement.type}</div>
                      </div>
                    </div>
                    
                    {measurement.materialCalculations && (
                      <div className="pt-4 border-t space-y-2">
                        <div className="text-sm font-medium">Material Estimates:</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Asphalt</div>
                            <div className="font-medium">{measurement.materialCalculations.asphalt}t</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Sealcoat</div>
                            <div className="font-medium">{measurement.materialCalculations.sealcoat}g</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Striping</div>
                            <div className="font-medium">{measurement.materialCalculations.striping}ft</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteMeasurement(measurement.id)}
                      >
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