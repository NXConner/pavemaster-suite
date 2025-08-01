import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { AppSidebar } from '../components/layout/app-sidebar';
import { 
  Map, 
  Ruler, 
  Square, 
  Circle, 
  Layers, 
  Download,
  Upload,
  Maximize,
  Car,
  Target,
  Zap,
  Eye,
  Settings,
  Calculator
} from 'lucide-react';

export default function Mapping() {
  const [activeMap, setActiveMap] = useState('satellite');
  const [measurementMode, setMeasurementMode] = useState('area');
  const [parkingSpaces, setParkingSpaces] = useState(45);
  const [optimization] = useState(78);

  const mapServices = [
    { name: 'Google Satellite', type: 'satellite', status: 'active' },
    { name: 'OpenStreetMap', type: 'street', status: 'active' },
    { name: 'Mapbox Streets', type: 'street', status: 'active' },
    { name: 'ESRI World Imagery', type: 'satellite', status: 'active' },
    { name: 'Bing Aerial', type: 'aerial', status: 'active' },
    { name: 'CartoDB Positron', type: 'minimal', status: 'active' },
    { name: 'Stamen Terrain', type: 'terrain', status: 'active' },
    { name: 'HERE Maps', type: 'hybrid', status: 'premium' },
    { name: 'TomTom Maps', type: 'navigation', status: 'premium' },
    { name: 'MapTiler', type: 'custom', status: 'premium' }
  ];

  const measurementTools = [
    { name: 'Distance', icon: Ruler, mode: 'distance' },
    { name: 'Area', icon: Square, mode: 'area' },
    { name: 'Perimeter', icon: Circle, mode: 'perimeter' },
    { name: 'Volume', icon: Calculator, mode: 'volume' }
  ];

  const drawingTools = [
    { name: 'Rectangle', icon: Square, tool: 'rectangle' },
    { name: 'Circle', icon: Circle, tool: 'circle' },
    { name: 'Polygon', icon: Target, tool: 'polygon' },
    { name: 'Line', icon: Ruler, tool: 'line' }
  ];

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mapping & Design Suite</h1>
          <p className="text-muted-foreground">
            Professional mapping tools with parking lot optimization and measurement capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Canvas */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Interactive Map Canvas
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[500px] bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
                  {/* Map placeholder with grid overlay */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  
                  {/* Sample parking lot layout */}
                  <div className="absolute top-20 left-20 w-80 h-60 bg-gray-200 rounded border-2 border-gray-400">
                    <div className="p-4">
                      <div className="text-xs font-semibold mb-2">Sample Parking Lot</div>
                      <div className="grid grid-cols-8 gap-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-6 w-8 border border-gray-400 ${
                              i % 3 === 0 ? 'bg-red-200' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Measurement overlay */}
                  <div className="absolute top-10 right-10 bg-white/90 p-3 rounded-lg shadow-lg">
                    <div className="text-sm font-semibold mb-1">Current Measurement</div>
                    <div className="text-xs space-y-1">
                      <div>Area: 2,450 sq ft</div>
                      <div>Perimeter: 220 ft</div>
                      <div>Parking Spaces: {parkingSpaces}</div>
                    </div>
                  </div>

                  {/* Drawing tools overlay */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {drawingTools.map((tool) => (
                      <Button
                        key={tool.name}
                        variant="outline"
                        size="sm"
                        className="bg-white/90"
                      >
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Map Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Map Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mapServices.slice(0, 6).map((service) => (
                  <div
                    key={service.name}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      activeMap === service.type ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveMap(service.type)}
                  >
                    <div>
                      <div className="text-sm font-medium">{service.name}</div>
                      <div className="text-xs text-muted-foreground">{service.type}</div>
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View All (10)
                </Button>
              </CardContent>
            </Card>

            {/* Measurement Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Measurement Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {measurementTools.map((tool) => (
                  <Button
                    key={tool.name}
                    variant={measurementMode === tool.mode ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setMeasurementMode(tool.mode)}
                  >
                    <tool.icon className="h-4 w-4 mr-2" />
                    {tool.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Parking Optimization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Parking Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="spaces" className="text-xs">Current Spaces</Label>
                  <Input
                    id="spaces"
                    type="number"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(parseInt(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Optimization Score</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${optimization}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{optimization}%</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Optimize
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="mt-6">
          <Tabs defaultValue="measurements" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="overlays">Overlays</TabsTrigger>
              <TabsTrigger value="3d-tools">3D Tools</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="measurements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Distance Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Length:</span>
                        <span className="font-medium">342.5 ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Segment Count:</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Segment:</span>
                        <span className="font-medium">42.8 ft</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Area Calculations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Area:</span>
                        <span className="font-medium">2,450 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usable Area:</span>
                        <span className="font-medium">2,205 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-medium">90%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Volume Estimates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Asphalt Volume:</span>
                        <span className="font-medium">98.4 tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Material:</span>
                        <span className="font-medium">147.6 tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Cost:</span>
                        <span className="font-medium">$12,450</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="overlays" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Property Lines',
                  'Utilities',
                  'Drainage',
                  'Traffic Flow',
                  'ADA Compliance',
                  'Snow Routes',
                  'Emergency Access',
                  'Lighting Zones'
                ].map((overlay) => (
                  <Card key={overlay} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm font-medium">{overlay}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Toggle overlay
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="3d-tools" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-lg font-semibold mb-2">3D Scanning & Visualization</div>
                  <div className="text-muted-foreground mb-4">
                    Advanced 3D tools for detailed site analysis and modeling
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure 3D View
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import 3D Model
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">AI Surface Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Asphalt Quality</span>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Crack Detection</span>
                        <Badge variant="destructive">3 Issues</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Drainage Assessment</span>
                        <Badge variant="default">Excellent</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Optimization Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Add 8 more parking spaces (+18%)</div>
                      <div>• Improve traffic flow pattern</div>
                      <div>• Enhance ADA accessibility</div>
                      <div>• Optimize entry/exit locations</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  <span>Measurement Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  <span>Optimization Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  <span>Project Proposal</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}