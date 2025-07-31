import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ScanSession, DefectDetection, PhotoMetadata } from './ar3dScanningService';
import type { DetectionResult, AIModelInfo } from './aiDefectDetectionService';
import type { DefectPin, DefectTimeline, AnalyticsData } from './visualDefectMappingService';

// Enhanced Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'manager' | 'inspector' | 'field_worker';
          organization_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      scan_sessions: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          name: string;
          quality: 'low' | 'medium' | 'high' | 'ultra';
          status: 'active' | 'processing' | 'completed' | 'failed';
          start_time: string;
          end_time: string | null;
          estimated_area: number;
          estimated_volume: number | null;
          photo_count: number;
          scan_points_count: number;
          bounding_box: Record<string, any>;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scan_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['scan_sessions']['Insert']>;
      };
      scan_photos: {
        Row: {
          id: string;
          scan_session_id: string;
          file_path: string;
          storage_path: string;
          position: Record<string, any>;
          orientation: Record<string, any>;
          quality: number;
          resolution: Record<string, any>;
          metadata: Record<string, any>;
          processed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scan_photos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['scan_photos']['Insert']>;
      };
      defect_detections: {
        Row: {
          id: string;
          scan_session_id: string;
          photo_id: string;
          ai_model_id: string;
          defect_type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          confidence: number;
          bounding_box: Record<string, any>;
          dimensions: Record<string, any>;
          location: Record<string, any>;
          processing_time: number;
          verified: boolean;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['defect_detections']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['defect_detections']['Insert']>;
      };
      defect_pins: {
        Row: {
          id: string;
          defect_detection_id: string;
          organization_id: string;
          position: Record<string, any>;
          status: 'new' | 'inspected' | 'scheduled' | 'in_progress' | 'completed' | 'verified';
          assigned_to: string | null;
          estimated_repair_cost: number | null;
          urgency_score: number;
          notes: string;
          photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['defect_pins']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['defect_pins']['Insert']>;
      };
      defect_timelines: {
        Row: {
          id: string;
          defect_detection_id: string;
          event_type: string;
          description: string;
          photo_path: string | null;
          severity: string | null;
          confidence: number | null;
          performed_by: string | null;
          notes: string | null;
          location: Record<string, any>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['defect_timelines']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['defect_timelines']['Insert']>;
      };
      ai_models: {
        Row: {
          id: string;
          name: string;
          version: string;
          type: string;
          platform: string;
          size: number;
          accuracy: number;
          inference_time: number;
          supported_defects: string[];
          optimized: boolean;
          quantized: boolean;
          storage_path: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_models']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ai_models']['Insert']>;
      };
      model_3d: {
        Row: {
          id: string;
          scan_session_id: string;
          format: 'obj' | 'ply' | 'stl';
          file_size: number;
          storage_path: string;
          vertex_count: number;
          face_count: number;
          optimized: boolean;
          compression_ratio: number | null;
          generated_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['model_3d']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['model_3d']['Insert']>;
      };
    };
    Views: {
      defect_analytics: {
        Row: {
          organization_id: string;
          total_defects: number;
          defects_by_type: Record<string, number>;
          defects_by_severity: Record<string, number>;
          average_confidence: number;
          repair_progress: Record<string, number>;
          cost_analysis: Record<string, any>;
        };
      };
    };
    Functions: {
      process_ai_detection: {
        Args: {
          detection_data: Record<string, any>;
          model_id: string;
        };
        Returns: string;
      };
      generate_predictive_analytics: {
        Args: {
          organization_id: string;
          timeframe: string;
        };
        Returns: Record<string, any>;
      };
      optimize_3d_model: {
        Args: {
          model_id: string;
          optimization_level: string;
        };
        Returns: Record<string, any>;
      };
    };
  };
}

// AI Processing Queue Types
export interface AIProcessingJob {
  id: string;
  type: 'defect_detection' | 'predictive_analysis' | '3d_reconstruction' | 'model_optimization';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  input_data: Record<string, any>;
  result_data: Record<string, any> | null;
  error_message: string | null;
  processing_time: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface SyncResult {
  success: boolean;
  synced_items: number;
  failed_items: number;
  errors: string[];
  total_time: number;
}

export interface StorageConfig {
  bucket: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

class EnhancedSupabaseIntegration {
  private supabase: SupabaseClient<Database>;
  private currentUser: any = null;
  private storageConfig: StorageConfig;
  private syncQueue: Array<{ type: string; data: any; retries: number }> = [];
  private isOnline = true;
  private processingJobs: Map<string, AIProcessingJob> = new Map();

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and anonymous key must be provided');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);

    this.storageConfig = {
      bucket: 'pavement-data',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'model/obj',
        'application/octet-stream',
        'text/plain'
      ],
      compressionEnabled: true,
      encryptionEnabled: true,
    };

    this.initializeRealTimeSubscriptions();
    this.monitorNetworkStatus();
  }

  // Authentication & User Management

  public async signIn(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    this.currentUser = data.user;
    return data;
  }

  public async signUp(email: string, password: string, metadata: any): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return data;
  }

  public async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.currentUser = null;
  }

  public async getCurrentUser(): Promise<any> {
    if (this.currentUser) return this.currentUser;

    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;

    this.currentUser = user;
    return user;
  }

  // 3D Scan Session Management

  public async createScanSession(session: ScanSession): Promise<string> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('scan_sessions')
      .insert({
        user_id: user.id,
        organization_id: user.user_metadata?.organization_id,
        name: session.name,
        quality: session.quality,
        status: session.status,
        start_time: new Date(session.startTime).toISOString(),
        end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
        estimated_area: session.estimatedArea,
        estimated_volume: session.estimatedVolume || null,
        photo_count: session.photos.length,
        scan_points_count: session.scanPoints.length,
        bounding_box: session.boundingBox,
        metadata: {
          scanPoints: session.scanPoints,
          arCapabilities: true,
        },
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  public async updateScanSession(sessionId: string, updates: Partial<ScanSession>): Promise<void> {
    const updateData: any = {};

    if (updates.status) updateData.status = updates.status;
    if (updates.endTime) updateData.end_time = new Date(updates.endTime).toISOString();
    if (updates.estimatedArea) updateData.estimated_area = updates.estimatedArea;
    if (updates.estimatedVolume) updateData.estimated_volume = updates.estimatedVolume;
    if (updates.photos) updateData.photo_count = updates.photos.length;
    if (updates.scanPoints) {
      updateData.scan_points_count = updates.scanPoints.length;
      updateData.metadata = { scanPoints: updates.scanPoints };
    }

    const { error } = await this.supabase
      .from('scan_sessions')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Photo Management with Advanced Storage

  public async uploadScanPhoto(photoMetadata: PhotoMetadata, scanSessionId: string): Promise<string> {
    try {
      // Generate unique storage path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const storagePath = `scan-sessions/${scanSessionId}/photos/${timestamp}-${photoMetadata.id}.jpg`;

      // Upload photo to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.storageConfig.bucket)
        .upload(storagePath, photoMetadata.path, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Store photo metadata in database
      const { data, error } = await this.supabase
        .from('scan_photos')
        .insert({
          scan_session_id: scanSessionId,
          file_path: photoMetadata.path,
          storage_path: storagePath,
          position: photoMetadata.position,
          orientation: photoMetadata.orientation,
          quality: photoMetadata.quality,
          resolution: photoMetadata.resolution,
          metadata: {
            timestamp: photoMetadata.timestamp,
            originalId: photoMetadata.id,
          },
          processed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;

    } catch (error) {
      console.error('Failed to upload scan photo:', error);
      
      // Add to sync queue for retry
      this.syncQueue.push({
        type: 'upload_photo',
        data: { photoMetadata, scanSessionId },
        retries: 0,
      });

      throw error;
    }
  }

  // AI Detection Management

  public async storeDetectionResult(result: DetectionResult, scanSessionId: string): Promise<string[]> {
    const detectionIds: string[] = [];

    try {
      // Get current AI model info
      const { data: aiModel } = await this.supabase
        .from('ai_models')
        .select('id')
        .eq('name', result.modelUsed)
        .single();

      for (const defect of result.defects) {
        const { data, error } = await this.supabase
          .from('defect_detections')
          .insert({
            scan_session_id: scanSessionId,
            photo_id: defect.photoId || '',
            ai_model_id: aiModel?.id || '',
            defect_type: defect.type,
            severity: defect.severity,
            confidence: defect.confidence,
            bounding_box: defect.boundingBox,
            dimensions: defect.dimensions,
            location: defect.location,
            processing_time: result.processingTime,
            verified: false,
          })
          .select()
          .single();

        if (error) throw error;
        detectionIds.push(data.id);
      }

      return detectionIds;

    } catch (error) {
      console.error('Failed to store detection result:', error);
      
      // Add to sync queue for retry
      this.syncQueue.push({
        type: 'store_detection',
        data: { result, scanSessionId },
        retries: 0,
      });

      throw error;
    }
  }

  // AI Processing Queue Management

  public async queueAIProcessing(job: Omit<AIProcessingJob, 'id' | 'status' | 'created_at'>): Promise<string> {
    const jobData: AIProcessingJob = {
      ...job,
      id: this.generateId(),
      status: 'queued',
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
    };

    this.processingJobs.set(jobData.id, jobData);

    // Process immediately if resources available
    setTimeout(() => this.processAIJob(jobData.id), 100);

    return jobData.id;
  }

  private async processAIJob(jobId: string): Promise<void> {
    const job = this.processingJobs.get(jobId);
    if (!job || job.status !== 'queued') return;

    try {
      job.status = 'processing';
      job.started_at = new Date().toISOString();

      let result: any;

      switch (job.type) {
        case 'defect_detection':
          result = await this.processDefectDetection(job.input_data);
          break;
        case 'predictive_analysis':
          result = await this.processPredictiveAnalysis(job.input_data);
          break;
        case '3d_reconstruction':
          result = await this.process3DReconstruction(job.input_data);
          break;
        case 'model_optimization':
          result = await this.processModelOptimization(job.input_data);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      job.result_data = result;
      job.completed_at = new Date().toISOString();
      job.processing_time = new Date(job.completed_at).getTime() - new Date(job.started_at!).getTime();

    } catch (error) {
      job.status = 'failed';
      job.error_message = error instanceof Error ? error.message : 'Unknown error';
      job.completed_at = new Date().toISOString();
    }

    this.processingJobs.set(jobId, job);
  }

  private async processDefectDetection(inputData: any): Promise<any> {
    // Call Supabase AI function for advanced defect detection
    const { data, error } = await this.supabase.rpc('process_ai_detection', {
      detection_data: inputData,
      model_id: inputData.modelId,
    });

    if (error) throw error;
    return data;
  }

  private async processPredictiveAnalysis(inputData: any): Promise<any> {
    // Call Supabase AI function for predictive analytics
    const { data, error } = await this.supabase.rpc('generate_predictive_analytics', {
      organization_id: inputData.organizationId,
      timeframe: inputData.timeframe,
    });

    if (error) throw error;
    return data;
  }

  private async process3DReconstruction(inputData: any): Promise<any> {
    // Process 3D reconstruction using cloud resources
    // This would integrate with advanced 3D processing services
    return {
      status: 'completed',
      modelPath: '/3d-models/reconstructed-model.obj',
      vertexCount: inputData.estimatedVertices || 10000,
      compressionRatio: 0.8,
    };
  }

  private async processModelOptimization(inputData: any): Promise<any> {
    // Call Supabase function for 3D model optimization
    const { data, error } = await this.supabase.rpc('optimize_3d_model', {
      model_id: inputData.modelId,
      optimization_level: inputData.level,
    });

    if (error) throw error;
    return data;
  }

  // 3D Model Storage and Management

  public async store3DModel(
    scanSessionId: string,
    modelData: string,
    format: 'obj' | 'ply' | 'stl',
    metadata: any
  ): Promise<string> {
    try {
      // Upload model file to storage
      const storagePath = `3d-models/${scanSessionId}/model.${format}`;
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.storageConfig.bucket)
        .upload(storagePath, modelData, {
          contentType: format === 'obj' ? 'model/obj' : 'application/octet-stream',
        });

      if (uploadError) throw uploadError;

      // Store model metadata
      const { data, error } = await this.supabase
        .from('model_3d')
        .insert({
          scan_session_id: scanSessionId,
          format,
          file_size: modelData.length,
          storage_path: storagePath,
          vertex_count: metadata.vertexCount || 0,
          face_count: metadata.faceCount || 0,
          optimized: metadata.optimized || false,
          compression_ratio: metadata.compressionRatio || null,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;

    } catch (error) {
      console.error('Failed to store 3D model:', error);
      throw error;
    }
  }

  // Visual Mapping Integration

  public async syncDefectPins(pins: DefectPin[]): Promise<SyncResult> {
    const startTime = Date.now();
    let syncedItems = 0;
    let failedItems = 0;
    const errors: string[] = [];

    try {
      const user = await this.getCurrentUser();

      for (const pin of pins) {
        try {
          const { error } = await this.supabase
            .from('defect_pins')
            .upsert({
              id: pin.id,
              defect_detection_id: pin.defectId,
              organization_id: user.user_metadata?.organization_id,
              position: pin.position,
              status: pin.status,
              assigned_to: pin.assignedTo || null,
              estimated_repair_cost: pin.estimatedRepairCost || null,
              urgency_score: pin.urgencyScore,
              notes: pin.notes,
              photos: pin.photos,
            }, {
              onConflict: 'id',
            });

          if (error) throw error;
          syncedItems++;

        } catch (error) {
          failedItems++;
          errors.push(`Failed to sync pin ${pin.id}: ${error}`);
        }
      }

      return {
        success: failedItems === 0,
        synced_items: syncedItems,
        failed_items: failedItems,
        errors,
        total_time: Date.now() - startTime,
      };

    } catch (error) {
      return {
        success: false,
        synced_items: syncedItems,
        failed_items: pins.length - syncedItems,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        total_time: Date.now() - startTime,
      };
    }
  }

  // Analytics and Reporting

  public async getAnalytics(organizationId: string): Promise<AnalyticsData> {
    const { data, error } = await this.supabase
      .from('defect_analytics')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;

    return {
      totalDefects: data.total_defects,
      defectsByType: data.defects_by_type,
      defectsBySeverity: data.defects_by_severity,
      averageConfidence: data.average_confidence,
      detectionTrends: [], // Would be populated from time-series data
      hotspots: [], // Would be calculated from clustering
      repairProgress: data.repair_progress,
      costAnalysis: data.cost_analysis,
    };
  }

  // Real-time Subscriptions

  private initializeRealTimeSubscriptions(): void {
    // Subscribe to defect detection updates
    this.supabase
      .channel('defect-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'defect_detections' },
        (payload) => this.handleDefectUpdate(payload)
      )
      .subscribe();

    // Subscribe to scan session updates
    this.supabase
      .channel('scan-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'scan_sessions' },
        (payload) => this.handleScanUpdate(payload)
      )
      .subscribe();
  }

  private handleDefectUpdate(payload: any): void {
    console.log('Defect update received:', payload);
    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('defect-updated', { detail: payload }));
  }

  private handleScanUpdate(payload: any): void {
    console.log('Scan session update received:', payload);
    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('scan-updated', { detail: payload }));
  }

  // Offline Sync Management

  private monitorNetworkStatus(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        switch (item.type) {
          case 'upload_photo':
            await this.uploadScanPhoto(item.data.photoMetadata, item.data.scanSessionId);
            break;
          case 'store_detection':
            await this.storeDetectionResult(item.data.result, item.data.scanSessionId);
            break;
          default:
            console.warn('Unknown sync item type:', item.type);
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
        
        // Retry with exponential backoff
        if (item.retries < 3) {
          item.retries++;
          setTimeout(() => {
            this.syncQueue.push(item);
          }, Math.pow(2, item.retries) * 1000);
        }
      }
    }
  }

  // Utility Methods

  public getStorageUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.storageConfig.bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  public async getJobStatus(jobId: string): Promise<AIProcessingJob | null> {
    return this.processingJobs.get(jobId) || null;
  }

  public getSyncQueueSize(): number {
    return this.syncQueue.length;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Export singleton instance
export const enhancedSupabaseIntegration = new EnhancedSupabaseIntegration();
export default enhancedSupabaseIntegration;