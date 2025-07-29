// Mapping Services Types
export interface MapConfiguration {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  bearing?: number;
  pitch?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  source: LayerSource;
  style?: any;
  minZoom?: number;
  maxZoom?: number;
}

export enum LayerType {
  RASTER = 'raster',
  VECTOR = 'vector',
  GEOJSON = 'geojson',
  WMS = 'wms',
  WMTS = 'wmts',
  XYZ = 'xyz',
  HEATMAP = 'heatmap',
  CLUSTER = 'cluster',
  THREEJS = '3d'
}

export interface LayerSource {
  type: string;
  url?: string;
  data?: any;
  tiles?: string[];
  attribution?: string;
  tileSize?: number;
  maxzoom?: number;
  minzoom?: number;
}

// GIS Feature Types
export interface GISFeature {
  id: string;
  type: 'Feature';
  geometry: GISGeometry;
  properties: Record<string, any>;
}

export interface GISGeometry {
  type: GeometryType;
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export enum GeometryType {
  POINT = 'Point',
  LINESTRING = 'LineString',
  POLYGON = 'Polygon',
  MULTIPOINT = 'MultiPoint',
  MULTILINESTRING = 'MultiLineString',
  MULTIPOLYGON = 'MultiPolygon',
  GEOMETRYCOLLECTION = 'GeometryCollection'
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: GISFeature[];
}

// Mapping Service Providers
export enum MapProvider {
  LEAFLET = 'leaflet',
  MAPBOX = 'mapbox',
  OPENLAYERS = 'openlayers',
  ARCGIS = 'arcgis',
  CESIUM = 'cesium',
  DECKGL = 'deckgl',
  MAPLIBRE = 'maplibre',
  GOOGLE_EARTH_ENGINE = 'gee',
  QGIS_SERVER = 'qgis',
  POSTGIS = 'postgis'
}

// Analysis Tools
export interface SpatialAnalysis {
  id: string;
  name: string;
  type: AnalysisType;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export enum AnalysisType {
  BUFFER = 'buffer',
  INTERSECTION = 'intersection',
  UNION = 'union',
  DIFFERENCE = 'difference',
  VORONOI = 'voronoi',
  INTERPOLATION = 'interpolation',
  HEATMAP = 'heatmap',
  CLUSTERING = 'clustering',
  ROUTING = 'routing',
  ISOCHRONE = 'isochrone'
}

// Coordinate Systems
export interface CoordinateSystem {
  epsg: string;
  name: string;
  proj4: string;
  wkt?: string;
  units: 'degrees' | 'meters' | 'feet';
}

// Data Sources
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  url?: string;
  format: DataFormat;
  metadata?: Record<string, any>;
  authentication?: AuthConfig;
}

export enum DataSourceType {
  WFS = 'wfs',
  WMS = 'wms',
  WMTS = 'wmts',
  REST = 'rest',
  FILE = 'file',
  DATABASE = 'database',
  STREAM = 'stream'
}

export enum DataFormat {
  GEOJSON = 'geojson',
  SHAPEFILE = 'shapefile',
  KML = 'kml',
  GPX = 'gpx',
  CSV = 'csv',
  GEOTIFF = 'geotiff',
  NETCDF = 'netcdf',
  WKT = 'wkt',
  WKB = 'wkb'
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth' | 'apikey';
  credentials?: Record<string, string>;
}

// Symbology and Styling
export interface SymbologyStyle {
  id: string;
  name: string;
  type: 'simple' | 'categorized' | 'graduated' | 'rule-based';
  renderer: StyleRenderer;
}

export interface StyleRenderer {
  type: string;
  symbol?: Symbol;
  field?: string;
  classes?: StyleClass[];
  rules?: StyleRule[];
}

export interface Symbol {
  type: 'marker' | 'line' | 'fill';
  color?: string;
  size?: number;
  width?: number;
  opacity?: number;
  pattern?: string;
}

export interface StyleClass {
  value: any;
  label: string;
  symbol: Symbol;
}

export interface StyleRule {
  filter: string;
  symbol: Symbol;
  label?: string;
}

// Project Management
export interface GISProject {
  id: string;
  name: string;
  description?: string;
  crs: CoordinateSystem;
  extent: MapBounds;
  layers: MapLayer[];
  version: string;
  created: Date;
  modified: Date;
  metadata?: Record<string, any>;
}

// Service Configurations
export interface ServiceConfig {
  provider: MapProvider;
  apiKey?: string;
  baseUrl?: string;
  version?: string;
  parameters?: Record<string, any>;
  limits?: ServiceLimits;
}

export interface ServiceLimits {
  maxRequests?: number;
  maxFeatures?: number;
  timeout?: number;
  rateLimitPerSecond?: number;
}

// Error Handling
export interface MapError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Event Types
export interface MapEvent {
  type: string;
  coordinate?: [number, number];
  feature?: GISFeature;
  layer?: MapLayer;
  originalEvent?: Event;
}

// Measurement Tools
export interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'bearing' | 'coordinates';
  value: number;
  unit: string;
  geometry: GISGeometry;
  label?: string;
}

// Export/Import
export interface ExportOptions {
  format: DataFormat;
  crs?: string;
  extent?: MapBounds;
  layers?: string[];
  quality?: 'low' | 'medium' | 'high';
  dpi?: number;
}

export interface ImportResult {
  success: boolean;
  features?: GISFeature[];
  layers?: MapLayer[];
  errors?: MapError[];
  metadata?: Record<string, any>;
}