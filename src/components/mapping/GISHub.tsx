import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { mappingService } from '../../services/mappingService';
import { MapProvider, MapConfiguration, MapLayer, LayerType } from '../../types/mapping';
import { 
  Map, 
  Globe, 
  Layers, 
  MapPin, 
  Ruler, 
  Download, 
  Upload, 
  Settings,
  Activity,
  Satellite,
  Navigation,
  Route,
  Compass
} from 'lucide-react';

interface GISHubProps {
  className?: string;
}

const GISHub: React.FC<GISHubProps> = ({ className }) => {
  const [currentProvider, setCurrentProvider] = useState<MapProvider>(MapProvider.LEAFLET);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map providers configuration
  const mapProviders = [
    { 
      value: MapProvider.LEAFLET, 
      label: 'Leaflet (OpenStreetMap)', 
      icon: Map,
      description: 'Lightweight, open-source mapping library',
      features: ['Vector tiles', 'Plugins ecosystem', 'Mobile-friendly'],
      status: 'active'
    },
    { 
      value: MapProvider.MAPBOX, 
      label: 'Mapbox GL JS', 
      icon: Globe,
      description: 'Modern vector maps with WebGL rendering',
      features: ['3D rendering', 'Custom styling', 'Real-time data'],
      status: 'active'
    },
    { 
      value: MapProvider.OPENLAYERS, 
      label: 'OpenLayers', 
      icon: Layers,
      description: 'Powerful, feature-rich mapping library',
      features: ['Multiple projections', 'WMS/WFS support', 'Advanced styling'],
      status: 'active'
    },
    { 
      value: MapProvider.ARCGIS, 
      label: 'ArcGIS Maps SDK', 
      icon: Satellite,
      description: 'Enterprise GIS mapping platform',
      features: ['Enterprise features', 'Spatial analysis', 'Data visualization'],
      status: 'active'
    },
    { 
      value: MapProvider.MAPLIBRE, 
      label: 'MapLibre GL JS', 
      icon: Navigation,
      description: 'Open-source fork of Mapbox GL JS',
      features: ['No API keys required', 'Vector tiles', 'Community driven'],
      status: 'active'
    },
    { 
      value: MapProvider.CESIUM, 
      label: 'Cesium', 
      icon: Globe,
      description: '3D geospatial platform',
      features: ['3D globes', 'Time-dynamic data', 'Terrain visualization'],
      status: 'beta'
    },
    { 
      value: MapProvider.DECKGL, 
      label: 'Deck.gl', 
      icon: Activity,
      description: 'WebGL-powered data visualization',
      features: ['Big data visualization', 'GPU acceleration', 'Layer-based'],
      status: 'active'
    },
    { 
      value: MapProvider.GOOGLE_EARTH_ENGINE, 
      label: 'Google Earth Engine', 
      icon: Satellite,
      description: 'Planetary-scale geospatial analysis',
      features: ['Satellite imagery', 'Cloud computing', 'Time series analysis'],
      status: 'enterprise'
    },
    { 
      value: MapProvider.QGIS_SERVER, 
      label: 'QGIS Server', 
      icon: Compass,
      description: 'Open-source GIS server',
      features: ['WMS/WFS services', 'Desktop integration', 'Plugin support'],
      status: 'active'
    },
    { 
      value: MapProvider.POSTGIS, 
      label: 'PostGIS', 
      icon: Route,
      description: 'Spatial database extension',
      features: ['Spatial queries', 'Vector/raster data', 'SQL integration'],
      status: 'active'
    }
  ];

  const defaultMapConfig: MapConfiguration = {
    center: [-98.5795, 39.8283], // Center of USA
    zoom: 4,
    minZoom: 1,
    maxZoom: 20
  };

  // Initialize map when provider changes
  useEffect(() => {
    if (mapContainerRef.current && !isLoading) {
      initializeMap();
    }
  }, [currentProvider]);

  const initializeMap = async () => {
    setIsLoading(true);
    try {
      if (mapInstance) {
        mappingService.destroy();
      }

      const map = await mappingService.createMap(
        'map-container',
        defaultMapConfig,
        currentProvider
      );
      
      setMapInstance(map);
      
      // Add some default layers based on provider
      await addDefaultLayers();
      
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addDefaultLayers = async () => {
    const defaultLayers: MapLayer[] = [
      {
        id: 'sample-geojson',
        name: 'Sample GeoJSON',
        type: LayerType.GEOJSON,
        visible: true,
        opacity: 0.7,
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [-98.5795, 39.8283]
                },
                properties: {
                  name: 'Center Point',
                  description: 'Geographic center of the USA'
                }
              }
            ]
          }
        }
      }
    ];

    for (const layer of defaultLayers) {
      try {
        await mappingService.addLayer(layer);
        setLayers(prev => [...prev, layer]);
      } catch (error) {
        console.error('Error adding layer:', error);
      }
    }
  };

  const handleProviderChange = (provider: string) => {
    setCurrentProvider(provider as MapProvider);
    setLayers([]); // Clear layers when switching providers
  };

  const getProviderInfo = (provider: MapProvider) => {
    return mapProviders.find(p => p.value === provider);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'beta': return 'bg-yellow-500';
      case 'enterprise': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSpatialAnalysis = async () => {
    try {
      const analysis = await mappingService.performSpatialAnalysis({
        id: 'buffer-analysis',
        name: 'Buffer Analysis',
        type: 'buffer',
        parameters: {
          feature: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-98.5795, 39.8283]
            },
            properties: {}
          },
          distance: 100,
          units: 'kilometers'
        },
        status: 'pending'
      });
      
      console.log('Analysis result:', analysis);
    } catch (error) {
      console.error('Spatial analysis error:', error);
    }
  };

  const handleDataExport = async () => {
    try {
      const blob = await mappingService.exportData({
        format: 'geojson',
        layers: layers.map(l => l.id)
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'map-data.geojson';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            GIS & Mapping Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comprehensive geospatial analysis with 10+ mapping services
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {mapProviders.length} Providers Available
        </Badge>
      </div>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Map Provider Selection
          </CardTitle>
          <CardDescription>
            Choose from {mapProviders.length} different mapping services and GIS platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapProviders.map((provider) => {
              const Icon = provider.icon;
              const isSelected = currentProvider === provider.value;
              
              return (
                <Card 
                  key={provider.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleProviderChange(provider.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(provider.status)}`} />
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1">{provider.label}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {provider.description}
                    </p>
                    
                    <div className="space-y-1">
                      {provider.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs mr-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {getProviderInfo(currentProvider)?.label || 'Map View'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSpatialAnalysis}>
                    <Ruler className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDataExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                id="map-container"
                ref={mapContainerRef}
                className="w-full h-96 border rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading {getProviderInfo(currentProvider)?.label}...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Panel */}
        <div className="space-y-4">
          {/* Layer Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4" />
                Layers ({layers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{layer.name}</p>
                    <p className="text-xs text-gray-500">{layer.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full">
                    Add Layer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Layer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select layer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geojson">GeoJSON</SelectItem>
                        <SelectItem value="wms">WMS</SelectItem>
                        <SelectItem value="xyz">XYZ Tiles</SelectItem>
                        <SelectItem value="vector">Vector Layer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full">Add Layer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Tile Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                Tile Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mappingService.getAvailableTileServices().slice(0, 3).map((service, idx) => (
                  <div key={idx} className="p-2 border rounded text-xs">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-gray-500 truncate">{service.attribution}</p>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full">
                  View All Services
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Ruler className="h-4 w-4 mr-2" />
                Measure Tool
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Route className="h-4 w-4 mr-2" />
                Routing
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Compass className="h-4 w-4 mr-2" />
                Coordinates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Features Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced GIS Features</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Spatial Analysis</TabsTrigger>
              <TabsTrigger value="styling">Styling</TabsTrigger>
              <TabsTrigger value="data">Data Management</TabsTrigger>
              <TabsTrigger value="export">Export/Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Buffer', 'Intersection', 'Union', 'Voronoi', 'Interpolation', 'Clustering', 'Routing', 'Isochrone'].map((tool) => (
                  <Button key={tool} variant="outline" className="h-20 flex flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    <span className="text-xs">{tool}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="styling">
              <p className="text-sm text-gray-600 mb-4">Style your layers with advanced symbology options</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Simple Renderer</h4>
                  <p className="text-xs text-gray-600">Single symbol for all features</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Categorized</h4>
                  <p className="text-xs text-gray-600">Different symbols by category</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Graduated</h4>
                  <p className="text-xs text-gray-600">Symbols by numeric values</p>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="data">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Manage your geospatial data sources and connections</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Database Connections</h4>
                    <p className="text-xs text-gray-600 mb-3">Connect to PostGIS, SpatiaLite, and other spatial databases</p>
                    <Button size="sm" variant="outline">Manage Connections</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Web Services</h4>
                    <p className="text-xs text-gray-600 mb-3">Add WMS, WFS, and OGC services</p>
                    <Button size="sm" variant="outline">Add Service</Button>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Export your maps and data in various formats</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['GeoJSON', 'Shapefile', 'KML', 'CSV', 'PDF', 'PNG', 'SVG', 'GeoTIFF'].map((format) => (
                    <Button key={format} variant="outline" className="h-16 flex flex-col">
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-xs">{format}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GISHub;