import { EventEmitter } from 'events';
import * as winston from 'winston';
import { EnterprisePlatform, SyncStatus } from './IntegrationManager';

// Integration Event Types
export enum IntegrationEventType {
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  AUTH_STARTED = 'auth_started',
  AUTH_COMPLETED = 'auth_completed',
  AUTH_FAILED = 'auth_failed',
  TOKEN_REFRESHED = 'token_refreshed'
}

// Integration Event Interface
export interface IntegrationEvent {
  id: string;
  type: IntegrationEventType;
  platform: EnterprisePlatform;
  timestamp: number;
  details?: any;
}

// Advanced Logging Configuration
const loggerConfig = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // File transport for detailed logs
    new winston.transports.File({ 
      filename: 'logs/enterprise_integration.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Error-specific log file
    new winston.transports.File({ 
      filename: 'logs/enterprise_integration_errors.log',
      level: 'error'
    })
  ]
};

export class IntegrationEventService {
  private static instance: IntegrationEventService;
  private eventEmitter: EventEmitter;
  private logger: winston.Logger;
  private eventHistory: IntegrationEvent[] = [];

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.logger = winston.createLogger(loggerConfig);

    // Set max listeners to prevent memory leaks
    this.eventEmitter.setMaxListeners(50);

    // Setup event listeners
    this.setupEventListeners();
  }

  // Singleton pattern
  public static getInstance(): IntegrationEventService {
    if (!IntegrationEventService.instance) {
      IntegrationEventService.instance = new IntegrationEventService();
    }
    return IntegrationEventService.instance;
  }

  // Event emission method
  public emit(event: IntegrationEvent): void {
    // Store event in history
    this.eventHistory.push(event);

    // Log the event
    this.logEvent(event);

    // Emit to event listeners
    this.eventEmitter.emit(event.type, event);
  }

  // Event subscription method
  public on(
    eventType: IntegrationEventType, 
    listener: (event: IntegrationEvent) => void
  ): void {
    this.eventEmitter.on(eventType, listener);
  }

  // Remove specific event listener
  public off(
    eventType: IntegrationEventType, 
    listener: (event: IntegrationEvent) => void
  ): void {
    this.eventEmitter.off(eventType, listener);
  }

  // Get event history
  public getEventHistory(
    options?: {
      platform?: EnterprisePlatform, 
      type?: IntegrationEventType,
      limit?: number
    }
  ): IntegrationEvent[] {
    let filteredHistory = this.eventHistory;

    if (options?.platform) {
      filteredHistory = filteredHistory.filter(
        event => event.platform === options.platform
      );
    }

    if (options?.type) {
      filteredHistory = filteredHistory.filter(
        event => event.type === options.type
      );
    }

    if (options?.limit) {
      filteredHistory = filteredHistory.slice(-options.limit);
    }

    return filteredHistory;
  }

  // Private method to set up default event listeners
  private setupEventListeners(): void {
    // Sync event listeners
    this.on(IntegrationEventType.SYNC_STARTED, this.handleSyncStarted);
    this.on(IntegrationEventType.SYNC_COMPLETED, this.handleSyncCompleted);
    this.on(IntegrationEventType.SYNC_FAILED, this.handleSyncFailed);

    // Authentication event listeners
    this.on(IntegrationEventType.AUTH_STARTED, this.handleAuthStarted);
    this.on(IntegrationEventType.AUTH_COMPLETED, this.handleAuthCompleted);
    this.on(IntegrationEventType.AUTH_FAILED, this.handleAuthFailed);
  }

  // Event handling methods
  private handleSyncStarted(event: IntegrationEvent): void {
    this.logger.info(`Sync started for ${event.platform}`, { event });
  }

  private handleSyncCompleted(event: IntegrationEvent): void {
    const syncStatus = event.details as SyncStatus;
    this.logger.info(`Sync completed for ${event.platform}`, { 
      platform: event.platform,
      recordsSynced: syncStatus.recordsSynced,
      duration: syncStatus.endTime ? syncStatus.endTime - syncStatus.startTime : 0
    });
  }

  private handleSyncFailed(event: IntegrationEvent): void {
    this.logger.error(`Sync failed for ${event.platform}`, { 
      platform: event.platform,
      errors: event.details 
    });
  }

  private handleAuthStarted(event: IntegrationEvent): void {
    this.logger.info(`Authentication started for ${event.platform}`, { event });
  }

  private handleAuthCompleted(event: IntegrationEvent): void {
    this.logger.info(`Authentication completed for ${event.platform}`, { event });
  }

  private handleAuthFailed(event: IntegrationEvent): void {
    this.logger.error(`Authentication failed for ${event.platform}`, { 
      platform: event.platform,
      errors: event.details 
    });
  }

  // Private method to log events
  private logEvent(event: IntegrationEvent): void {
    switch (event.type) {
      case IntegrationEventType.SYNC_STARTED:
      case IntegrationEventType.AUTH_STARTED:
        this.logger.info(`Event: ${event.type}`, { event });
        break;
      case IntegrationEventType.SYNC_COMPLETED:
      case IntegrationEventType.AUTH_COMPLETED:
        this.logger.info(`Event: ${event.type}`, { event });
        break;
      case IntegrationEventType.SYNC_FAILED:
      case IntegrationEventType.AUTH_FAILED:
        this.logger.error(`Event: ${event.type}`, { event });
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`, { event });
    }
  }
}

// Singleton instance for global access
export const integrationEventService = IntegrationEventService.getInstance();