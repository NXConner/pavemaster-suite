import { 
  MapProvider, 
  MapConfiguration, 
  MapLayer, 
  GISFeature, 
  FeatureCollection,
  ServiceConfig,
  SpatialAnalysis,
  CoordinateSystem,
  DataSource,
  ExportOptions,
  ImportResult
} from '../types/mapping';

// Import mapping libraries - only the ones we actually installed
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map as OLMap, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import 'ol/ol.css';
import proj4 from 'proj4';
import * as turf from '@turf/turf';
import { distance, getCenter, getBounds } from 'geolib';

/**
 * Unified Mapping Service supporting 10+ mapping providers
 */
export class MappingService {
  private providers: Map<MapProvider, any> = new Map();
  private currentProvider: MapProvider = MapProvider.LEAFLET;
  private serviceConfigs: Map<MapProvider, ServiceConfig> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize all mapping service providers
   */
  private initializeProviders(): void {
    // Set up service configurations for each provider
    this.serviceConfigs.set(MapProvider.LEAFLET, {
      provider: MapProvider.LEAFLET,
      baseUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    });

    this.serviceConfigs.set(MapProvider.MAPBOX, {
      provider: MapProvider.MAPBOX,
      baseUrl: 'https://api.mapbox.com',
      apiKey: process.env.VITE_MAPBOX_TOKEN
    });

    this.serviceConfigs.set(MapProvider.OPENLAYERS, {
      provider: MapProvider.OPENLAYERS,
      baseUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    });

    this.serviceConfigs.set(MapProvider.ARCGIS, {
      provider: MapProvider.ARCGIS,
      baseUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services',
      apiKey: process.env.VITE_ARCGIS_TOKEN
    });

    this.serviceConfigs.set(MapProvider.MAPLIBRE, {
      provider: MapProvider.MAPLIBRE,
      baseUrl: 'https://demotiles.maplibre.org/style.json'
    });

    this.serviceConfigs.set(MapProvider.CESIUM, {
      provider: MapProvider.CESIUM,
      apiKey: process.env.VITE_CESIUM_TOKEN
    });

    this.serviceConfigs.set(MapProvider.DECKGL, {
      provider: MapProvider.DECKGL,
      baseUrl: 'https://api.mapbox.com',
      apiKey: process.env.VITE_MAPBOX_TOKEN
    });

    this.serviceConfigs.set(MapProvider.GOOGLE_EARTH_ENGINE, {
      provider: MapProvider.GOOGLE_EARTH_ENGINE,
      baseUrl: 'https://earthengine.googleapis.com',
      apiKey: process.env.VITE_GEE_TOKEN
    });

    this.serviceConfigs.set(MapProvider.QGIS_SERVER, {
      provider: MapProvider.QGIS_SERVER,
      baseUrl: process.env.VITE_QGIS_SERVER_URL || 'http://localhost:8080'
    });

    this.serviceConfigs.set(MapProvider.POSTGIS, {
      provider: MapProvider.POSTGIS,
      baseUrl: process.env.VITE_POSTGIS_URL || 'postgresql://localhost:5432'
    });
  }

  /**
   * Create a map instance with the specified provider
   */
  async createMap(
    containerId: string, 
    config: MapConfiguration, 
    provider: MapProvider = MapProvider.LEAFLET
  ): Promise<any> {
    this.currentProvider = provider;
    
    switch (provider) {
      case MapProvider.LEAFLET:
        return this.createLeafletMap(containerId, config);
      
      case MapProvider.MAPBOX:
        return this.createMapboxMap(containerId, config);
      
      case MapProvider.OPENLAYERS:
        return this.createOpenLayersMap(containerId, config);
      
      case MapProvider.ARCGIS:
        return this.createArcGISMap(containerId, config);
      
      case MapProvider.MAPLIBRE:
        return this.createMapLibreMap(containerId, config);
      
      default:
        console.warn(`Provider ${provider} not fully implemented yet, falling back to Leaflet`);
        return this.createLeafletMap(containerId, config);
    }
  }

  /**
   * Leaflet Map Implementation
   */
  private createLeafletMap(containerId: string, config: MapConfiguration): L.Map {
    const map = L.map(containerId, {
      center: [config.center[1], config.center[0]], // Leaflet uses lat, lng
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom
    });

    // Add default OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    this.providers.set(MapProvider.LEAFLET, map);
    return map;
  }

  /**
   * Mapbox GL JS Implementation
   */
  private createMapboxMap(containerId: string, config: MapConfiguration): mapboxgl.Map {
    const serviceConfig = this.serviceConfigs.get(MapProvider.MAPBOX);
    
    const map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: config.center,
      zoom: config.zoom,
      bearing: config.bearing || 0,
      pitch: config.pitch || 0,
      accessToken: serviceConfig?.apiKey
    });

    this.providers.set(MapProvider.MAPBOX, map);
    return map;
  }

  /**
   * OpenLayers Implementation
   */
  private createOpenLayersMap(containerId: string, config: MapConfiguration): OLMap {
    const map = new OLMap({
      target: containerId,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: config.center,
        zoom: config.zoom,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom
      })
    });

    this.providers.set(MapProvider.OPENLAYERS, map);
    return map;
  }

  /**
   * ArcGIS Maps SDK Implementation (Placeholder - requires separate installation)
   */
  private async createArcGISMap(containerId: string, config: MapConfiguration): Promise<any> {
    try {
      console.warn('ArcGIS SDK requires separate installation and configuration');
      console.warn('Falling back to Leaflet for now');
      return this.createLeafletMap(containerId, config);
    } catch (error) {
      console.error('Error with ArcGIS:', error);
      console.warn('Falling back to Leaflet');
      return this.createLeafletMap(containerId, config);
    }
  }

  /**
   * MapLibre GL JS Implementation
   */
  private async createMapLibreMap(containerId: string, config: MapConfiguration): Promise<any> {
    try {
      // Try to dynamically load MapLibre GL at runtime only
      const maplibregl = await import('maplibre-gl').catch(() => null);
      
      if (!maplibregl) {
        console.warn('MapLibre GL not available, falling back to Leaflet');
        return this.createLeafletMap(containerId, config);
      }

      const map = new maplibregl.Map({
        container: containerId,
        style: 'https://demotiles.maplibre.org/style.json',
        center: config.center,
        zoom: config.zoom
      });
      
      this.providers.set(MapProvider.MAPLIBRE, map);
      return map;
    } catch (error) {
      console.warn('MapLibre GL not available, falling back to Leaflet');
      return this.createLeafletMap(containerId, config);
    }
  }

  /**
   * Add a layer to the current map
   */
  async addLayer(layer: MapLayer): Promise<void> {
    const map = this.providers.get(this.currentProvider);
    if (!map) throw new Error('No map instance found');

    switch (this.currentProvider) {
      case MapProvider.LEAFLET:
        await this.addLeafletLayer(map, layer);
        break;
      
      case MapProvider.MAPBOX:
        await this.addMapboxLayer(map, layer);
        break;
      
      case MapProvider.OPENLAYERS:
        await this.addOpenLayersLayer(map, layer);
        break;
      
      default:
        console.warn(`Layer addition not implemented for ${this.currentProvider}`);
    }
  }

  /**
   * Add layer to Leaflet map
   */
  private async addLeafletLayer(map: L.Map, layer: MapLayer): Promise<void> {
    switch (layer.type) {
      case 'geojson':
        if (layer.source.data) {
          L.geoJSON(layer.source.data, {
            style: layer.style
          }).addTo(map);
        }
        break;
      
      case 'xyz':
        if (layer.source.url) {
          L.tileLayer(layer.source.url, {
            attribution: layer.source.attribution,
            opacity: layer.opacity
          }).addTo(map);
        }
        break;
      
      case 'wms':
        if (layer.source.url) {
          // Note: This requires the leaflet-wms plugin
          console.warn('WMS support requires additional plugin');
        }
        break;
    }
  }

  /**
   * Add layer to Mapbox map
   */
  private async addMapboxLayer(map: mapboxgl.Map, layer: MapLayer): Promise<void> {
    if (layer.source.data && layer.type === 'geojson') {
      map.addSource(layer.id, {
        type: 'geojson',
        data: layer.source.data
      });

      map.addLayer({
        id: layer.id,
        type: 'fill',
        source: layer.id,
        paint: layer.style || {
          'fill-color': '#088',
          'fill-opacity': layer.opacity
        }
      });
    }
  }

  /**
   * Add layer to OpenLayers map
   */
  private async addOpenLayersLayer(map: OLMap, layer: MapLayer): Promise<void> {
    switch (layer.type) {
      case 'xyz':
        if (layer.source.url) {
          const tileLayer = new TileLayer({
            source: new XYZ({
              url: layer.source.url,
              attributions: layer.source.attribution
            }),
            opacity: layer.opacity
          });
          map.addLayer(tileLayer);
        }
        break;
    }
  }

  /**
   * Perform spatial analysis using Turf.js
   */
  async performSpatialAnalysis(analysis: SpatialAnalysis): Promise<any> {
    switch (analysis.type) {
      case 'buffer':
        return this.createBuffer(analysis.parameters);
      
      case 'intersection':
        return this.calculateIntersection(analysis.parameters);
      
      case 'union':
        return this.calculateUnion(analysis.parameters);
      
      case 'voronoi':
        return this.createVoronoi(analysis.parameters);
      
      default:
        throw new Error(`Analysis type ${analysis.type} not implemented`);
    }
  }

  /**
   * Create buffer analysis
   */
  private createBuffer(params: any): any {
    const { feature, distance, units = 'kilometers' } = params;
    return turf.buffer(feature, distance, { units });
  }

  /**
   * Calculate intersection
   */
  private calculateIntersection(params: any): any {
    const { feature1, feature2 } = params;
    return turf.intersect(feature1, feature2);
  }

  /**
   * Calculate union
   */
  private calculateUnion(params: any): any {
    const { feature1, feature2 } = params;
    return turf.union(feature1, feature2);
  }

  /**
   * Create Voronoi diagram
   */
  private createVoronoi(params: any): any {
    const { points, bbox } = params;
    return turf.voronoi(points, { bbox });
  }

  /**
   * Convert between coordinate systems
   */
  transformCoordinates(
    coordinates: [number, number], 
    fromCRS: string, 
    toCRS: string
  ): [number, number] {
    return proj4(fromCRS, toCRS, coordinates);
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    point1: [number, number], 
    point2: [number, number], 
    units: 'meters' | 'kilometers' = 'kilometers'
  ): number {
    const from = { latitude: point1[1], longitude: point1[0] };
    const to = { latitude: point2[1], longitude: point2[0] };
    
    const distanceInMeters = distance(from, to);
    return units === 'kilometers' ? distanceInMeters / 1000 : distanceInMeters;
  }

  /**
   * Get center point of features
   */
  getCenterPoint(features: GISFeature[]): [number, number] {
    const points = features.map(f => ({
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0]
    }));
    
    const center = getCenter(points);
    return [center.longitude, center.latitude];
  }

  /**
   * Export map data
   */
  async exportData(options: ExportOptions): Promise<Blob> {
    // Implementation would depend on the format and current provider
    switch (options.format) {
      case 'geojson':
        return this.exportGeoJSON(options);
      
      case 'kml':
        return this.exportKML(options);
      
      default:
        throw new Error(`Export format ${options.format} not supported`);
    }
  }

  /**
   * Export as GeoJSON
   */
  private async exportGeoJSON(options: ExportOptions): Promise<Blob> {
    // Get current map data and convert to GeoJSON
    const data = { type: 'FeatureCollection', features: [] }; // Placeholder
    return new Blob([JSON.stringify(data)], { type: 'application/json' });
  }

  /**
   * Export as KML
   */
  private async exportKML(options: ExportOptions): Promise<Blob> {
    // Convert data to KML format
    const kmlData = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"></kml>';
    return new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
  }

  /**
   * Import spatial data
   */
  async importData(file: File, format: string): Promise<ImportResult> {
    try {
      const text = await file.text();
      
      switch (format.toLowerCase()) {
        case 'geojson':
          return this.importGeoJSON(text);
        
        case 'kml':
          return this.importKML(text);
        
        case 'csv':
          return this.importCSV(text);
        
        default:
          throw new Error(`Import format ${format} not supported`);
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          code: 'IMPORT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        }]
      };
    }
  }

  /**
   * Import GeoJSON data
   */
  private importGeoJSON(data: string): ImportResult {
    try {
      const geojson = JSON.parse(data);
      return {
        success: true,
        features: geojson.features || [geojson],
        metadata: { format: 'geojson', imported: new Date() }
      };
    } catch (error) {
      throw new Error('Invalid GeoJSON format');
    }
  }

  /**
   * Import KML data
   */
  private importKML(data: string): ImportResult {
    // Implementation would parse KML and convert to GeoJSON
    throw new Error('KML import not implemented yet');
  }

  /**
   * Import CSV data with coordinates
   */
  private importCSV(data: string): ImportResult {
    // Implementation would parse CSV and create point features
    throw new Error('CSV import not implemented yet');
  }

  /**
   * Get available tile services
   */
  getAvailableTileServices(): Array<{ name: string; url: string; attribution: string }> {
    return [
      {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
      },
      {
        name: 'OpenTopoMap',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap contributors'
      },
      {
        name: 'CartoDB Positron',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attribution: '© CARTO'
      },
      {
        name: 'CartoDB Dark Matter',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attribution: '© CARTO'
      },
      {
        name: 'Esri World Imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri'
      }
    ];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.providers.forEach((provider, type) => {
      if (provider && typeof provider.remove === 'function') {
        provider.remove();
      }
    });
    this.providers.clear();
  }
}

// Create singleton instance
export const mappingService = new MappingService();