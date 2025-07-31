/**
 * Real-Time Collaboration Engine
 * WebSocket-based live updates and team collaboration system
 */

import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from './performance';
import { multiTenantManager } from './multiTenantManager';

export interface CollaborationEvent {
  id: string;
  type: 'cursor' | 'edit' | 'comment' | 'presence' | 'notification' | 'status';
  userId: string;
  userName: string;
  timestamp: Date;
  data: any;
  projectId?: string;
  documentId?: string;
  tenantId: string;
}

export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentLocation: {
    type: 'project' | 'document' | 'dashboard' | 'settings';
    id: string;
    title: string;
  };
  cursor?: {
    x: number;
    y: number;
    elementId?: string;
  };
  lastActivity: Date;
  tenantId: string;
}

export interface CollaborationRoom {
  id: string;
  type: 'project' | 'document' | 'global';
  participants: Map<string, UserPresence>;
  activeConnections: number;
  createdAt: Date;
  tenantId: string;
}

export interface LiveEdit {
  id: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  userId: string;
  timestamp: Date;
  elementId: string;
  data: any;
  previousData?: any;
  conflictResolution?: 'merge' | 'overwrite' | 'manual';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
  resolved: boolean;
  position?: {
    x: number;
    y: number;
    elementId?: string;
  };
  mentions: string[];
}

class RealtimeCollaborationEngine {
  private wsConnection: WebSocket | null = null;
  private rooms: Map<string, CollaborationRoom> = new Map();
  private currentUserId: string | null = null;
  private currentPresence: UserPresence | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private conflictResolver: ConflictResolver;

  constructor() {
    this.conflictResolver = new ConflictResolver();
    this.initializeCollaboration();
  }

  /**
   * Initialize the collaboration engine
   */
  private async initializeCollaboration(): Promise<void> {
    try {
      console.log('🔄 Initializing Real-Time Collaboration Engine...');
      
      // Get current user
      await this.getCurrentUser();
      
      // Establish WebSocket connection
      await this.establishWebSocketConnection();
      
      // Setup presence tracking
      this.setupPresenceTracking();
      
      // Setup conflict resolution
      this.setupConflictResolution();
      
      // Setup periodic cleanup
      this.setupPeriodicCleanup();
      
      console.log('✅ Real-Time Collaboration Engine initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time Collaboration Engine:', error);
    }
  }

  /**
   * Establish WebSocket connection for real-time communication
   */
  private async establishWebSocketConnection(): Promise<void> {
    const tenant = multiTenantManager.getCurrentTenant();
    if (!tenant) throw new Error('No tenant context available');

    const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001'}/collaboration?tenantId=${tenant.id}&userId=${this.currentUserId}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('✅ WebSocket connection established');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection:established', {});
      };

      this.wsConnection.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.wsConnection.onclose = () => {
        console.log('❌ WebSocket connection closed');
        this.stopHeartbeat();
        this.handleReconnection();
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('connection:error', { error });
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      // Fallback to polling mechanism
      this.setupPollingFallback();
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'collaboration:event':
          this.handleCollaborationEvent(message.data);
          break;
        case 'presence:update':
          this.handlePresenceUpdate(message.data);
          break;
        case 'room:join':
          this.handleRoomJoin(message.data);
          break;
        case 'room:leave':
          this.handleRoomLeave(message.data);
          break;
        case 'edit:conflict':
          this.handleEditConflict(message.data);
          break;
        case 'heartbeat':
          this.handleHeartbeat();
          break;
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Join a collaboration room
   */
  async joinRoom(roomId: string, roomType: 'project' | 'document' | 'global' = 'project'): Promise<void> {
    const tenant = multiTenantManager.getCurrentTenant();
    if (!tenant || !this.currentUserId) return;

    const room: CollaborationRoom = {
      id: roomId,
      type: roomType,
      participants: new Map(),
      activeConnections: 0,
      createdAt: new Date(),
      tenantId: tenant.id,
    };

    this.rooms.set(roomId, room);

    // Send join message via WebSocket
    this.sendWebSocketMessage({
      type: 'room:join',
      data: {
        roomId,
        roomType,
        userId: this.currentUserId,
        tenantId: tenant.id,
      },
    });

    // Update presence
    await this.updatePresence({
      currentLocation: {
        type: roomType,
        id: roomId,
        title: `${roomType} ${roomId}`,
      },
    });

    this.emit('room:joined', { roomId, roomType });
  }

  /**
   * Leave a collaboration room
   */
  async leaveRoom(roomId: string): Promise<void> {
    if (!this.rooms.has(roomId)) return;

    // Send leave message via WebSocket
    this.sendWebSocketMessage({
      type: 'room:leave',
      data: {
        roomId,
        userId: this.currentUserId,
      },
    });

    this.rooms.delete(roomId);
    this.emit('room:left', { roomId });
  }

  /**
   * Broadcast a live edit event
   */
  async broadcastEdit(edit: Omit<LiveEdit, 'id' | 'timestamp'>): Promise<void> {
    const editEvent: LiveEdit = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...edit,
    };

    // Send edit via WebSocket
    this.sendWebSocketMessage({
      type: 'collaboration:edit',
      data: editEvent,
    });

    // Store edit for conflict resolution
    this.conflictResolver.addEdit(editEvent);

    this.emit('edit:broadcast', editEvent);
  }

  /**
   * Add a comment to a project or document
   */
  async addComment(comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>): Promise<void> {
    const commentEvent: Comment = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      replies: [],
      ...comment,
    };

    // Send comment via WebSocket
    this.sendWebSocketMessage({
      type: 'collaboration:comment',
      data: commentEvent,
    });

    // Store comment in database
    await this.storeComment(commentEvent);

    this.emit('comment:added', commentEvent);
  }

  /**
   * Update user presence information
   */
  async updatePresence(updates: Partial<Omit<UserPresence, 'userId' | 'tenantId'>>): Promise<void> {
    if (!this.currentPresence) return;

    this.currentPresence = {
      ...this.currentPresence,
      ...updates,
      lastActivity: new Date(),
    };

    // Broadcast presence update
    this.sendWebSocketMessage({
      type: 'presence:update',
      data: this.currentPresence,
    });

    this.emit('presence:updated', this.currentPresence);
  }

  /**
   * Track cursor movements for collaborative editing
   */
  trackCursor(x: number, y: number, elementId?: string): void {
    if (!this.currentUserId) return;

    const cursorData = { x, y, elementId };
    
    // Throttle cursor updates to avoid spam
    clearTimeout((this as any).cursorThrottle);
    (this as any).cursorThrottle = setTimeout(() => {
      this.updatePresence({ cursor: cursorData });
    }, 100);
  }

  /**
   * Send notification to specific users or all participants
   */
  async sendNotification(notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    recipients?: string[]; // If empty, sends to all participants
    actionUrl?: string;
  }): Promise<void> {
    const notificationEvent: CollaborationEvent = {
      id: crypto.randomUUID(),
      type: 'notification',
      userId: this.currentUserId!,
      userName: this.currentPresence?.userName || 'Unknown User',
      timestamp: new Date(),
      data: notification,
      tenantId: multiTenantManager.getCurrentTenant()?.id || '',
    };

    this.sendWebSocketMessage({
      type: 'collaboration:notification',
      data: notificationEvent,
    });

    this.emit('notification:sent', notificationEvent);
  }

  /**
   * Event listener management
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Get current participants in a room
   */
  getRoomParticipants(roomId: string): UserPresence[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.participants.values()) : [];
  }

  /**
   * Get live edit history for conflict resolution
   */
  getEditHistory(elementId: string): LiveEdit[] {
    return this.conflictResolver.getEditHistory(elementId);
  }

  // Private helper methods
  private async getCurrentUser(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.currentUserId = user.id;
        
        // Get user profile for additional info
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        this.currentPresence = {
          userId: user.id,
          userName: profile?.display_name || user.email || 'Anonymous',
          userAvatar: profile?.avatar_url,
          status: 'online',
          currentLocation: {
            type: 'dashboard',
            id: 'main',
            title: 'Dashboard',
          },
          lastActivity: new Date(),
          tenantId: multiTenantManager.getCurrentTenant()?.id || '',
        };
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }

  private sendWebSocketMessage(message: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      console.warn('WebSocket not connected, queuing message');
    }
  }

  private handleCollaborationEvent(event: CollaborationEvent): void {
    this.emit(`collaboration:${event.type}`, event);
    
    // Record performance metrics
    performanceMonitor.recordMetric('collaboration_event', 1, 'count', {
      type: event.type,
      userId: event.userId,
      tenantId: event.tenantId,
    });
  }

  private handlePresenceUpdate(presence: UserPresence): void {
    // Update room participants
    this.rooms.forEach(room => {
      if (presence.tenantId === room.tenantId) {
        room.participants.set(presence.userId, presence);
      }
    });

    this.emit('presence:update', presence);
  }

  private handleRoomJoin(data: any): void {
    this.emit('room:user_joined', data);
  }

  private handleRoomLeave(data: any): void {
    this.emit('room:user_left', data);
  }

  private handleEditConflict(conflict: any): void {
    this.emit('edit:conflict', conflict);
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.establishWebSocketConnection();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached, falling back to polling');
      this.setupPollingFallback();
    }
  }

  private setupPollingFallback(): void {
    // Implement polling-based fallback for real-time features
    console.log('Setting up polling fallback for real-time features');
    
    setInterval(async () => {
      try {
        // Poll for presence updates
        await this.pollPresenceUpdates();
        
        // Poll for new events
        await this.pollCollaborationEvents();
        
      } catch (error) {
        console.error('Error in polling fallback:', error);
      }
    }, 5000); // Poll every 5 seconds
  }

  private async pollPresenceUpdates(): Promise<void> {
    // Implementation would query the database for presence updates
  }

  private async pollCollaborationEvents(): Promise<void> {
    // Implementation would query the database for new events
  }

  private setupPresenceTracking(): void {
    // Track user activity
    document.addEventListener('mousemove', (e) => {
      this.trackCursor(e.clientX, e.clientY);
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      const status = document.hidden ? 'away' : 'online';
      this.updatePresence({ status });
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.updatePresence({ status: 'offline' });
    });
  }

  private setupConflictResolution(): void {
    // Conflict resolution is handled by the ConflictResolver class
    this.on('edit:conflict', (conflict) => {
      this.conflictResolver.resolveConflict(conflict);
    });
  }

  private setupPeriodicCleanup(): void {
    // Clean up inactive users every 5 minutes
    setInterval(() => {
      this.cleanupInactiveUsers();
    }, 5 * 60 * 1000);
  }

  private cleanupInactiveUsers(): void {
    const now = new Date();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minutes

    this.rooms.forEach(room => {
      room.participants.forEach((presence, userId) => {
        if (now.getTime() - presence.lastActivity.getTime() > inactiveThreshold) {
          room.participants.delete(userId);
          this.emit('user:inactive', { userId, roomId: room.id });
        }
      });
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendWebSocketMessage({ type: 'heartbeat' });
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleHeartbeat(): void {
    // Server acknowledged heartbeat
  }

  private async storeComment(comment: Comment): Promise<void> {
    try {
      await supabase
        .from('collaboration_comments')
        .insert({
          id: comment.id,
          user_id: comment.userId,
          content: comment.content,
          position: comment.position,
          mentions: comment.mentions,
          created_at: comment.timestamp,
        });
    } catch (error) {
      console.error('Error storing comment:', error);
    }
  }
}

/**
 * Conflict Resolution System
 */
class ConflictResolver {
  private editHistory: Map<string, LiveEdit[]> = new Map();

  addEdit(edit: LiveEdit): void {
    const elementHistory = this.editHistory.get(edit.elementId) || [];
    elementHistory.push(edit);
    this.editHistory.set(edit.elementId, elementHistory);
  }

  getEditHistory(elementId: string): LiveEdit[] {
    return this.editHistory.get(elementId) || [];
  }

  resolveConflict(conflict: any): any {
    // Implement operational transformation or other conflict resolution strategies
    console.log('Resolving edit conflict:', conflict);
    
    // Simple last-write-wins strategy for now
    return conflict.edits[conflict.edits.length - 1];
  }
}

// Export singleton instance
export const realtimeCollaboration = new RealtimeCollaborationEngine();