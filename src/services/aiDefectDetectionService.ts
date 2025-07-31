import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { mobileService } from './mobileService';
import type { DefectDetection, PhotoMetadata } from './ar3dScanningService';

// Enhanced types for AI detection
export interface AIModelInfo {
  name: string;
  version: string;
  type: 'yolov5' | 'yolov8' | 'yolox' | 'efficientdet' | 'custom';
  platform: 'tensorflowjs' | 'onnx' | 'tflite' | 'coreml';
  size: number; // in bytes
  accuracy: number; // percentage
  inferenceTime: number; // milliseconds
  supportedDefects: DefectType[];
  optimized: boolean;
  quantized: boolean;
}

export interface DetectionResult {
  id: string;
  defects: DefectDetection[];
  processingTime: number;
  modelUsed: string;
  confidence: number;
  imageMetadata: {
    width: number;
    height: number;
    timestamp: number;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface AIProcessingOptions {
  confidenceThreshold: number;
  nmsThreshold: number; // Non-maximum suppression
  maxDetections: number;
  enablePreprocessing: boolean;
  enablePostprocessing: boolean;
  hybridProcessing: boolean; // Use cloud for complex analysis
  realTimeMode: boolean;
}

export type DefectType = 
  | 'transverse_crack' 
  | 'longitudinal_crack' 
  | 'block_crack' 
  | 'alligator_crack' 
  | 'pothole' 
  | 'edge_crack'
  | 'raveling'
  | 'patch'
  | 'bleeding'
  | 'polished_aggregate';

export interface ModelPerformanceMetrics {
  totalInferences: number;
  averageInferenceTime: number;
  accuracyRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  memoryUsage: number;
  batteryImpact: number;
  lastUpdated: number;
}

export interface DefectClassification {
  type: DefectType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dimensions: {
    length?: number;
    width?: number;
    depth?: number;
    area: number;
  };
  riskScore: number; // 0-100
  maintenancePriority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedCost: number;
}

class AIDefectDetectionService {
  private models: Map<string, AIModelInfo> = new Map();
  private activeModel: AIModelInfo | null = null;
  private detectionHistory: DetectionResult[] = [];
  private processingOptions: AIProcessingOptions;
  private performanceMetrics: ModelPerformanceMetrics;
  private isInitialized = false;
  private isProcessing = false;

  // TensorFlow.js related properties (would be imported in real implementation)
  private tfModel: any = null;
  private modelLoading = false;

  constructor() {
    this.processingOptions = {
      confidenceThreshold: 0.6,
      nmsThreshold: 0.4,
      maxDetections: 20,
      enablePreprocessing: true,
      enablePostprocessing: true,
      hybridProcessing: false,
      realTimeMode: true,
    };

    this.performanceMetrics = {
      totalInferences: 0,
      averageInferenceTime: 0,
      accuracyRate: 0,
      falsePositiveRate: 0,
      falseNegativeRate: 0,
      memoryUsage: 0,
      batteryImpact: 0,
      lastUpdated: Date.now(),
    };

    this.initializeAIModels();
  }

  private async initializeAIModels(): Promise<void> {
    try {
      console.log('🤖 Initializing AI Defect Detection Service...');

      // Register available models
      this.registerStandardModels();

      // Load the default model
      await this.loadDefaultModel();

      this.isInitialized = true;
      console.log('✅ AI Defect Detection Service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize AI models:', error);
      throw error;
    }
  }

  private registerStandardModels(): void {
    // YOLOv8 optimized for mobile
    this.models.set('yolov8n-pavement', {
      name: 'YOLOv8 Nano - Pavement Defects',
      version: '8.0.0',
      type: 'yolov8',
      platform: 'tensorflowjs',
      size: 6 * 1024 * 1024, // 6MB
      accuracy: 89.5,
      inferenceTime: 150,
      supportedDefects: [
        'transverse_crack',
        'longitudinal_crack',
        'block_crack',
        'alligator_crack',
        'pothole',
        'edge_crack'
      ],
      optimized: true,
      quantized: true,
    });

    // YOLOX for better accuracy
    this.models.set('yolox-s-pavement', {
      name: 'YOLOX Small - High Accuracy Pavement',
      version: '0.3.0',
      type: 'yolox',
      platform: 'tensorflowjs',
      size: 35 * 1024 * 1024, // 35MB
      accuracy: 93.2,
      inferenceTime: 300,
      supportedDefects: [
        'transverse_crack',
        'longitudinal_crack',
        'block_crack',
        'alligator_crack',
        'pothole',
        'edge_crack',
        'raveling',
        'patch',
        'bleeding'
      ],
      optimized: true,
      quantized: false,
    });

    // EfficientDet for mobile optimization
    this.models.set('efficientdet-d0-pavement', {
      name: 'EfficientDet D0 - Mobile Optimized',
      version: '1.0.0',
      type: 'efficientdet',
      platform: 'tensorflowjs',
      size: 15 * 1024 * 1024, // 15MB
      accuracy: 91.8,
      inferenceTime: 200,
      supportedDefects: [
        'transverse_crack',
        'longitudinal_crack',
        'pothole',
        'alligator_crack'
      ],
      optimized: true,
      quantized: true,
    });
  }

  private async loadDefaultModel(): Promise<void> {
    try {
      this.modelLoading = true;

      // Use the most balanced model for mobile
      const defaultModelId = 'yolov8n-pavement';
      const model = this.models.get(defaultModelId);

      if (!model) {
        throw new Error('Default model not found');
      }

      // In a real implementation, this would load the actual TensorFlow.js model
      // await tf.loadLayersModel('/assets/models/yolov8n-pavement/model.json');
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.activeModel = model;
      this.tfModel = { loaded: true, modelId: defaultModelId }; // Mock model

      console.log(`Loaded AI model: ${model.name}`);

    } catch (error) {
      console.error('Failed to load default model:', error);
      throw error;
    } finally {
      this.modelLoading = false;
    }
  }

  public async detectDefects(
    imagePath: string,
    photoMetadata?: PhotoMetadata
  ): Promise<DetectionResult | null> {
    if (!this.isInitialized || !this.activeModel) {
      throw new Error('AI service not initialized');
    }

    if (this.isProcessing) {
      console.warn('Detection already in progress');
      return null;
    }

    this.isProcessing = true;
    const startTime = performance.now();

    try {
      // Read image data
      const imageData = await this.loadImageForInference(imagePath);
      
      // Preprocess image
      const preprocessedImage = this.enablePreprocessing ? 
        await this.preprocessImage(imageData) : imageData;

      // Run inference
      const rawDetections = await this.runInference(preprocessedImage);

      // Post-process results
      const processedDetections = this.processingOptions.enablePostprocessing ?
        await this.postprocessDetections(rawDetections) : rawDetections;

      // Create detailed defect information
      const defects = await this.enrichDetections(processedDetections, photoMetadata);

      const processingTime = performance.now() - startTime;

      const result: DetectionResult = {
        id: this.generateId(),
        defects,
        processingTime,
        modelUsed: this.activeModel.name,
        confidence: this.calculateOverallConfidence(defects),
        imageMetadata: {
          width: imageData.width,
          height: imageData.height,
          timestamp: Date.now(),
          location: photoMetadata?.position,
        },
      };

      // Update metrics
      this.updatePerformanceMetrics(result);

      // Store in history
      this.detectionHistory.push(result);

      // Provide feedback
      await this.provideFeedback(defects);

      console.log(`Detected ${defects.length} defects in ${processingTime.toFixed(2)}ms`);
      return result;

    } catch (error) {
      console.error('Defect detection failed:', error);
      await Toast.show({
        text: 'Defect detection failed',
        duration: 'short',
      });
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  private async loadImageForInference(imagePath: string): Promise<any> {
    try {
      // In a real implementation, this would load and decode the image
      // For now, we'll simulate image loading
      return {
        data: new Float32Array(224 * 224 * 3), // Mock image tensor
        width: 224,
        height: 224,
        channels: 3,
      };
    } catch (error) {
      throw new Error(`Failed to load image: ${error}`);
    }
  }

  private async preprocessImage(imageData: any): Promise<any> {
    // Image preprocessing steps:
    // 1. Resize to model input size
    // 2. Normalize pixel values
    // 3. Convert to tensor format
    // 4. Apply data augmentation if needed

    try {
      // Simulate preprocessing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return {
        ...imageData,
        normalized: true,
        resized: true,
      };
    } catch (error) {
      throw new Error(`Preprocessing failed: ${error}`);
    }
  }

  private async runInference(imageData: any): Promise<any[]> {
    if (!this.tfModel) {
      throw new Error('Model not loaded');
    }

    try {
      // Simulate inference time based on model specifications
      const inferenceTime = this.activeModel?.inferenceTime || 200;
      await new Promise(resolve => setTimeout(resolve, inferenceTime));

      // Generate mock detections for demonstration
      return this.generateMockDetections();

    } catch (error) {
      throw new Error(`Inference failed: ${error}`);
    }
  }

  private generateMockDetections(): any[] {
    const numDetections = Math.floor(Math.random() * 5) + 1; // 1-5 detections
    const detections = [];

    const defectTypes: DefectType[] = [
      'transverse_crack',
      'longitudinal_crack',
      'pothole',
      'alligator_crack',
      'block_crack'
    ];

    for (let i = 0; i < numDetections; i++) {
      detections.push({
        type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
        confidence: 0.6 + Math.random() * 0.4, // 60-100%
        bbox: {
          x: Math.random() * 200,
          y: Math.random() * 200,
          width: 20 + Math.random() * 100,
          height: 20 + Math.random() * 100,
        },
        rawScore: 0.5 + Math.random() * 0.5,
      });
    }

    return detections;
  }

  private async postprocessDetections(rawDetections: any[]): Promise<any[]> {
    try {
      // Apply confidence threshold
      let filtered = rawDetections.filter(
        det => det.confidence >= this.processingOptions.confidenceThreshold
      );

      // Apply Non-Maximum Suppression (NMS)
      filtered = this.applyNMS(filtered);

      // Limit maximum detections
      if (filtered.length > this.processingOptions.maxDetections) {
        filtered = filtered
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, this.processingOptions.maxDetections);
      }

      return filtered;
    } catch (error) {
      console.error('Post-processing failed:', error);
      return rawDetections;
    }
  }

  private applyNMS(detections: any[]): any[] {
    // Simplified Non-Maximum Suppression
    const sorted = detections.sort((a, b) => b.confidence - a.confidence);
    const keep = [];

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      let shouldKeep = true;

      for (const kept of keep) {
        const iou = this.calculateIoU(current.bbox, kept.bbox);
        if (iou > this.processingOptions.nmsThreshold) {
          shouldKeep = false;
          break;
        }
      }

      if (shouldKeep) {
        keep.push(current);
      }
    }

    return keep;
  }

  private calculateIoU(box1: any, box2: any): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return intersection / union;
  }

  private async enrichDetections(
    rawDetections: any[],
    photoMetadata?: PhotoMetadata
  ): Promise<DefectDetection[]> {
    const enrichedDefects: DefectDetection[] = [];

    for (const detection of rawDetections) {
      const defect: DefectDetection = {
        id: this.generateId(),
        type: detection.type,
        severity: this.calculateSeverity(detection),
        confidence: detection.confidence,
        boundingBox: {
          x: detection.bbox.x,
          y: detection.bbox.y,
          width: detection.bbox.width,
          height: detection.bbox.height,
        },
        dimensions: {
          area: detection.bbox.width * detection.bbox.height,
          length: this.estimateLength(detection),
          width: this.estimateWidth(detection),
          depth: this.estimateDepth(detection),
        },
        location: photoMetadata?.position || { latitude: 0, longitude: 0 },
        timestamp: Date.now(),
        photoId: photoMetadata?.id || '',
        scanSessionId: '', // Will be set by the calling service
      };

      enrichedDefects.push(defect);
    }

    return enrichedDefects;
  }

  private calculateSeverity(detection: any): 'low' | 'medium' | 'high' | 'critical' {
    const area = detection.bbox.width * detection.bbox.height;
    const confidence = detection.confidence;

    // Combine area and confidence for severity assessment
    const severityScore = (area / 10000) * confidence; // Normalized area * confidence

    if (severityScore > 0.8) return 'critical';
    if (severityScore > 0.6) return 'high';
    if (severityScore > 0.4) return 'medium';
    return 'low';
  }

  private estimateLength(detection: any): number {
    // Estimate real-world length based on bounding box
    // This would require camera calibration in a real implementation
    return detection.bbox.width * 0.01; // Mock: 1 pixel = 1cm
  }

  private estimateWidth(detection: any): number {
    return detection.bbox.height * 0.01; // Mock: 1 pixel = 1cm
  }

  private estimateDepth(detection: any): number {
    // Depth estimation would require 3D analysis or stereo vision
    // For now, estimate based on defect type and severity
    switch (detection.type) {
      case 'pothole':
        return Math.random() * 50 + 10; // 10-60mm depth
      case 'alligator_crack':
        return Math.random() * 20 + 5; // 5-25mm depth
      default:
        return Math.random() * 10 + 1; // 1-11mm depth
    }
  }

  private calculateOverallConfidence(defects: DefectDetection[]): number {
    if (defects.length === 0) return 0;
    const sum = defects.reduce((acc, defect) => acc + defect.confidence, 0);
    return sum / defects.length;
  }

  private updatePerformanceMetrics(result: DetectionResult): void {
    this.performanceMetrics.totalInferences++;
    
    // Update average inference time
    const totalTime = this.performanceMetrics.averageInferenceTime * 
      (this.performanceMetrics.totalInferences - 1) + result.processingTime;
    this.performanceMetrics.averageInferenceTime = 
      totalTime / this.performanceMetrics.totalInferences;

    this.performanceMetrics.lastUpdated = Date.now();
  }

  private async provideFeedback(defects: DefectDetection[]): Promise<void> {
    if (defects.length === 0) {
      await Toast.show({
        text: 'No defects detected',
        duration: 'short',
      });
      return;
    }

    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    const highDefects = defects.filter(d => d.severity === 'high').length;

    let message = `Found ${defects.length} defect(s)`;
    let hapticStyle = ImpactStyle.Light;

    if (criticalDefects > 0) {
      message += ` (${criticalDefects} critical!)`;
      hapticStyle = ImpactStyle.Heavy;
    } else if (highDefects > 0) {
      message += ` (${highDefects} high priority)`;
      hapticStyle = ImpactStyle.Medium;
    }

    await Toast.show({
      text: message,
      duration: 'long',
    });

    await Haptics.impact({ style: hapticStyle });
  }

  // Public API methods

  public async switchModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    if (this.modelLoading) {
      throw new Error('Model loading in progress');
    }

    try {
      this.modelLoading = true;
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.activeModel = model;
      this.tfModel = { loaded: true, modelId };

      await Toast.show({
        text: `Switched to ${model.name}`,
        duration: 'short',
      });

    } finally {
      this.modelLoading = false;
    }
  }

  public updateProcessingOptions(options: Partial<AIProcessingOptions>): void {
    this.processingOptions = { ...this.processingOptions, ...options };
  }

  public getAvailableModels(): AIModelInfo[] {
    return Array.from(this.models.values());
  }

  public getActiveModel(): AIModelInfo | null {
    return this.activeModel;
  }

  public getDetectionHistory(): DetectionResult[] {
    return [...this.detectionHistory];
  }

  public getPerformanceMetrics(): ModelPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  public clearDetectionHistory(): void {
    this.detectionHistory = [];
  }

  public async exportDetections(format: 'json' | 'csv' = 'json'): Promise<string> {
    const data = format === 'json' ? 
      JSON.stringify(this.detectionHistory, null, 2) :
      this.convertToCSV(this.detectionHistory);

    const fileName = `defect_detections_${Date.now()}.${format}`;
    const result = await Filesystem.writeFile({
      path: fileName,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    return result.uri;
  }

  private convertToCSV(results: DetectionResult[]): string {
    const headers = [
      'Detection ID',
      'Timestamp',
      'Model Used',
      'Processing Time (ms)',
      'Defect Count',
      'Overall Confidence',
      'Defect Type',
      'Severity',
      'Confidence',
      'X',
      'Y',
      'Width',
      'Height',
      'Area',
      'Latitude',
      'Longitude'
    ];

    let csv = headers.join(',') + '\n';

    for (const result of results) {
      for (const defect of result.defects) {
        const row = [
          result.id,
          new Date(result.imageMetadata.timestamp).toISOString(),
          result.modelUsed,
          result.processingTime.toFixed(2),
          result.defects.length,
          result.confidence.toFixed(3),
          defect.type,
          defect.severity,
          defect.confidence.toFixed(3),
          defect.boundingBox.x.toFixed(1),
          defect.boundingBox.y.toFixed(1),
          defect.boundingBox.width.toFixed(1),
          defect.boundingBox.height.toFixed(1),
          defect.dimensions.area?.toFixed(1) || '',
          defect.location.latitude.toFixed(6),
          defect.location.longitude.toFixed(6)
        ];
        csv += row.join(',') + '\n';
      }
    }

    return csv;
  }

  public async calibrateModel(groundTruthData: any[]): Promise<void> {
    // Model calibration based on field validation
    console.log('Model calibration not implemented in demo version');
  }

  public isModelLoading(): boolean {
    return this.modelLoading;
  }

  public isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Export singleton instance
export const aiDefectDetectionService = new AIDefectDetectionService();
export default aiDefectDetectionService;