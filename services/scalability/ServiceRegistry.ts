import * as os from 'os';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { v4 as uuidv4 } from 'uuid';

// Service Health Status
export enum ServiceHealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  STARTING = 'STARTING',
  STOPPED = 'STOPPED'
}

// Service Metadata Interface
export interface ServiceMetadata {
  id: string;
  name: string;
  host: string;
  port: number;
  version: string;
  status: ServiceHealthStatus;
  tags: string[];
  metadata: Record<string, string>;
  lastHeartbeat: number;
  resourceUsage?: {
    cpu: number;
    memory: number;
    diskUsage: number;
  };
}

// Service Registration Options
export interface ServiceRegistrationOptions {
  name: string;
  host?: string;
  port?: number;
  version?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

// Service Discovery Configuration
export interface ServiceDiscoveryConfig {
  heartbeatInterval: number;
  healthCheckTimeout: number;
  discoveryTTL: number;
}

export class ServiceRegistry {
  private static INSTANCE: ServiceRegistry;
  private services: Map<string, ServiceMetadata> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private config: ServiceDiscoveryConfig;
  private heartbeatIntervalId?: NodeJS.Timeout;

  private constructor(config?: Partial<ServiceDiscoveryConfig>) {
    // Default configuration
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      healthCheckTimeout: 10000, // 10 seconds
      discoveryTTL: 90000 // 90 seconds
    };

    // Override with provided configuration
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start heartbeat mechanism
    this.startHeartbeat();
  }

  // Singleton pattern
  public static getInstance(
    config?: Partial<ServiceDiscoveryConfig>
  ): ServiceRegistry {
    if (!ServiceRegistry.INSTANCE) {
      ServiceRegistry.INSTANCE = new ServiceRegistry(config);
    }
    return ServiceRegistry.INSTANCE;
  }

  // Register a new service
  public registerService(
    options: ServiceRegistrationOptions
  ): ServiceMetadata {
    // Generate unique service ID
    const serviceId = this.generateServiceId(options);

    // Determine host and port
    const host = options.host || this.getLocalIP();
    const port = options.port || this.findAvailablePort();

    const serviceMetadata: ServiceMetadata = {
      id: serviceId,
      name: options.name,
      host,
      port,
      version: options.version || '1.0.0',
      status: ServiceHealthStatus.STARTING,
      tags: options.tags || [],
      metadata: options.metadata || {},
      lastHeartbeat: Date.now(),
      resourceUsage: this.getResourceUsage()
    };

    // Store service
    this.services.set(serviceId, serviceMetadata);

    // Emit service registration event
    this.eventEmitter.emit('serviceRegistered', serviceMetadata);

    return serviceMetadata;
  }

  // Unregister a service
  public unregisterService(serviceId: string): void {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      this.eventEmitter.emit('serviceUnregistered', service);
    }
  }

  // Get service by ID
  public getServiceById(serviceId: string): ServiceMetadata | undefined {
    return this.services.get(serviceId);
  }

  // Find services by name or tags
  public findServices(
    criteria: { 
      name?: string, 
      tags?: string[] 
    }
  ): ServiceMetadata[] {
    return Array.from(this.services.values()).filter(service => {
      const nameMatch = !criteria.name || service.name === criteria.name;
      const tagsMatch = !criteria.tags || 
        criteria.tags.every(tag => service.tags.includes(tag));
      
      return nameMatch && tagsMatch;
    });
  }

  // Update service health status
  public updateServiceStatus(
    serviceId: string, 
    status: ServiceHealthStatus
  ): void {
    const service = this.services.get(serviceId);
    if (service) {
      service.status = status;
      service.lastHeartbeat = Date.now();
      service.resourceUsage = this.getResourceUsage();

      this.eventEmitter.emit('serviceStatusUpdated', service);
    }
  }

  // Service health check mechanism
  private startHeartbeat(): void {
    this.heartbeatIntervalId = setInterval(() => {
      const now = Date.now();
      
      // Check and update service statuses
      this.services.forEach((service, serviceId) => {
        const timeSinceLastHeartbeat = now - service.lastHeartbeat;

        if (timeSinceLastHeartbeat > this.config.discoveryTTL) {
          // Mark service as unhealthy or remove
          this.updateServiceStatus(serviceId, ServiceHealthStatus.UNHEALTHY);
        }
      });
    }, this.config.heartbeatInterval);
  }

  // Event subscription
  public on(
    event: 'serviceRegistered' | 'serviceUnregistered' | 'serviceStatusUpdated', 
    listener: (service: ServiceMetadata) => void
  ): void {
    this.eventEmitter.on(event, listener);
  }

  // Utility: Generate unique service ID
  private generateServiceId(options: ServiceRegistrationOptions): string {
    const uniqueString = `${options.name}-${Date.now()}-${Math.random()}`;
    return crypto
      .createHash('sha256')
      .update(uniqueString)
      .digest('hex')
      .substring(0, 16);
  }

  // Utility: Get local IP address
  private getLocalIP(): string {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces || []) {
        if (!iface.internal && iface.family === 'IPv4') {
          return iface.address;
        }
      }
    }
    return 'localhost';
  }

  // Utility: Find an available port
  private findAvailablePort(): number {
    // In a real-world scenario, you'd implement a more robust port finding mechanism
    return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
  }

  // Utility: Get current resource usage
  private getResourceUsage(): ServiceMetadata['resourceUsage'] {
    const cpus = os.cpus();
    const totalCpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return acc + (cpu.times.user / total) * 100;
    }, 0) / cpus.length;

    return {
      cpu: Number(totalCpuUsage.toFixed(2)),
      memory: Number((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
      diskUsage: 0 // Placeholder - would require additional system calls
    };
  }

  // Cleanup method
  public destroy(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
    }
    this.services.clear();
    this.eventEmitter.removeAllListeners();
  }
}

// Singleton instance for global access
export const serviceRegistry = ServiceRegistry.getInstance();