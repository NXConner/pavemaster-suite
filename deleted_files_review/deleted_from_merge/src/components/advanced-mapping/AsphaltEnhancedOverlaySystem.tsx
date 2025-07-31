import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Map, Layers, Eye, EyeOff, Palette, Contrast, Sparkles, 
  Filter, Zap, Target, Crosshair, Grid3X3, Scan, Camera,
  Sliders, RotateCcw, Download, Settings, Sun, Moon,
  Droplets, Thermometer, Wind, Cloud, MapPin, Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AsphaltOverlay {
  id: string;
  name: string;
  type: 'highlight' | 'contrast' | 'thermal' | 'condition' | 'texture' | 'edge_detection';
  enabled: boolean;
  intensity: number;
  color: string;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen' | 'difference' | 'exclusion';
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
    sharpness: number;
  };
  asphaltEnhancement: {
    surfaceHighlight: number;
    edgeDetection: number;
    textureEnhancement: number;
    contrastBoost: number;
    colorIsolation: number;
    depthPerception: number;
  };
  environmentalSupression: {
    grassSuppression: number;
    concreteSuppression: number;
    dirtSuppression: number;
    vegetationSuppression: number;
    buildingSuppression: number;
    shadowSuppression: number;
  };
}

interface VisualPreset {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'condition_assessment' | 'measurement' | 'presentation' | 'analysis';
  overlays: Partial<AsphaltOverlay>[];
  lighting: {
    ambient: number;
    directional: number;
    shadows: boolean;
    contrast: number;
  };
}

interface AsphaltAnalysisData {
  surfaceType: 'asphalt' | 'concrete' | 'mixed';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  age: number;
  thickness: number;
  defects: Array<{
    type: 'crack' | 'pothole' | 'fading' | 'edge_damage';
    severity: number;
    location: { x: number; y: number };
  }>;
  weatherExposure: {
    sunExposure: number;
    moistureLevel: number;
    temperatureCycles: number;
    saltExposure: number;
  };
}

const AsphaltEnhancedOverlaySystem: React.FC = () => {
  const [overlays, setOverlays] = useState<AsphaltOverlay[]>([]);
  const [activePreset, setActivePreset] = useState<string>('default');
  const [analysisData, setAnalysisData] = useState<AsphaltAnalysisData | null>(null);
  const [enhancementMode, setEnhancementMode] = useState<'automatic' | 'manual' | 'ai_optimized'>('automatic');
  const [environmentalConditions, setEnvironmentalConditions] = useState({
    lighting: 'natural',
    weather: 'clear',
    timeOfDay: 'midday',
    season: 'spring'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Visual presets for different use cases
  const visualPresets: VisualPreset[] = [
    {
      id: 'asphalt_highlight',
      name: 'Asphalt Surface Highlight',
      description: 'Maximum contrast to make asphalt surfaces stand out dramatically',
      category: 'general',
      overlays: [{
        type: 'highlight',
        intensity: 90,
        color: '#00ff41',
        asphaltEnhancement: {
          surfaceHighlight: 85,
          edgeDetection: 70,
          textureEnhancement: 60,
          contrastBoost: 80,
          colorIsolation: 95,
          depthPerception: 50
        },
        environmentalSupression: {
          grassSuppression: 80,
          concreteSuppression: 40,
          dirtSuppression: 70,
          vegetationSuppression: 90,
          buildingSuppression: 30,
          shadowSuppression: 60
        }
      }],
      lighting: { ambient: 0.3, directional: 0.8, shadows: true, contrast: 1.4 }
    },
    {
      id: 'condition_assessment',
      name: 'Condition Assessment',
      description: 'Optimized for identifying cracks, wear, and surface defects',
      category: 'condition_assessment',
      overlays: [{
        type: 'condition',
        intensity: 75,
        color: '#ff4444',
        asphaltEnhancement: {
          surfaceHighlight: 60,
          edgeDetection: 95,
          textureEnhancement: 85,
          contrastBoost: 70,
          colorIsolation: 80,
          depthPerception: 40
        },
        environmentalSupression: {
          grassSuppression: 60,
          concreteSuppression: 20,
          dirtSuppression: 50,
          vegetationSuppression: 70,
          buildingSuppression: 10,
          shadowSuppression: 80
        }
      }],
      lighting: { ambient: 0.4, directional: 0.9, shadows: false, contrast: 1.6 }
    },
    {
      id: 'thermal_analysis',
      name: 'Thermal Analysis',
      description: 'Heat signature visualization for asphalt temperature analysis',
      category: 'analysis',
      overlays: [{
        type: 'thermal',
        intensity: 80,
        color: '#ff6600',
        blendMode: 'overlay',
        asphaltEnhancement: {
          surfaceHighlight: 70,
          edgeDetection: 40,
          textureEnhancement: 30,
          contrastBoost: 60,
          colorIsolation: 90,
          depthPerception: 70
        }
      }],
      lighting: { ambient: 0.2, directional: 0.6, shadows: true, contrast: 1.2 }
    },
    {
      id: 'measurement_precision',
      name: 'Measurement Precision',
      description: 'High contrast edges for accurate measurement and calculation',
      category: 'measurement',
      overlays: [{
        type: 'edge_detection',
        intensity: 95,
        color: '#ffffff',
        asphaltEnhancement: {
          surfaceHighlight: 50,
          edgeDetection: 100,
          textureEnhancement: 20,
          contrastBoost: 90,
          colorIsolation: 70,
          depthPerception: 30
        }
      }],
      lighting: { ambient: 0.6, directional: 1.0, shadows: false, contrast: 2.0 }
    },
    {
      id: 'presentation_quality',
      name: 'Presentation Quality',
      description: 'Professional visualization for client presentations',
      category: 'presentation',
      overlays: [{
        type: 'highlight',
        intensity: 65,
        color: '#0066cc',
        blendMode: 'overlay',
        asphaltEnhancement: {
          surfaceHighlight: 75,
          edgeDetection: 50,
          textureEnhancement: 80,
          contrastBoost: 60,
          colorIsolation: 85,
          depthPerception: 90
        },
        environmentalSupression: {
          grassSuppression: 40,
          concreteSuppression: 20,
          dirtSuppression: 30,
          vegetationSuppression: 50,
          buildingSuppression: 10,
          shadowSuppression: 30
        }
      }],
      lighting: { ambient: 0.5, directional: 0.7, shadows: true, contrast: 1.1 }
    }
  ];

  // Initialize default overlays
  useEffect(() => {
    const defaultOverlays: AsphaltOverlay[] = [
      {
        id: 'asphalt_primary',
        name: 'Primary Asphalt Highlight',
        type: 'highlight',
        enabled: true,
        intensity: 75,
        color: '#00ff41',
        blendMode: 'overlay',
        filters: {
          brightness: 110,
          contrast: 140,
          saturation: 120,
          hue: 0,
          blur: 0,
          sharpness: 15
        },
        asphaltEnhancement: {
          surfaceHighlight: 80,
          edgeDetection: 60,
          textureEnhancement: 70,
          contrastBoost: 75,
          colorIsolation: 90,
          depthPerception: 50
        },
        environmentalSupression: {
          grassSuppression: 70,
          concreteSuppression: 30,
          dirtSuppression: 60,
          vegetationSuppression: 80,
          buildingSuppression: 20,
          shadowSuppression: 50
        }
      },
      {
        id: 'edge_enhancement',
        name: 'Edge Enhancement',
        type: 'edge_detection',
        enabled: false,
        intensity: 60,
        color: '#ffffff',
        blendMode: 'overlay',
        filters: {
          brightness: 100,
          contrast: 180,
          saturation: 80,
          hue: 0,
          blur: 0,
          sharpness: 25
        },
        asphaltEnhancement: {
          surfaceHighlight: 40,
          edgeDetection: 95,
          textureEnhancement: 30,
          contrastBoost: 80,
          colorIsolation: 60,
          depthPerception: 20
        },
        environmentalSupression: {
          grassSuppression: 50,
          concreteSuppression: 10,
          dirtSuppression: 40,
          vegetationSuppression: 60,
          buildingSuppression: 0,
          shadowSuppression: 70
        }
      },
      {
        id: 'texture_detail',
        name: 'Texture Detail Enhancement',
        type: 'texture',
        enabled: false,
        intensity: 45,
        color: '#ffaa00',
        blendMode: 'multiply',
        filters: {
          brightness: 95,
          contrast: 130,
          saturation: 110,
          hue: 0,
          blur: 0,
          sharpness: 20
        },
        asphaltEnhancement: {
          surfaceHighlight: 60,
          edgeDetection: 40,
          textureEnhancement: 90,
          contrastBoost: 50,
          colorIsolation: 70,
          depthPerception: 80
        },
        environmentalSupression: {
          grassSuppression: 30,
          concreteSuppression: 15,
          dirtSuppression: 25,
          vegetationSuppression: 40,
          buildingSuppression: 5,
          shadowSuppression: 20
        }
      }
    ];

    setOverlays(defaultOverlays);
  }, []);

  // Apply visual preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = visualPresets.find(p => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    
    // Update overlays based on preset
    setOverlays(prevOverlays => 
      prevOverlays.map(overlay => {
        const presetOverlay = preset.overlays.find(p => p.type === overlay.type);
        if (presetOverlay) {
          return { ...overlay, ...presetOverlay, enabled: true };
        }
        return { ...overlay, enabled: false };
      })
    );
  }, []);

  // AI-optimized enhancement based on analysis data
  const optimizeForConditions = useCallback(async () => {
    if (!analysisData) return;

    // Simulate AI optimization based on surface condition and environment
    const optimizationFactors = {
      conditionMultiplier: {
        excellent: 1.0,
        good: 1.1,
        fair: 1.3,
        poor: 1.6,
        critical: 2.0
      }[analysisData.condition],
      
      weatherMultiplier: {
        clear: 1.0,
        cloudy: 1.2,
        overcast: 1.4,
        rainy: 1.8
      }[environmentalConditions.weather as keyof typeof {clear: 1.0, cloudy: 1.2, overcast: 1.4, rainy: 1.8}] || 1.0,
      
      lightingMultiplier: {
        natural: 1.0,
        artificial: 1.3,
        mixed: 1.1
      }[environmentalConditions.lighting as keyof typeof {natural: 1.0, artificial: 1.3, mixed: 1.1}] || 1.0
    };

    const totalMultiplier = optimizationFactors.conditionMultiplier * 
                           optimizationFactors.weatherMultiplier * 
                           optimizationFactors.lightingMultiplier;

    setOverlays(prevOverlays => 
      prevOverlays.map(overlay => ({
        ...overlay,
        intensity: Math.min(100, overlay.intensity * totalMultiplier),
        asphaltEnhancement: {
          ...overlay.asphaltEnhancement,
          surfaceHighlight: Math.min(100, overlay.asphaltEnhancement.surfaceHighlight * totalMultiplier),
          contrastBoost: Math.min(100, overlay.asphaltEnhancement.contrastBoost * totalMultiplier)
        }
      }))
    );
  }, [analysisData, environmentalConditions]);

  // Update overlay property
  const updateOverlay = useCallback((id: string, updates: Partial<AsphaltOverlay>) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  }, []);

  // Toggle overlay
  const toggleOverlay = useCallback((id: string) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, enabled: !overlay.enabled } : overlay
    ));
  }, []);

  // Generate CSS filters for canvas enhancement
  const generateCSSFilter = useCallback((overlay: AsphaltOverlay): string => {
    if (!overlay.enabled) return 'none';

    const { filters } = overlay;
    return [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `hue-rotate(${filters.hue}deg)`,
      filters.blur > 0 ? `blur(${filters.blur}px)` : '',
      // Custom sharpness simulation through contrast and brightness
      filters.sharpness > 0 ? `contrast(${100 + filters.sharpness}%)` : ''
    ].filter(Boolean).join(' ');
  }, []);

  // Real-time enhancement processing
  const processImageEnhancement = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply base image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Apply each enabled overlay
    overlays.filter(overlay => overlay.enabled).forEach(overlay => {
      ctx.save();
      
      // Set blend mode
      ctx.globalCompositeOperation = overlay.blendMode as GlobalCompositeOperation;
      ctx.globalAlpha = overlay.intensity / 100;

      // Apply color overlay for asphalt highlighting
      ctx.fillStyle = overlay.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply additional processing based on enhancement settings
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect asphalt-like pixels (dark, low saturation)
        const brightness = (r + g + b) / 3;
        const saturation = Math.abs(Math.max(r, g, b) - Math.min(r, g, b));
        
        const isAsphaltLike = brightness < 100 && saturation < 50;

        if (isAsphaltLike) {
          // Enhance asphalt areas
          const enhancement = overlay.asphaltEnhancement;
          data[i] = Math.min(255, r * (1 + enhancement.surfaceHighlight / 100));
          data[i + 1] = Math.min(255, g * (1 + enhancement.surfaceHighlight / 100));
          data[i + 2] = Math.min(255, b * (1 + enhancement.surfaceHighlight / 100));
        } else {
          // Suppress non-asphalt areas
          const suppression = overlay.environmentalSupression;
          const suppressionFactor = brightness > 150 ? 
            (1 - suppression.concreteSuppression / 100) : 
            (1 - suppression.grassSuppression / 100);
          
          data[i] = r * suppressionFactor;
          data[i + 1] = g * suppressionFactor;
          data[i + 2] = b * suppressionFactor;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      ctx.restore();
    });
  }, [overlays]);

  // Export enhanced image
  const exportEnhancedImage = useCallback(() => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `asphalt-enhanced-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Sparkles className="mr-2 w-6 h-6" />
            Asphalt Enhancement Overlays
          </h2>
          <Badge variant="outline" className="flex items-center">
            <Filter className="mr-1 w-3 h-3" />
            {overlays.filter(o => o.enabled).length} Active
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={enhancementMode} onValueChange={(value: any) => setEnhancementMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Auto</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="ai_optimized">AI Optimized</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={optimizeForConditions}>
            <Zap className="w-4 h-4 mr-2" />
            Optimize
          </Button>

          <Button variant="outline" onClick={exportEnhancedImage}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Controls Sidebar */}
        <div className="w-80 border-r bg-background/50">
          <Tabs defaultValue="presets" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="overlays">Overlays</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            {/* Visual Presets */}
            <TabsContent value="presets" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Visual Enhancement Presets</h3>
                  {visualPresets.map(preset => (
                    <Card 
                      key={preset.id} 
                      className={`cursor-pointer transition-colors ${
                        activePreset === preset.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => applyPreset(preset.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {preset.description}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {preset.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          {activePreset === preset.id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Overlay Controls */}
            <TabsContent value="overlays" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Active Overlays</h3>
                  {overlays.map(overlay => (
                    <Card key={overlay.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: overlay.color }}
                            />
                            <span className="font-medium text-sm">{overlay.name}</span>
                          </div>
                          <Switch
                            checked={overlay.enabled}
                            onCheckedChange={() => toggleOverlay(overlay.id)}
                          />
                        </div>

                        {overlay.enabled && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs">Intensity</Label>
                              <Slider
                                value={[overlay.intensity]}
                                onValueChange={([value]) => 
                                  updateOverlay(overlay.id, { intensity: value })
                                }
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Asphalt Enhancement</Label>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <Label>Surface</Label>
                                  <Slider
                                    value={[overlay.asphaltEnhancement.surfaceHighlight]}
                                    onValueChange={([value]) => 
                                      updateOverlay(overlay.id, {
                                        asphaltEnhancement: {
                                          ...overlay.asphaltEnhancement,
                                          surfaceHighlight: value
                                        }
                                      })
                                    }
                                    max={100}
                                    step={1}
                                  />
                                </div>
                                <div>
                                  <Label>Contrast</Label>
                                  <Slider
                                    value={[overlay.asphaltEnhancement.contrastBoost]}
                                    onValueChange={([value]) => 
                                      updateOverlay(overlay.id, {
                                        asphaltEnhancement: {
                                          ...overlay.asphaltEnhancement,
                                          contrastBoost: value
                                        }
                                      })
                                    }
                                    max={100}
                                    step={1}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Environment Suppression</Label>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <Label>Vegetation</Label>
                                  <Slider
                                    value={[overlay.environmentalSupression.vegetationSuppression]}
                                    onValueChange={([value]) => 
                                      updateOverlay(overlay.id, {
                                        environmentalSupression: {
                                          ...overlay.environmentalSupression,
                                          vegetationSuppression: value
                                        }
                                      })
                                    }
                                    max={100}
                                    step={1}
                                  />
                                </div>
                                <div>
                                  <Label>Concrete</Label>
                                  <Slider
                                    value={[overlay.environmentalSupression.concreteSuppression]}
                                    onValueChange={([value]) => 
                                      updateOverlay(overlay.id, {
                                        environmentalSupression: {
                                          ...overlay.environmentalSupression,
                                          concreteSuppression: value
                                        }
                                      })
                                    }
                                    max={100}
                                    step={1}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Environmental Conditions */}
            <TabsContent value="environment" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Environmental Conditions</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Lighting Conditions</Label>
                      <Select 
                        value={environmentalConditions.lighting} 
                        onValueChange={(value) => 
                          setEnvironmentalConditions(prev => ({ ...prev, lighting: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">Natural Light</SelectItem>
                          <SelectItem value="artificial">Artificial Light</SelectItem>
                          <SelectItem value="mixed">Mixed Lighting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Weather</Label>
                      <Select 
                        value={environmentalConditions.weather} 
                        onValueChange={(value) => 
                          setEnvironmentalConditions(prev => ({ ...prev, weather: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">Clear</SelectItem>
                          <SelectItem value="cloudy">Cloudy</SelectItem>
                          <SelectItem value="overcast">Overcast</SelectItem>
                          <SelectItem value="rainy">Rainy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Time of Day</Label>
                      <Select 
                        value={environmentalConditions.timeOfDay} 
                        onValueChange={(value) => 
                          setEnvironmentalConditions(prev => ({ ...prev, timeOfDay: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="midday">Midday</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Season</Label>
                      <Select 
                        value={environmentalConditions.season} 
                        onValueChange={(value) => 
                          setEnvironmentalConditions(prev => ({ ...prev, season: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spring">Spring</SelectItem>
                          <SelectItem value="summer">Summer</SelectItem>
                          <SelectItem value="fall">Fall</SelectItem>
                          <SelectItem value="winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={optimizeForConditions}
                    disabled={!analysisData}
                  >
                    <Thermometer className="w-4 h-4 mr-2" />
                    Auto-Adjust for Conditions
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Analysis Data */}
            <TabsContent value="analysis" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Surface Analysis</h3>
                  
                  {analysisData ? (
                    <div className="space-y-3">
                      <Card className="p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Surface: {analysisData.surfaceType}</div>
                          <div>Condition: {analysisData.condition}</div>
                          <div>Age: {analysisData.age} years</div>
                          <div>Thickness: {analysisData.thickness}"</div>
                        </div>
                      </Card>

                      <Card className="p-3">
                        <h4 className="font-medium text-sm mb-2">Weather Exposure</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Sun: {analysisData.weatherExposure.sunExposure}%</div>
                          <div>Moisture: {analysisData.weatherExposure.moistureLevel}%</div>
                          <div>Temp Cycles: {analysisData.weatherExposure.temperatureCycles}</div>
                          <div>Salt: {analysisData.weatherExposure.saltExposure}%</div>
                        </div>
                      </Card>

                      {analysisData.defects.length > 0 && (
                        <Card className="p-3">
                          <h4 className="font-medium text-sm mb-2">Defects Found</h4>
                          {analysisData.defects.map((defect, index) => (
                            <div key={index} className="text-xs flex justify-between">
                              <span>{defect.type}</span>
                              <span>Severity: {defect.severity.toFixed(1)}</span>
                            </div>
                          ))}
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Scan className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Run surface analysis to see detailed data
                      </p>
                      <Button 
                        className="mt-3" 
                        onClick={() => {
                          // Simulate analysis data
                          setAnalysisData({
                            surfaceType: 'asphalt',
                            condition: 'fair',
                            age: 8,
                            thickness: 3,
                            defects: [
                              { type: 'crack', severity: 0.6, location: { x: 100, y: 200 } },
                              { type: 'fading', severity: 0.3, location: { x: 250, y: 180 } }
                            ],
                            weatherExposure: {
                              sunExposure: 75,
                              moistureLevel: 45,
                              temperatureCycles: 120,
                              saltExposure: 20
                            }
                          });
                        }}
                      >
                        Simulate Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <canvas 
              ref={canvasRef}
              width={800}
              height={600}
              className="border rounded-lg shadow-lg max-w-full max-h-full"
              style={{
                filter: overlays
                  .filter(o => o.enabled)
                  .map(generateCSSFilter)
                  .join(' ')
              }}
            />
            <img 
              ref={imageRef}
              src="/api/placeholder/800/600"
              alt="Sample asphalt surface"
              className="hidden"
              onLoad={processImageEnhancement}
            />
          </div>

          {/* Overlay Information */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
            <div className="text-sm space-y-1">
              <div className="font-medium">Enhancement Status</div>
              <div className="text-xs text-muted-foreground">
                Mode: {enhancementMode} | Active: {overlays.filter(o => o.enabled).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Conditions: {environmentalConditions.weather}, {environmentalConditions.lighting}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
            <div className="text-sm space-y-1">
              <div className="font-medium">Enhancement Metrics</div>
              <div className="text-xs space-y-1">
                <div>Asphalt Contrast: +{overlays.filter(o => o.enabled).reduce((acc, o) => acc + o.asphaltEnhancement.contrastBoost, 0)}%</div>
                <div>Edge Definition: +{overlays.filter(o => o.enabled).reduce((acc, o) => acc + o.asphaltEnhancement.edgeDetection, 0)}%</div>
                <div>Background Suppression: {overlays.filter(o => o.enabled).reduce((acc, o) => acc + o.environmentalSupression.vegetationSuppression, 0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsphaltEnhancedOverlaySystem;