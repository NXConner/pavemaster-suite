import { EventEmitter } from 'events';
import * as dns from 'dns';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Service metadata interface
export interface ServiceMetadata {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  tags: string[];
  lastHeartbeat: number;
  status: 'healthy' | 'unhealthy' | 'degraded';
  capabilities: string[];
}

// Service health status
export enum ServiceHealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded'
}

// Service discovery configuration
export interface ServiceDiscoveryConfig {
  heartbeatInterval?: number;
  healthCheckTimeout?: number;
  discoveryTTL?: number;
}

export class ServiceDiscovery {
  private static instance: ServiceDiscovery;
  private services: Map<string, ServiceMetadata>;
  private eventEmitter: EventEmitter;
  private heartbeatInterval: NodeJS.Timeout | null;
  private config: ServiceDiscoveryConfig;

  private constructor(config: ServiceDiscoveryConfig = {}) {
    this.services = new Map();
    this.eventEmitter = new EventEmitter();
    this.heartbeatInterval = null;
    this.config = {
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      healthCheckTimeout: config.healthCheckTimeout || 10000, // 10 seconds
      discoveryTTL: config.discoveryTTL || 90000 // 90 seconds
    };
  }

  public static getInstance(config?: ServiceDiscoveryConfig): ServiceDiscovery {
    if (!ServiceDiscovery.instance) {
      ServiceDiscovery.instance = new ServiceDiscovery(config);
    }
    return ServiceDiscovery.instance;
  }

  // Register a new service
  public registerService(service: Omit<ServiceMetadata, 'id' | 'lastHeartbeat'>): string {
    const serviceId = uuidv4();
    const serviceMetadata: ServiceMetadata = {
      ...service,
      id: serviceId,
      lastHeartbeat: Date.now(),
      status: ServiceHealthStatus.HEALTHY
    };

    this.services.set(serviceId, serviceMetadata);
    this.eventEmitter.emit('service:registered', serviceMetadata);

    return serviceId;
  }

  // Unregister a service
  public unregisterService(serviceId: string): void {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      this.eventEmitter.emit('service:unregistered', service);
    }
  }

  // Get all registered services
  public getServices(filter?: Partial<ServiceMetadata>): ServiceMetadata[] {
    const allServices = Array.from(this.services.values());
    
    if (!filter) return allServices;

    return allServices.filter(service => 
      Object.entries(filter).every(([key, value]) => service[key] === value)
    );
  }

  // Find services by name
  public findServicesByName(name: string): ServiceMetadata[] {
    return this.getServices({ name });
  }

  // Start periodic health checks and heartbeats
  public startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      this.services.forEach((service, serviceId) => {
        this.checkServiceHealth(serviceId)
          .then(status => {
            if (status !== service.status) {
              service.status = status;
              this.eventEmitter.emit('service:status_changed', service);
            }

            // Update last heartbeat
            service.lastHeartbeat = now;

            // Remove services that haven't sent a heartbeat in a while
            if (now - service.lastHeartbeat > this.config.discoveryTTL!) {
              this.unregisterService(serviceId);
            }
          });
      });
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat mechanism
  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Check service health via DNS resolution and optional custom health check
  private async checkServiceHealth(serviceId: string): Promise<ServiceHealthStatus> {
    const service = this.services.get(serviceId);
    if (!service) return ServiceHealthStatus.UNHEALTHY;

    try {
      // DNS resolution check
      await new Promise<void>((resolve, reject) => {
        dns.resolve(service.host, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // TODO: Implement more sophisticated health checks
      // Could involve making a gRPC health check call or HTTP ping

      return ServiceHealthStatus.HEALTHY;
    } catch (error) {
      console.warn(`Health check failed for service ${serviceId}:`, error);
      return ServiceHealthStatus.UNHEALTHY;
    }
  }

  // Subscribe to service discovery events
  public on(event: string, listener: (...args: any[]) => void): () => void {
    this.eventEmitter.on(event, listener);
    return () => {
      this.eventEmitter.removeListener(event, listener);
    };
  }
}

// Singleton export
export const serviceDiscovery = ServiceDiscovery.getInstance();