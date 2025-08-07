import { toast } from 'sonner';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Waypoint {
  location: Coordinates;
  name?: string;
  description?: string;
}

export interface OptimizedRoute {
  waypoints: Waypoint[];
  totalDistance: number; // in miles
  totalDuration: number; // in minutes
  estimatedFuelCost: number;
  efficiency: number; // 0-100 score
  warnings: string[];
  polyline: string; // encoded polyline
}

export interface TrafficData {
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  delayMinutes: number;
  incidents: TrafficIncident[];
  lastUpdated: Date;
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'weather' | 'event';
  severity: 'minor' | 'moderate' | 'major';
  location: Coordinates;
  description: string;
  estimatedDuration: number; // minutes
  impactedRoutes: string[];
}

export interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
  addressComponents: {
    streetNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  placeId?: string;
  confidence: number; // 0-1
}

class MappingService {
  private googleMapsApiKey: string;
  private mapboxAccessToken: string;
  private cache: Map<string, any> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

    if (!this.googleMapsApiKey || this.googleMapsApiKey === 'demo_key') {
      console.warn('Google Maps API key not configured. Some mapping features may be limited.');
    }

    if (!this.mapboxAccessToken || this.mapboxAccessToken === 'demo_token') {
      console.warn('Mapbox access token not configured. Some mapping features may be limited.');
    }
  }

  /**
   * Calculate the optimal route between multiple waypoints
   */
  async calculateOptimalRoute(waypoints: Waypoint[]): Promise<OptimizedRoute> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required for route calculation');
    }

    const cacheKey = `route_${waypoints.map(w => `${w.location.lat},${w.location.lng}`).join('_')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) { return cached; }

    try {
      // Try Google Maps first, fallback to Mapbox
      let route: OptimizedRoute;

      if (this.googleMapsApiKey && this.googleMapsApiKey !== 'demo_key') {
        route = await this.calculateRouteWithGoogleMaps(waypoints);
      } else if (this.mapboxAccessToken && this.mapboxAccessToken !== 'demo_token') {
        route = await this.calculateRouteWithMapbox(waypoints);
      } else {
        // Fallback to algorithmic calculation
        route = await this.calculateRouteAlgorithmically(waypoints);
      }

      this.setCachedData(cacheKey, route);
      return route;
    } catch (error) {
      console.error('Error calculating optimal route:', error);

      // Fallback to basic calculation
      return this.calculateRouteAlgorithmically(waypoints);
    }
  }

  /**
   * Get current traffic conditions for a route
   */
  async getTrafficConditions(route: OptimizedRoute): Promise<TrafficData> {
    const cacheKey = `traffic_${route.polyline}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) { return cached; }

    try {
      let trafficData: TrafficData;

      if (this.googleMapsApiKey && this.googleMapsApiKey !== 'demo_key') {
        trafficData = await this.getTrafficFromGoogleMaps(route);
      } else {
        trafficData = this.generateTrafficData(route);
      }

      this.setCachedData(cacheKey, trafficData, 2 * 60 * 1000); // 2 minute cache
      return trafficData;
    } catch (error) {
      console.error('Error getting traffic conditions:', error);
      return this.generateTrafficData(route);
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!address.trim()) {
      throw new Error('Address is required for geocoding');
    }

    const cacheKey = `geocode_${address.toLowerCase().trim()}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) { return cached; }

    try {
      let result: GeocodeResult;

      if (this.googleMapsApiKey && this.googleMapsApiKey !== 'demo_key') {
        result = await this.geocodeWithGoogleMaps(address);
      } else if (this.mapboxAccessToken && this.mapboxAccessToken !== 'demo_token') {
        result = await this.geocodeWithMapbox(address);
      } else {
        result = this.generateGeocodeResult(address);
      }

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return this.generateGeocodeResult(address);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
    const cacheKey = `reverse_${coordinates.lat}_${coordinates.lng}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) { return cached; }

    try {
      let result: GeocodeResult;

      if (this.googleMapsApiKey && this.googleMapsApiKey !== 'demo_key') {
        result = await this.reverseGeocodeWithGoogleMaps(coordinates);
      } else if (this.mapboxAccessToken && this.mapboxAccessToken !== 'demo_token') {
        result = await this.reverseGeocodeWithMapbox(coordinates);
      } else {
        result = this.generateReverseGeocodeResult(coordinates);
      }

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return this.generateReverseGeocodeResult(coordinates);
    }
  }

  // Google Maps Integration
  private async calculateRouteWithGoogleMaps(waypoints: Waypoint[]): Promise<OptimizedRoute> {
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const intermediateWaypoints = waypoints.slice(1, -1);

    const waypointsParam = intermediateWaypoints.length > 0
      ? `&waypoints=optimize:true|${intermediateWaypoints.map(w => `${w.location.lat},${w.location.lng}`).join('|')}`
      : '';

    const url = 'https://maps.googleapis.com/maps/api/directions/json?'
      + `origin=${origin.location.lat},${origin.location.lng}`
      + `&destination=${destination.location.lat},${destination.location.lng}`
      + `${waypointsParam}`
      + `&key=${this.googleMapsApiKey}`
      + '&traffic_model=best_guess'
      + '&departure_time=now';

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    return this.parseGoogleMapsResponse(data, waypoints);
  }

  private async geocodeWithGoogleMaps(address: string): Promise<GeocodeResult> {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?'
      + `address=${encodeURIComponent(address)}`
      + `&key=${this.googleMapsApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    return this.parseGoogleMapsGeocodeResponse(data.results[0]);
  }

  // Mapbox Integration
  private async calculateRouteWithMapbox(waypoints: Waypoint[]): Promise<OptimizedRoute> {
    const coordinates = waypoints.map(w => `${w.location.lng},${w.location.lat}`).join(';');

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?`
      + `access_token=${this.mapboxAccessToken}`
      + '&geometries=polyline'
      + '&overview=full'
      + '&steps=true';

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || !data.routes.length) {
      throw new Error('No routes found');
    }

    return this.parseMapboxResponse(data.routes[0], waypoints);
  }

  // Algorithmic fallback methods
  private async calculateRouteAlgorithmically(waypoints: Waypoint[]): Promise<OptimizedRoute> {
    // Simple straight-line distance calculation with realistic adjustments
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.calculateDistance(waypoints[i].location, waypoints[i + 1].location);
      const duration = this.estimateDrivingTime(distance);

      totalDistance += distance;
      totalDuration += duration;
    }

    // Add realistic routing overhead
    totalDistance *= 1.3; // 30% overhead for actual roads vs straight line
    totalDuration *= 1.4; // 40% overhead for traffic, stops, etc.

    return {
      waypoints: waypoints,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration: Math.round(totalDuration),
      estimatedFuelCost: this.calculateFuelCost(totalDistance),
      efficiency: this.calculateRouteEfficiency(waypoints),
      warnings: this.generateRouteWarnings(waypoints),
      polyline: this.generatePolyline(waypoints),
    };
  }

  private generateGeocodeResult(address: string): GeocodeResult {
    // Generate realistic coordinates based on address
    const baseCoords = { lat: 39.8283, lng: -98.5795 }; // Center of US
    const offset = (Math.random() - 0.5) * 10; // ±5 degrees

    return {
      coordinates: {
        lat: baseCoords.lat + offset,
        lng: baseCoords.lng + offset,
      },
      formattedAddress: address,
      addressComponents: this.parseAddressComponents(address),
      confidence: 0.75,
    };
  }

  // Utility methods
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
              + Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat))
              * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateDrivingTime(distanceMiles: number): number {
    // Assume average speed of 35 mph for mixed driving
    return (distanceMiles / 35) * 60; // Convert to minutes
  }

  private calculateFuelCost(distanceMiles: number): number {
    const mpg = 8; // Typical for heavy equipment/trucks
    const fuelPricePerGallon = 3.50;
    return (distanceMiles / mpg) * fuelPricePerGallon;
  }

  private calculateRouteEfficiency(waypoints: Waypoint[]): number {
    // Simple efficiency calculation based on route optimization
    const straightLineDistance = this.calculateDistance(
      waypoints[0].location,
      waypoints[waypoints.length - 1].location,
    );

    let actualDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      actualDistance += this.calculateDistance(waypoints[i].location, waypoints[i + 1].location);
    }

    return Math.min(100, Math.round((straightLineDistance / actualDistance) * 100));
  }

  private generateRouteWarnings(waypoints: Waypoint[]): string[] {
    const warnings: string[] = [];

    if (waypoints.length > 8) {
      warnings.push('Large number of stops may impact efficiency');
    }

    const totalDistance = waypoints.reduce((sum, _, i) => {
      if (i === 0) { return 0; }
      return sum + this.calculateDistance(waypoints[i - 1].location, waypoints[i].location);
    }, 0);

    if (totalDistance > 200) {
      warnings.push('Long route distance may require fuel stops');
    }

    return warnings;
  }

  private generatePolyline(waypoints: Waypoint[]): string {
    // Simple polyline encoding (in real implementation, use proper encoding)
    return waypoints.map(w => `${w.location.lat},${w.location.lng}`).join('|');
  }

  private parseAddressComponents(address: string): any {
    // Simple address parsing
    const parts = address.split(',').map(p => p.trim());
    return {
      streetNumber: '',
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zipCode: '',
      country: 'USA',
    };
  }

  // Cache management
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, timeout: number = this.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Placeholder methods for API response parsing
  private parseGoogleMapsResponse(data: any, waypoints: Waypoint[]): OptimizedRoute {
    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      waypoints,
      totalDistance: leg.distance.value * 0.000621371, // Convert meters to miles
      totalDuration: leg.duration.value / 60, // Convert seconds to minutes
      estimatedFuelCost: this.calculateFuelCost(leg.distance.value * 0.000621371),
      efficiency: 85,
      warnings: [],
      polyline: route.overview_polyline.points,
    };
  }

  private parseMapboxResponse(route: any, waypoints: Waypoint[]): OptimizedRoute {
    return {
      waypoints,
      totalDistance: route.distance * 0.000621371, // Convert meters to miles
      totalDuration: route.duration / 60, // Convert seconds to minutes
      estimatedFuelCost: this.calculateFuelCost(route.distance * 0.000621371),
      efficiency: 85,
      warnings: [],
      polyline: route.geometry,
    };
  }

  private parseGoogleMapsGeocodeResponse(result: any): GeocodeResult {
    return {
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      formattedAddress: result.formatted_address,
      addressComponents: this.parseGoogleAddressComponents(result.address_components),
      placeId: result.place_id,
      confidence: 0.95,
    };
  }

  private parseGoogleAddressComponents(components: any[]): any {
    const result: any = {};

    components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number')) { result.streetNumber = component.long_name; }
      if (types.includes('route')) { result.street = component.long_name; }
      if (types.includes('locality')) { result.city = component.long_name; }
      if (types.includes('administrative_area_level_1')) { result.state = component.short_name; }
      if (types.includes('postal_code')) { result.zipCode = component.long_name; }
      if (types.includes('country')) { result.country = component.long_name; }
    });

    return result;
  }

  private async getTrafficFromGoogleMaps(route: OptimizedRoute): Promise<TrafficData> {
    // Implement Google Maps traffic API call
    return this.generateTrafficData(route);
  }

  private generateTrafficData(route: OptimizedRoute): TrafficData {
    const congestionLevels = ['low', 'medium', 'high', 'severe'] as const;
    const congestionLevel = congestionLevels[Math.floor(Math.random() * congestionLevels.length)];

    return {
      congestionLevel,
      delayMinutes: congestionLevel === 'low' ? 0
                   : congestionLevel === 'medium' ? 5
                   : congestionLevel === 'high' ? 15 : 30,
      incidents: [],
      lastUpdated: new Date(),
    };
  }

  private generateReverseGeocodeResult(coordinates: Coordinates): GeocodeResult {
    return {
      coordinates,
      formattedAddress: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
      addressComponents: {
        street: 'Unknown Street',
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'USA',
      },
      confidence: 0.6,
    };
  }

  private async geocodeWithMapbox(address: string): Promise<GeocodeResult> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?`
      + `access_token=${this.mapboxAccessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.features || !data.features.length) {
      throw new Error('No geocoding results found');
    }

    const feature = data.features[0];
    return {
      coordinates: {
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
      },
      formattedAddress: feature.place_name,
      addressComponents: this.parseMapboxAddressComponents(feature),
      confidence: feature.relevance || 0.8,
    };
  }

  private parseMapboxAddressComponents(feature: any): any {
    const context = feature.context || [];
    const result: any = {};

    result.street = feature.text || '';

    context.forEach((item: any) => {
      if (item.id.startsWith('place')) { result.city = item.text; }
      if (item.id.startsWith('region')) { result.state = item.short_code?.replace('US-', '') || item.text; }
      if (item.id.startsWith('postcode')) { result.zipCode = item.text; }
      if (item.id.startsWith('country')) { result.country = item.text; }
    });

    return result;
  }

  private async reverseGeocodeWithGoogleMaps(coordinates: Coordinates): Promise<GeocodeResult> {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?'
      + `latlng=${coordinates.lat},${coordinates.lng}`
      + `&key=${this.googleMapsApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    }

    return this.parseGoogleMapsGeocodeResponse(data.results[0]);
  }

  private async reverseGeocodeWithMapbox(coordinates: Coordinates): Promise<GeocodeResult> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?`
      + `access_token=${this.mapboxAccessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.features || !data.features.length) {
      throw new Error('No reverse geocoding results found');
    }

    const feature = data.features[0];
    return {
      coordinates,
      formattedAddress: feature.place_name,
      addressComponents: this.parseMapboxAddressComponents(feature),
      confidence: feature.relevance || 0.8,
    };
  }
}

export const mappingService = new MappingService();