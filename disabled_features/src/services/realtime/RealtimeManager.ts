/**
 * Advanced Real-Time Manager
 * Implements high-performance real-time communication with event streaming,
 * conflict resolution, and intelligent connection management
 */

import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from '@/lib/performance';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface RealtimeEvent {
  id: string;
  type: string;
  table: string;
  payload: any;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ConnectionConfig {
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  bufferSize: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

interface SubscriptionOptions {
  table: string;
  schema?: string;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'manual';
}

interface ConflictResolutionStrategy {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolver?: (clientData: any, serverData: any) => any;
}

export class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventBuffer: Map<string, RealtimeEvent[]> = new Map();
  private connectionConfig: ConnectionConfig;
  private connectionState: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected';
  private reconnectAttempts: number = 0;
  private listeners: Map<string, Set<Function>> = new Map();
  private conflictResolvers: Map<string, ConflictResolutionStrategy> = new Map();
  private lastHeartbeat: number = 0;
  private heartbeatTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;

  private constructor() {
    this.connectionConfig = {
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      bufferSize: 1000,
      priority: 'normal'
    };

    this.initializeConnection();
    this.startHeartbeat();
  }

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Initialize the real-time connection with optimized settings
   */
  private initializeConnection(): void {
    const startTime = performance.now();
    
    try {
      this.connectionState = 'connecting';
      
      // Set up connection event listeners
      supabase.realtime.onOpen(() => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.emitEvent('connection:open', { timestamp: Date.now() });
        
        performanceMonitor.recordMetric('realtime_connection_established', performance.now() - startTime, 'ms');
        console.log('📡 Real-time connection established');
      });

      supabase.realtime.onClose(() => {
        this.connectionState = 'disconnected';
        this.emitEvent('connection:close', { timestamp: Date.now() });
        
        if (this.connectionConfig.autoReconnect) {
          this.scheduleReconnection();
        }
        
        console.log('📡 Real-time connection closed');
      });

      supabase.realtime.onError((error) => {
        this.connectionState = 'error';
        this.emitEvent('connection:error', { error, timestamp: Date.now() });
        
        console.error('📡 Real-time connection error:', error);
        
        if (this.connectionConfig.autoReconnect) {
          this.scheduleReconnection();
        }
      });

    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
      this.connectionState = 'error';
    }
  }

  /**
   * Subscribe to real-time updates for a specific table
   */
  public subscribe(channelId: string, options: SubscriptionOptions): RealtimeChannel {
    const startTime = performance.now();

    try {
      // Remove existing channel if it exists
      this.unsubscribe(channelId);

      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: options.schema || 'public',
            table: options.table,
            filter: options.filter
          },
          (payload) => this.handleTableChange(channelId, payload, options)
        )
        .subscribe((status) => {
          console.log(`📡 Channel ${channelId} subscription status:`, status);
          
          if (status === 'SUBSCRIBED') {
            performanceMonitor.recordMetric('realtime_subscription_success', performance.now() - startTime, 'ms', {
              channelId,
              table: options.table
            });
          }
        });

      this.channels.set(channelId, channel);

      // Initialize event buffer for this channel
      if (!this.eventBuffer.has(channelId)) {
        this.eventBuffer.set(channelId, []);
      }

      return channel;
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced table change handler with conflict resolution
   */
  private handleTableChange(
    channelId: string,
    payload: RealtimePostgresChangesPayload<any>,
    options: SubscriptionOptions
  ): void {
    const event: RealtimeEvent = {
      id: crypto.randomUUID(),
      type: payload.eventType,
      table: payload.table,
      payload: payload,
      timestamp: Date.now(),
      metadata: {
        channelId,
        schema: payload.schema
      }
    };

    // Add to event buffer
    this.addToBuffer(channelId, event);

    // Handle conflict resolution if needed
    if (options.conflictResolution && payload.eventType === 'UPDATE') {
      this.handleConflictResolution(channelId, payload, options.conflictResolution);
    }

    // Call appropriate handler
    switch (payload.eventType) {
      case 'INSERT':
        options.onInsert?.(payload);
        break;
      case 'UPDATE':
        options.onUpdate?.(payload);
        break;
      case 'DELETE':
        options.onDelete?.(payload);
        break;
    }

    // Emit to listeners
    this.emitEvent(`table:${payload.table}:${payload.eventType}`, payload);
    this.emitEvent(`channel:${channelId}`, event);

    // Performance tracking
    performanceMonitor.recordMetric('realtime_event_processed', performance.now(), 'ms', {
      eventType: payload.eventType,
      table: payload.table,
      channelId
    });
  }

  /**
   * Advanced conflict resolution for simultaneous updates
   */
  private handleConflictResolution(
    channelId: string,
    payload: RealtimePostgresChangesPayload<any>,
    strategy: string
  ): void {
    const resolver = this.conflictResolvers.get(channelId);
    
    if (!resolver) return;

    try {
      switch (strategy) {
        case 'client-wins':
          // Client data takes precedence - no action needed
          break;
        
        case 'server-wins':
          // Server data takes precedence - update local state
          this.emitEvent(`conflict:server-wins:${channelId}`, {
            serverData: payload.new,
            table: payload.table
          });
          break;
        
        case 'merge':
          // Intelligent merge of client and server data
          if (resolver.resolver) {
            const mergedData = resolver.resolver(payload.old, payload.new);
            this.emitEvent(`conflict:merged:${channelId}`, {
              mergedData,
              table: payload.table
            });
          }
          break;
        
        case 'manual':
          // Present conflict to user for manual resolution
          this.emitEvent(`conflict:manual:${channelId}`, {
            clientData: payload.old,
            serverData: payload.new,
            table: payload.table
          });
          break;
      }
    } catch (error) {
      console.error('Conflict resolution failed:', error);
    }
  }

  /**
   * Unsubscribe from a real-time channel
   */
  public unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
      this.eventBuffer.delete(channelId);
      
      console.log(`📡 Unsubscribed from channel: ${channelId}`);
    }
  }

  /**
   * Add event listener
   */
  public on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  public off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Add event to buffer with size management
   */
  private addToBuffer(channelId: string, event: RealtimeEvent): void {
    const buffer = this.eventBuffer.get(channelId) || [];
    buffer.push(event);

    // Maintain buffer size
    if (buffer.length > this.connectionConfig.bufferSize) {
      buffer.shift(); // Remove oldest event
    }

    this.eventBuffer.set(channelId, buffer);
  }

  /**
   * Get buffered events for a channel
   */
  public getBufferedEvents(channelId: string, since?: number): RealtimeEvent[] {
    const buffer = this.eventBuffer.get(channelId) || [];
    
    if (since) {
      return buffer.filter(event => event.timestamp > since);
    }
    
    return [...buffer];
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === 'connected') {
        this.lastHeartbeat = Date.now();
        this.emitEvent('heartbeat', { timestamp: this.lastHeartbeat });
      }
    }, this.connectionConfig.heartbeatInterval);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnection(): void {
    if (this.reconnectAttempts >= this.connectionConfig.maxReconnectAttempts) {
      console.error('📡 Max reconnection attempts reached');
      this.emitEvent('connection:max-attempts-reached', {
        attempts: this.reconnectAttempts
      });
      return;
    }

    this.reconnectAttempts++;
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`📡 Attempting reconnection ${this.reconnectAttempts}/${this.connectionConfig.maxReconnectAttempts}`);
      this.initializeConnection();
    }, this.connectionConfig.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * Set conflict resolution strategy for a channel
   */
  public setConflictResolution(channelId: string, strategy: ConflictResolutionStrategy): void {
    this.conflictResolvers.set(channelId, strategy);
  }

  /**
   * Get connection status and metrics
   */
  public getConnectionInfo(): {
    state: string;
    reconnectAttempts: number;
    lastHeartbeat: number;
    channels: string[];
    bufferedEvents: number;
  } {
    const totalBufferedEvents = Array.from(this.eventBuffer.values())
      .reduce((total, buffer) => total + buffer.length, 0);

    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      channels: Array.from(this.channels.keys()),
      bufferedEvents: totalBufferedEvents
    };
  }

  /**
   * Broadcast event to all connected clients
   */
  public broadcast(channelId: string, event: string, payload: any): void {
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event,
        payload: {
          ...payload,
          timestamp: Date.now(),
          senderId: supabase.auth.getUser()
        }
      });
      
      performanceMonitor.recordMetric('realtime_broadcast_sent', performance.now(), 'ms', {
        channelId,
        event
      });
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Unsubscribe from all channels
    this.channels.forEach((_, channelId) => {
      this.unsubscribe(channelId);
    });

    // Clear buffers and listeners
    this.eventBuffer.clear();
    this.listeners.clear();
    this.conflictResolvers.clear();

    console.log('📡 Real-time manager destroyed');
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();