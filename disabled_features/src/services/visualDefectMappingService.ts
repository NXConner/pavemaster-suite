import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { DefectDetection, ScanSession } from './ar3dScanningService';
import type { DetectionResult } from './aiDefectDetectionService';

// Enhanced types for visual mapping
export interface DefectPin {
  id: string;
  defectId: string;
  position: {
    latitude: number;
    longitude: number;
    mapX?: number; // Local map coordinates
    mapY?: number;
  };
  type: DefectDetection['type'];
  severity: DefectDetection['severity'];
  confidence: number;
  timestamp: number;
  photos: string[]; // Photo paths/IDs
  notes: string;
  status: 'new' | 'inspected' | 'scheduled' | 'in_progress' | 'completed' | 'verified';
  assignedTo?: string;
  estimatedRepairCost?: number;
  urgencyScore: number; // 0-100
  lastUpdated: number;
}

export interface DefectTimeline {
  defectId: string;
  events: TimelineEvent[];
  duration: number; // Days since first detection
  degradationRate: number; // Change in severity over time
  isProgressing: boolean;
}

export interface TimelineEvent {
  id: string;
  type: 'detection' | 'inspection' | 'repair_scheduled' | 'repair_started' | 'repair_completed' | 'verification';
  timestamp: number;
  description: string;
  photoPath?: string;
  severity?: DefectDetection['severity'];
  confidence?: number;
  performedBy?: string;
  notes?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface MapOverlay {
  id: string;
  name: string;
  type: 'satellite' | 'street' | 'hybrid' | 'terrain' | 'blueprint';
  imagePath?: string; // For custom overlays like blueprints
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  opacity: number;
  visible: boolean;
  lastUpdated: number;
}

export interface DefectCluster {
  id: string;
  centerPoint: {
    latitude: number;
    longitude: number;
  };
  radius: number; // meters
  defectCount: number;
  defectIds: string[];
  dominantType: DefectDetection['type'];
  averageSeverity: number;
  totalArea: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  recommendedAction: string;
}

export interface HeatmapData {
  points: Array<{
    latitude: number;
    longitude: number;
    intensity: number; // 0-1 based on severity and frequency
  }>;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  generated: number;
}

export interface SearchFilter {
  defectTypes?: DefectDetection['type'][];
  severities?: DefectDetection['severity'][];
  dateRange?: {
    start: number;
    end: number;
  };
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  minConfidence?: number;
  status?: DefectPin['status'][];
  assignedTo?: string;
  searchText?: string;
}

export interface AnalyticsData {
  totalDefects: number;
  defectsByType: Record<DefectDetection['type'], number>;
  defectsBySeverity: Record<DefectDetection['severity'], number>;
  averageConfidence: number;
  detectionTrends: Array<{
    date: string;
    count: number;
    types: Record<DefectDetection['type'], number>;
  }>;
  hotspots: DefectCluster[];
  repairProgress: {
    completed: number;
    inProgress: number;
    scheduled: number;
    pending: number;
  };
  costAnalysis: {
    totalEstimatedCost: number;
    completedRepairCost: number;
    averageCostPerDefect: number;
    costByType: Record<DefectDetection['type'], number>;
  };
}

class VisualDefectMappingService {
  private defectPins: Map<string, DefectPin> = new Map();
  private defectTimelines: Map<string, DefectTimeline> = new Map();
  private mapOverlays: Map<string, MapOverlay> = new Map();
  private defectClusters: DefectCluster[] = [];
  private heatmapData: HeatmapData | null = null;
  private searchResults: DefectPin[] = [];
  private activeFilters: SearchFilter = {};

  // Map state
  private currentBounds = {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  };
  private currentZoom = 15;
  private currentCenter = {
    latitude: 0,
    longitude: 0,
  };

  constructor() {
    this.initializeDefaultOverlays();
  }

  private initializeDefaultOverlays(): void {
    // Add default map overlay
    this.mapOverlays.set('default', {
      id: 'default',
      name: 'Street Map',
      type: 'street',
      bounds: {
        north: 90,
        south: -90,
        east: 180,
        west: -180,
      },
      opacity: 1.0,
      visible: true,
      lastUpdated: Date.now(),
    });
  }

  // Public API Methods

  public async addDefectPin(defect: DefectDetection, photos: string[] = []): Promise<string> {
    try {
      const pin: DefectPin = {
        id: this.generateId(),
        defectId: defect.id,
        position: {
          latitude: defect.location.latitude,
          longitude: defect.location.longitude,
        },
        type: defect.type,
        severity: defect.severity,
        confidence: defect.confidence,
        timestamp: defect.timestamp,
        photos,
        notes: '',
        status: 'new',
        urgencyScore: this.calculateUrgencyScore(defect),
        lastUpdated: Date.now(),
      };

      this.defectPins.set(pin.id, pin);

      // Initialize timeline
      this.initializeDefectTimeline(defect, pin);

      // Update clusters
      await this.updateDefectClusters();

      // Update heatmap
      await this.updateHeatmapData();

      await Toast.show({
        text: `Added ${defect.type} pin to map`,
        duration: 'short',
      });

      await Haptics.impact({ style: ImpactStyle.Light });

      console.log(`Added defect pin: ${pin.id}`);
      return pin.id;

    } catch (error) {
      console.error('Failed to add defect pin:', error);
      throw error;
    }
  }

  private calculateUrgencyScore(defect: DefectDetection): number {
    let score = 0;

    // Severity weight (40%)
    switch (defect.severity) {
      case 'critical': score += 40; break;
      case 'high': score += 30; break;
      case 'medium': score += 20; break;
      case 'low': score += 10; break;
    }

    // Defect type weight (30%)
    switch (defect.type) {
      case 'pothole': score += 30; break;
      case 'alligator_crack': score += 25; break;
      case 'transverse_crack': score += 20; break;
      case 'longitudinal_crack': score += 15; break;
      case 'block_crack': score += 15; break;
      case 'edge_crack': score += 10; break;
      default: score += 10; break;
    }

    // Size/area weight (20%)
    const area = defect.dimensions.area || 0;
    if (area > 1000) score += 20;
    else if (area > 500) score += 15;
    else if (area > 100) score += 10;
    else score += 5;

    // Confidence weight (10%)
    score += defect.confidence * 10;

    return Math.min(100, Math.max(0, score));
  }

  private initializeDefectTimeline(defect: DefectDetection, pin: DefectPin): void {
    const timeline: DefectTimeline = {
      defectId: defect.id,
      events: [{
        id: this.generateId(),
        type: 'detection',
        timestamp: defect.timestamp,
        description: `${defect.type} detected with ${defect.severity} severity`,
        severity: defect.severity,
        confidence: defect.confidence,
        location: defect.location,
      }],
      duration: 0,
      degradationRate: 0,
      isProgressing: false,
    };

    this.defectTimelines.set(defect.id, timeline);
  }

  public async updateDefectPin(pinId: string, updates: Partial<DefectPin>): Promise<void> {
    const pin = this.defectPins.get(pinId);
    if (!pin) {
      throw new Error('Defect pin not found');
    }

    const updatedPin = { ...pin, ...updates, lastUpdated: Date.now() };
    this.defectPins.set(pinId, updatedPin);

    // Add timeline event for significant updates
    if (updates.status && updates.status !== pin.status) {
      await this.addTimelineEvent(pin.defectId, {
        type: this.getTimelineEventType(updates.status),
        description: `Status changed to ${updates.status}`,
        performedBy: updates.assignedTo,
        notes: updates.notes,
      });
    }

    // Update clusters and heatmap
    await this.updateDefectClusters();
    await this.updateHeatmapData();

    console.log(`Updated defect pin: ${pinId}`);
  }

  private getTimelineEventType(status: DefectPin['status']): TimelineEvent['type'] {
    switch (status) {
      case 'scheduled': return 'repair_scheduled';
      case 'in_progress': return 'repair_started';
      case 'completed': return 'repair_completed';
      case 'verified': return 'verification';
      case 'inspected': return 'inspection';
      default: return 'detection';
    }
  }

  public async addTimelineEvent(defectId: string, eventData: Partial<TimelineEvent>): Promise<void> {
    const timeline = this.defectTimelines.get(defectId);
    if (!timeline) {
      throw new Error('Timeline not found for defect');
    }

    const event: TimelineEvent = {
      id: this.generateId(),
      type: eventData.type || 'inspection',
      timestamp: Date.now(),
      description: eventData.description || '',
      photoPath: eventData.photoPath,
      severity: eventData.severity,
      confidence: eventData.confidence,
      performedBy: eventData.performedBy,
      notes: eventData.notes,
      location: eventData.location || { latitude: 0, longitude: 0 },
    };

    timeline.events.push(event);
    timeline.duration = (Date.now() - timeline.events[0].timestamp) / (1000 * 60 * 60 * 24); // Days

    // Calculate degradation rate
    this.calculateDegradationRate(timeline);

    this.defectTimelines.set(defectId, timeline);
  }

  private calculateDegradationRate(timeline: DefectTimeline): void {
    const severityEvents = timeline.events.filter(e => e.severity);
    if (severityEvents.length < 2) {
      timeline.degradationRate = 0;
      timeline.isProgressing = false;
      return;
    }

    const first = severityEvents[0];
    const last = severityEvents[severityEvents.length - 1];
    
    const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };
    const firstSeverity = severityValues[first.severity!];
    const lastSeverity = severityValues[last.severity!];
    
    const timeDiff = (last.timestamp - first.timestamp) / (1000 * 60 * 60 * 24); // Days
    
    if (timeDiff > 0) {
      timeline.degradationRate = (lastSeverity - firstSeverity) / timeDiff;
      timeline.isProgressing = timeline.degradationRate > 0;
    }
  }

  public async searchDefects(filters: SearchFilter): Promise<DefectPin[]> {
    this.activeFilters = filters;
    const allPins = Array.from(this.defectPins.values());

    let results = allPins;

    // Filter by defect types
    if (filters.defectTypes && filters.defectTypes.length > 0) {
      results = results.filter(pin => filters.defectTypes!.includes(pin.type));
    }

    // Filter by severities
    if (filters.severities && filters.severities.length > 0) {
      results = results.filter(pin => filters.severities!.includes(pin.severity));
    }

    // Filter by date range
    if (filters.dateRange) {
      results = results.filter(pin => 
        pin.timestamp >= filters.dateRange!.start && 
        pin.timestamp <= filters.dateRange!.end
      );
    }

    // Filter by bounding box
    if (filters.boundingBox) {
      results = results.filter(pin => 
        pin.position.latitude >= filters.boundingBox!.south &&
        pin.position.latitude <= filters.boundingBox!.north &&
        pin.position.longitude >= filters.boundingBox!.west &&
        pin.position.longitude <= filters.boundingBox!.east
      );
    }

    // Filter by minimum confidence
    if (filters.minConfidence !== undefined) {
      results = results.filter(pin => pin.confidence >= filters.minConfidence!);
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      results = results.filter(pin => filters.status!.includes(pin.status));
    }

    // Filter by assigned person
    if (filters.assignedTo) {
      results = results.filter(pin => pin.assignedTo === filters.assignedTo);
    }

    // Text search in notes and descriptions
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      results = results.filter(pin => 
        pin.notes.toLowerCase().includes(searchLower) ||
        pin.type.toLowerCase().includes(searchLower)
      );
    }

    this.searchResults = results;
    return results;
  }

  private async updateDefectClusters(): Promise<void> {
    const pins = Array.from(this.defectPins.values());
    const clusters: DefectCluster[] = [];
    const processedPins = new Set<string>();
    const clusterRadius = 50; // meters

    for (const pin of pins) {
      if (processedPins.has(pin.id)) continue;

      const nearbyPins = pins.filter(otherPin => {
        if (processedPins.has(otherPin.id) || otherPin.id === pin.id) return false;
        
        const distance = this.calculateDistance(
          pin.position.latitude,
          pin.position.longitude,
          otherPin.position.latitude,
          otherPin.position.longitude
        );
        
        return distance <= clusterRadius;
      });

      if (nearbyPins.length > 0) {
        const clusterPins = [pin, ...nearbyPins];
        const cluster = this.createCluster(clusterPins);
        clusters.push(cluster);
        
        clusterPins.forEach(p => processedPins.add(p.id));
      }
    }

    this.defectClusters = clusters;
  }

  private createCluster(pins: DefectPin[]): DefectCluster {
    const centerLat = pins.reduce((sum, pin) => sum + pin.position.latitude, 0) / pins.length;
    const centerLng = pins.reduce((sum, pin) => sum + pin.position.longitude, 0) / pins.length;
    
    const defectTypes = pins.map(pin => pin.type);
    const dominantType = this.getMostFrequent(defectTypes);
    
    const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };
    const averageSeverity = pins.reduce((sum, pin) => sum + severityValues[pin.severity], 0) / pins.length;
    
    const totalArea = pins.reduce((sum, pin) => {
      const defect = this.getDefectByPinId(pin.id);
      return sum + (defect?.dimensions.area || 0);
    }, 0);

    return {
      id: this.generateId(),
      centerPoint: {
        latitude: centerLat,
        longitude: centerLng,
      },
      radius: this.calculateClusterRadius(pins),
      defectCount: pins.length,
      defectIds: pins.map(pin => pin.id),
      dominantType,
      averageSeverity,
      totalArea,
      priority: this.calculateClusterPriority(pins),
      estimatedCost: this.calculateClusterCost(pins),
      recommendedAction: this.generateClusterRecommendation(pins),
    };
  }

  private getMostFrequent<T>(arr: T[]): T {
    const frequency = arr.reduce((acc, item) => {
      acc[item as string] = (acc[item as string] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    ) as T;
  }

  private calculateClusterRadius(pins: DefectPin[]): number {
    if (pins.length <= 1) return 0;
    
    const centerLat = pins.reduce((sum, pin) => sum + pin.position.latitude, 0) / pins.length;
    const centerLng = pins.reduce((sum, pin) => sum + pin.position.longitude, 0) / pins.length;
    
    const distances = pins.map(pin => 
      this.calculateDistance(pin.position.latitude, pin.position.longitude, centerLat, centerLng)
    );
    
    return Math.max(...distances);
  }

  private calculateClusterPriority(pins: DefectPin[]): DefectCluster['priority'] {
    const maxUrgency = Math.max(...pins.map(pin => pin.urgencyScore));
    
    if (maxUrgency >= 80) return 'critical';
    if (maxUrgency >= 60) return 'high';
    if (maxUrgency >= 40) return 'medium';
    return 'low';
  }

  private calculateClusterCost(pins: DefectPin[]): number {
    return pins.reduce((sum, pin) => sum + (pin.estimatedRepairCost || 0), 0);
  }

  private generateClusterRecommendation(pins: DefectPin[]): string {
    const dominantType = this.getMostFrequent(pins.map(pin => pin.type));
    const count = pins.length;
    
    if (count >= 10) {
      return `Large cluster of ${dominantType}s requires immediate attention. Consider area-wide reconstruction.`;
    } else if (count >= 5) {
      return `Medium cluster of ${dominantType}s. Plan coordinated repair operation.`;
    } else {
      return `Small cluster of ${dominantType}s. Can be addressed in single repair session.`;
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async updateHeatmapData(): Promise<void> {
    const pins = Array.from(this.defectPins.values());
    
    if (pins.length === 0) {
      this.heatmapData = null;
      return;
    }

    const points = pins.map(pin => ({
      latitude: pin.position.latitude,
      longitude: pin.position.longitude,
      intensity: this.calculateHeatmapIntensity(pin),
    }));

    const latitudes = points.map(p => p.latitude);
    const longitudes = points.map(p => p.longitude);

    this.heatmapData = {
      points,
      bounds: {
        north: Math.max(...latitudes),
        south: Math.min(...latitudes),
        east: Math.max(...longitudes),
        west: Math.min(...longitudes),
      },
      generated: Date.now(),
    };
  }

  private calculateHeatmapIntensity(pin: DefectPin): number {
    const severityWeights = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 };
    const urgencyWeight = pin.urgencyScore / 100;
    const confidenceWeight = pin.confidence;
    
    return (severityWeights[pin.severity] + urgencyWeight + confidenceWeight) / 3;
  }

  private getDefectByPinId(pinId: string): DefectDetection | null {
    // In a real implementation, this would query the defect database
    return null;
  }

  // Map overlay management

  public async addMapOverlay(overlay: Omit<MapOverlay, 'id' | 'lastUpdated'>): Promise<string> {
    const id = this.generateId();
    const fullOverlay: MapOverlay = {
      ...overlay,
      id,
      lastUpdated: Date.now(),
    };

    this.mapOverlays.set(id, fullOverlay);
    return id;
  }

  public updateMapOverlay(id: string, updates: Partial<MapOverlay>): void {
    const overlay = this.mapOverlays.get(id);
    if (overlay) {
      this.mapOverlays.set(id, { ...overlay, ...updates, lastUpdated: Date.now() });
    }
  }

  public removeMapOverlay(id: string): void {
    this.mapOverlays.delete(id);
  }

  // Analytics and reporting

  public generateAnalytics(): AnalyticsData {
    const pins = Array.from(this.defectPins.values());
    
    const defectsByType = pins.reduce((acc, pin) => {
      acc[pin.type] = (acc[pin.type] || 0) + 1;
      return acc;
    }, {} as Record<DefectDetection['type'], number>);

    const defectsBySeverity = pins.reduce((acc, pin) => {
      acc[pin.severity] = (acc[pin.severity] || 0) + 1;
      return acc;
    }, {} as Record<DefectDetection['severity'], number>);

    const averageConfidence = pins.length > 0 ? 
      pins.reduce((sum, pin) => sum + pin.confidence, 0) / pins.length : 0;

    const repairProgress = pins.reduce((acc, pin) => {
      switch (pin.status) {
        case 'completed': acc.completed++; break;
        case 'in_progress': acc.inProgress++; break;
        case 'scheduled': acc.scheduled++; break;
        default: acc.pending++; break;
      }
      return acc;
    }, { completed: 0, inProgress: 0, scheduled: 0, pending: 0 });

    const totalEstimatedCost = pins.reduce((sum, pin) => sum + (pin.estimatedRepairCost || 0), 0);
    const completedRepairCost = pins
      .filter(pin => pin.status === 'completed')
      .reduce((sum, pin) => sum + (pin.estimatedRepairCost || 0), 0);

    const costByType = pins.reduce((acc, pin) => {
      const cost = pin.estimatedRepairCost || 0;
      acc[pin.type] = (acc[pin.type] || 0) + cost;
      return acc;
    }, {} as Record<DefectDetection['type'], number>);

    return {
      totalDefects: pins.length,
      defectsByType,
      defectsBySeverity,
      averageConfidence,
      detectionTrends: this.generateDetectionTrends(pins),
      hotspots: this.defectClusters,
      repairProgress,
      costAnalysis: {
        totalEstimatedCost,
        completedRepairCost,
        averageCostPerDefect: pins.length > 0 ? totalEstimatedCost / pins.length : 0,
        costByType,
      },
    };
  }

  private generateDetectionTrends(pins: DefectPin[]): AnalyticsData['detectionTrends'] {
    const trends: Record<string, { count: number; types: Record<DefectDetection['type'], number> }> = {};
    
    pins.forEach(pin => {
      const date = new Date(pin.timestamp).toISOString().split('T')[0];
      
      if (!trends[date]) {
        trends[date] = { count: 0, types: {} as Record<DefectDetection['type'], number> };
      }
      
      trends[date].count++;
      trends[date].types[pin.type] = (trends[date].types[pin.type] || 0) + 1;
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      count: data.count,
      types: data.types,
    }));
  }

  // Export and import

  public async exportMappingData(format: 'json' | 'geojson' | 'kml' = 'json'): Promise<string> {
    let data: string;
    
    switch (format) {
      case 'geojson':
        data = this.exportAsGeoJSON();
        break;
      case 'kml':
        data = this.exportAsKML();
        break;
      default:
        data = JSON.stringify({
          defectPins: Array.from(this.defectPins.values()),
          timelines: Array.from(this.defectTimelines.values()),
          clusters: this.defectClusters,
          analytics: this.generateAnalytics(),
        }, null, 2);
    }

    const fileName = `defect_mapping_${Date.now()}.${format}`;
    const result = await Filesystem.writeFile({
      path: fileName,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    return result.uri;
  }

  private exportAsGeoJSON(): string {
    const features = Array.from(this.defectPins.values()).map(pin => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [pin.position.longitude, pin.position.latitude],
      },
      properties: {
        id: pin.id,
        defectId: pin.defectId,
        type: pin.type,
        severity: pin.severity,
        confidence: pin.confidence,
        status: pin.status,
        urgencyScore: pin.urgencyScore,
        timestamp: pin.timestamp,
        notes: pin.notes,
      },
    }));

    return JSON.stringify({
      type: 'FeatureCollection',
      features,
    }, null, 2);
  }

  private exportAsKML(): string {
    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    kml += '  <Document>\n';
    kml += '    <name>Pavement Defects</name>\n';
    kml += '    <description>Defect mapping data from PaveMaster Suite</description>\n';

    Array.from(this.defectPins.values()).forEach(pin => {
      kml += '    <Placemark>\n';
      kml += `      <name>${pin.type} - ${pin.severity}</name>\n`;
      kml += `      <description><![CDATA[
        Type: ${pin.type}<br/>
        Severity: ${pin.severity}<br/>
        Confidence: ${(pin.confidence * 100).toFixed(1)}%<br/>
        Status: ${pin.status}<br/>
        Urgency Score: ${pin.urgencyScore}<br/>
        Notes: ${pin.notes}
      ]]></description>\n`;
      kml += '      <Point>\n';
      kml += `        <coordinates>${pin.position.longitude},${pin.position.latitude},0</coordinates>\n`;
      kml += '      </Point>\n';
      kml += '    </Placemark>\n';
    });

    kml += '  </Document>\n';
    kml += '</kml>\n';

    return kml;
  }

  // Getters

  public getAllDefectPins(): DefectPin[] {
    return Array.from(this.defectPins.values());
  }

  public getDefectPin(id: string): DefectPin | null {
    return this.defectPins.get(id) || null;
  }

  public getDefectTimeline(defectId: string): DefectTimeline | null {
    return this.defectTimelines.get(defectId) || null;
  }

  public getDefectClusters(): DefectCluster[] {
    return [...this.defectClusters];
  }

  public getHeatmapData(): HeatmapData | null {
    return this.heatmapData;
  }

  public getMapOverlays(): MapOverlay[] {
    return Array.from(this.mapOverlays.values());
  }

  public getSearchResults(): DefectPin[] {
    return [...this.searchResults];
  }

  public getCurrentMapBounds(): typeof this.currentBounds {
    return { ...this.currentBounds };
  }

  public setCurrentMapBounds(bounds: typeof this.currentBounds): void {
    this.currentBounds = bounds;
  }

  public setCurrentMapCenter(center: typeof this.currentCenter): void {
    this.currentCenter = center;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Export singleton instance
export const visualDefectMappingService = new VisualDefectMappingService();
export default visualDefectMappingService;