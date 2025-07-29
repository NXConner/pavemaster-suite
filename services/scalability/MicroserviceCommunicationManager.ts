import { EventEmitter } from 'events';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

// Supported communication patterns
export enum CommunicationPattern {
  REQUEST_RESPONSE = 'request_response',
  PUBLISH_SUBSCRIBE = 'publish_subscribe',
  STREAMING = 'streaming'
}

// Service registration options
export interface ServiceRegistrationOptions {
  name: string;
  version: string;
  host: string;
  port: number;
  proto: string;
  communicationPatterns: CommunicationPattern[];
}

// Message interface for inter-service communication
export interface ServiceMessage {
  id: string;
  service: string;
  timestamp: number;
  type: string;
  payload: any;
  metadata?: Record<string, any>;
}

// Performance tracking for service calls
export interface ServicePerformanceMetric {
  serviceMethod: string;
  latency: number;
  timestamp: number;
  status: 'success' | 'error';
}

// Advanced error handling
export class MicroserviceError extends Error {
  public code: grpc.status;
  public details: any;

  constructor(message: string, code: grpc.status, details?: any) {
    super(message);
    this.name = 'MicroserviceError';
    this.code = code;
    this.details = details;
  }
}

export class MicroserviceCommunicationManager {
  private static instance: MicroserviceCommunicationManager;
  private eventBus: EventEmitter;
  private registeredServices: Map<string, ServiceRegistrationOptions>;
  private performanceMetrics: ServicePerformanceMetric[];
  private grpcServer: grpc.Server;

  private constructor() {
    this.eventBus = new EventEmitter();
    this.registeredServices = new Map();
    this.performanceMetrics = [];
    this.grpcServer = new grpc.Server();
  }

  public static getInstance(): MicroserviceCommunicationManager {
    if (!MicroserviceCommunicationManager.instance) {
      MicroserviceCommunicationManager.instance = new MicroserviceCommunicationManager();
    }
    return MicroserviceCommunicationManager.instance;
  }

  // Register a microservice
  public registerService(options: ServiceRegistrationOptions): void {
    const serviceKey = `${options.name}:${options.version}`;
    
    if (this.registeredServices.has(serviceKey)) {
      throw new Error(`Service ${serviceKey} is already registered`);
    }

    this.registeredServices.set(serviceKey, options);

    // Load proto definition
    const packageDefinition = protoLoader.loadSync(options.proto, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    
    // TODO: Implement service binding logic based on communication patterns
  }

  // Send a message between services
  public async sendMessage(
    sourceService: string, 
    targetService: string, 
    message: ServiceMessage
  ): Promise<ServiceMessage> {
    const startTime = performance.now();
    
    try {
      // Validate message
      if (!message.id) {
        message.id = uuidv4();
      }
      message.timestamp = Date.now();

      // Emit message to event bus
      this.eventBus.emit(`message:${targetService}`, message);

      // Record performance metric
      const latency = performance.now() - startTime;
      this.recordPerformanceMetric({
        serviceMethod: `${sourceService}->${targetService}`,
        latency,
        timestamp: Date.now(),
        status: 'success'
      });

      return message;
    } catch (error) {
      // Record error performance metric
      this.recordPerformanceMetric({
        serviceMethod: `${sourceService}->${targetService}`,
        latency: performance.now() - startTime,
        timestamp: Date.now(),
        status: 'error'
      });

      throw new MicroserviceError(
        'Failed to send message', 
        grpc.status.INTERNAL, 
        error
      );
    }
  }

  // Subscribe to messages from a specific service
  public subscribeToService(
    serviceName: string, 
    handler: (message: ServiceMessage) => void
  ): () => void {
    const eventName = `message:${serviceName}`;
    
    this.eventBus.on(eventName, handler);

    return () => {
      this.eventBus.removeListener(eventName, handler);
    };
  }

  // Record performance metrics
  private recordPerformanceMetric(metric: ServicePerformanceMetric): void {
    this.performanceMetrics.push(metric);

    // Keep only the last 100 metrics to prevent memory bloat
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics.shift();
    }
  }

  // Get performance metrics
  public getPerformanceMetrics(
    filter?: Partial<ServicePerformanceMetric>
  ): ServicePerformanceMetric[] {
    if (!filter) return this.performanceMetrics;

    return this.performanceMetrics.filter(metric => 
      Object.entries(filter).every(([key, value]) => metric[key] === value)
    );
  }

  // Start the gRPC server
  public startServer(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.grpcServer.bindAsync(
          `${host}:${port}`, 
          grpc.ServerCredentials.createInsecure(),
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            this.grpcServer.start();
            console.log(`Microservice Communication Server started on ${host}:${port}`);
            resolve();
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  // Shutdown the gRPC server
  public async shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.grpcServer.tryShutdown((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

// Singleton export
export const microserviceCommunicationManager = MicroserviceCommunicationManager.getInstance();