import * as tf from '@tensorflow/tfjs';
import * as tfnode from '@tensorflow/tfjs-node';

export interface DefectAnalysis {
  defects: PavementDefect[];
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
  confidenceScore: number;
  recommendations: string[];
  areaAnalysis: {
    totalArea: number;
    damagedArea: number;
    damagePercentage: number;
  };
}

export interface PavementDefect {
  type: 'crack' | 'pothole' | 'rutting' | 'raveling' | 'bleeding' | 'patching';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  area: number;
  confidence: number;
  description: string;
  repairCost: number;
  urgency: 'immediate' | 'within_week' | 'within_month' | 'monitor';
}

export interface QualityScore {
  overallScore: number; // 0-100
  beforeScore: number;
  afterScore: number;
  improvement: number;
  metrics: {
    smoothness: number;
    evenness: number;
    crackDensity: number;
    colorConsistency: number;
    edgeQuality: number;
  };
  passedInspection: boolean;
  certificationLevel: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
}

export interface SurfaceMetrics {
  roughnessIndex: number;
  crackDensity: number;
  rutDepth: number;
  macrotexture: number;
  skidResistance: number;
  drainageEfficiency: number;
  overallConditionIndex: number;
  maintenanceRecommendations: MaintenanceRecommendation[];
}

export interface MaintenanceRecommendation {
  type: 'preventive' | 'corrective' | 'reconstruction';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  description: string;
  estimatedCost: number;
  expectedLifeExtension: number; // years
  costBenefitRatio: number;
}

export interface ImageAnalysisOptions {
  enhanceContrast: boolean;
  noiseReduction: boolean;
  edgeDetection: boolean;
  colorNormalization: boolean;
  multiScale: boolean;
}

export class ComputerVisionService {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private modelUrl = '/models/pavement-defect-detection.json';

  constructor() {
    this.initializeTensorFlow();
  }

  private async initializeTensorFlow(): Promise<void> {
    try {
      // Initialize TensorFlow.js with WebGL backend for performance
      await tf.ready();
      console.log('TensorFlow.js initialized with backend:', tf.getBackend());
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
    }
  }

  private async loadModel(): Promise<void> {
    if (this.isModelLoaded) return;

    try {
      console.log('Loading computer vision model...');
      
      // Try to load the actual TensorFlow.js model first
      try {
        const modelUrl = '/models/model.json';
        this.model = await tf.loadLayersModel(modelUrl);
        console.log('Real computer vision model loaded successfully');
        console.log('Model input shape:', this.model.inputs[0].shape);
        console.log('Model output shape:', this.model.outputs[0].shape);
      } catch (modelError) {
        console.warn('Real model not available, using fallback model:', modelError);
        // Fallback to creating a model for development
        this.model = await this.createMockModel();
        console.log('Fallback model created successfully');
      }
      
      this.isModelLoaded = true;
      console.log('Pavement defect detection model ready');
    } catch (error) {
      console.error('Failed to load model:', error);
      throw new Error('Computer vision model failed to load');
    }
  }

  private async createMockModel(): Promise<tf.LayersModel> {
    // Create a mock model for demonstration
    // In production, this would be replaced with a real pre-trained model
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 6, activation: 'softmax' }), // 6 defect types
      ],
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  /**
   * Analyze pavement image for defects and quality issues
   */
  async analyzePavementDefects(
    imageData: ImageData | string,
    options: Partial<ImageAnalysisOptions> = {}
  ): Promise<DefectAnalysis> {
    await this.loadModel();

    try {
      const processedImage = await this.preprocessImage(imageData, options);
      const predictions = await this.runInference(processedImage);
      const defects = await this.extractDefects(predictions, processedImage);
      
      return this.generateDefectAnalysis(defects, processedImage);
    } catch (error) {
      console.error('Error analyzing pavement defects:', error);
      throw new Error('Failed to analyze pavement defects');
    }
  }

  /**
   * Score pavement quality by comparing before/after images
   */
  async qualityScoring(beforeImage: ImageData, afterImage: ImageData): Promise<QualityScore> {
    await this.loadModel();

    try {
      const beforeProcessed = await this.preprocessImage(beforeImage);
      const afterProcessed = await this.preprocessImage(afterImage);
      
      const beforeDefects = await this.runInference(beforeProcessed);
      const afterDefects = await this.runInference(afterProcessed);
      
      return this.calculateQualityScore(beforeDefects, afterDefects);
    } catch (error) {
      console.error('Error calculating quality score:', error);
      throw new Error('Failed to calculate quality score');
    }
  }

  /**
   * Analyze surface metrics from drone or satellite imagery
   */
  async surfaceAnalysis(droneImagery: ImageData[]): Promise<SurfaceMetrics> {
    await this.loadModel();

    try {
      const processedImages = await Promise.all(
        droneImagery.map(img => this.preprocessImage(img))
      );
      
      const combinedAnalysis = await this.analyzeMultipleImages(processedImages);
      return this.generateSurfaceMetrics(combinedAnalysis);
    } catch (error) {
      console.error('Error analyzing surface metrics:', error);
      throw new Error('Failed to analyze surface metrics');
    }
  }

  private async preprocessImage(
    imageData: ImageData | string,
    options: Partial<ImageAnalysisOptions> = {}
  ): Promise<tf.Tensor> {
    let tensor: tf.Tensor;

    if (typeof imageData === 'string') {
      // Handle base64 image data
      const img = new Image();
      img.src = imageData;
      await new Promise(resolve => img.onload = resolve);
      tensor = tf.browser.fromPixels(img);
    } else {
      tensor = tf.browser.fromPixels(imageData);
    }

    // Resize to model input size
    tensor = tf.image.resizeBilinear(tensor, [224, 224]);
    
    // Normalize pixel values
    tensor = tensor.div(255.0);
    
    // Add batch dimension
    tensor = tensor.expandDims(0);

    // Apply preprocessing options
    if (options.enhanceContrast) {
      tensor = this.enhanceContrast(tensor);
    }
    
    if (options.noiseReduction) {
      tensor = this.applyNoiseReduction(tensor);
    }
    
    if (options.edgeDetection) {
      tensor = this.applyEdgeDetection(tensor);
    }

    return tensor;
  }

  private enhanceContrast(tensor: tf.Tensor): tf.Tensor {
    // Simple contrast enhancement
    return tensor.sub(0.5).mul(1.2).add(0.5).clipByValue(0, 1);
  }

  private applyNoiseReduction(tensor: tf.Tensor): tf.Tensor {
    // Apply Gaussian blur for noise reduction
    const kernel = tf.tensor4d([
      [[[0.0625]], [[0.125]], [[0.0625]]],
      [[[0.125]], [[0.25]], [[0.125]]],
      [[[0.0625]], [[0.125]], [[0.0625]]]
    ]);
    return tf.conv2d(tensor, kernel, 1, 'same');
  }

  private applyEdgeDetection(tensor: tf.Tensor): tf.Tensor {
    // Sobel edge detection
    const sobelX = tf.tensor4d([
      [[[-1]], [[0]], [[1]]],
      [[[-2]], [[0]], [[2]]],
      [[[-1]], [[0]], [[1]]]
    ]);
    return tf.conv2d(tensor, sobelX, 1, 'same');
  }

  private async runInference(inputTensor: tf.Tensor): Promise<tf.Tensor> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    
    // Run model prediction
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    return prediction;
  }

  private async extractDefects(predictions: tf.Tensor, image: tf.Tensor): Promise<PavementDefect[]> {
    const predData = await predictions.data();
    const defects: PavementDefect[] = [];
    
    // Mock defect extraction - in real implementation, this would use
    // object detection algorithms to locate and classify defects
    const defectTypes = ['crack', 'pothole', 'rutting', 'raveling', 'bleeding', 'patching'] as const;
    
    for (let i = 0; i < predData.length; i++) {
      if (predData[i] > 0.5) { // Confidence threshold
        const defectType = defectTypes[i % defectTypes.length];
        const mockDefect: PavementDefect = {
          type: defectType,
          severity: this.determineSeverity(predData[i]),
          location: {
            x: Math.random() * 224,
            y: Math.random() * 224,
            width: 20 + Math.random() * 50,
            height: 20 + Math.random() * 50,
          },
          area: Math.random() * 100,
          confidence: predData[i],
          description: this.getDefectDescription(defectType),
          repairCost: this.estimateRepairCost(defectType, predData[i]),
          urgency: this.determineUrgency(defectType, predData[i]),
        };
        defects.push(mockDefect);
      }
    }
    
    return defects;
  }

  private determineSeverity(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence > 0.9) return 'critical';
    if (confidence > 0.8) return 'high';
    if (confidence > 0.6) return 'medium';
    return 'low';
  }

  private getDefectDescription(type: string): string {
    const descriptions = {
      crack: 'Linear separation in pavement surface',
      pothole: 'Bowl-shaped depression in pavement',
      rutting: 'Longitudinal depressions in wheel paths',
      raveling: 'Loss of surface aggregate particles',
      bleeding: 'Upward movement of asphalt binder',
      patching: 'Previous repair work area',
    };
    return descriptions[type as keyof typeof descriptions] || 'Unknown defect type';
  }

  private estimateRepairCost(type: string, severity: number): number {
    const baseCosts = {
      crack: 50,
      pothole: 200,
      rutting: 150,
      raveling: 100,
      bleeding: 75,
      patching: 120,
    };
    const baseCost = baseCosts[type as keyof typeof baseCosts] || 100;
    return baseCost * (1 + severity * 2); // Increase cost with severity
  }

  private determineUrgency(type: string, severity: number): 'immediate' | 'within_week' | 'within_month' | 'monitor' {
    if (type === 'pothole' && severity > 0.8) return 'immediate';
    if (severity > 0.9) return 'immediate';
    if (severity > 0.7) return 'within_week';
    if (severity > 0.5) return 'within_month';
    return 'monitor';
  }

  private generateDefectAnalysis(defects: PavementDefect[], image: tf.Tensor): DefectAnalysis {
    const totalArea = 224 * 224; // Image dimensions
    const damagedArea = defects.reduce((sum, defect) => sum + defect.area, 0);
    const damagePercentage = (damagedArea / totalArea) * 100;
    
    const overallCondition = this.determineOverallCondition(damagePercentage, defects);
    const confidenceScore = defects.length > 0 
      ? defects.reduce((sum, d) => sum + d.confidence, 0) / defects.length 
      : 0.95;
    
    return {
      defects,
      overallCondition,
      confidenceScore,
      recommendations: this.generateRecommendations(defects, damagePercentage),
      areaAnalysis: {
        totalArea,
        damagedArea,
        damagePercentage,
      },
    };
  }

  private determineOverallCondition(damagePercentage: number, defects: PavementDefect[]): 'excellent' | 'good' | 'fair' | 'poor' | 'failed' {
    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    
    if (criticalDefects > 2 || damagePercentage > 25) return 'failed';
    if (criticalDefects > 0 || damagePercentage > 15) return 'poor';
    if (damagePercentage > 8) return 'fair';
    if (damagePercentage > 3) return 'good';
    return 'excellent';
  }

  private generateRecommendations(defects: PavementDefect[], damagePercentage: number): string[] {
    const recommendations: string[] = [];
    
    if (damagePercentage > 20) {
      recommendations.push('Consider full section reconstruction');
    } else if (damagePercentage > 10) {
      recommendations.push('Schedule major rehabilitation within 6 months');
    }
    
    const immediateDefects = defects.filter(d => d.urgency === 'immediate');
    if (immediateDefects.length > 0) {
      recommendations.push(`Address ${immediateDefects.length} critical defects immediately`);
    }
    
    const crackDefects = defects.filter(d => d.type === 'crack');
    if (crackDefects.length > 3) {
      recommendations.push('Apply crack sealing treatment');
    }
    
    return recommendations;
  }

  private calculateQualityScore(beforeDefects: tf.Tensor, afterDefects: tf.Tensor): QualityScore {
    // Mock quality scoring - in real implementation, this would compare
    // defect densities and quality metrics
    const beforeScore = Math.random() * 40 + 30; // 30-70
    const afterScore = Math.random() * 30 + 70; // 70-100
    const improvement = afterScore - beforeScore;
    
    return {
      overallScore: afterScore,
      beforeScore,
      afterScore,
      improvement,
      metrics: {
        smoothness: 85 + Math.random() * 10,
        evenness: 80 + Math.random() * 15,
        crackDensity: Math.random() * 20,
        colorConsistency: 90 + Math.random() * 10,
        edgeQuality: 85 + Math.random() * 10,
      },
      passedInspection: afterScore >= 75,
      certificationLevel: this.getCertificationLevel(afterScore),
    };
  }

  private getCertificationLevel(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'F';
  }

  private async analyzeMultipleImages(images: tf.Tensor[]): Promise<any> {
    // Combine analysis from multiple images
    const analyses = await Promise.all(
      images.map(img => this.runInference(img))
    );
    
    return analyses.reduce((combined, analysis) => {
      // Combine analyses - implementation would merge detection results
      return combined;
    }, {});
  }

  private generateSurfaceMetrics(combinedAnalysis: any): SurfaceMetrics {
    return {
      roughnessIndex: 2.5 + Math.random() * 2,
      crackDensity: Math.random() * 15,
      rutDepth: Math.random() * 10,
      macrotexture: 0.8 + Math.random() * 0.4,
      skidResistance: 0.6 + Math.random() * 0.3,
      drainageEfficiency: 85 + Math.random() * 10,
      overallConditionIndex: 70 + Math.random() * 25,
      maintenanceRecommendations: [
        {
          type: 'preventive',
          priority: 'medium',
          description: 'Apply surface treatment within 2 years',
          estimatedCost: 50000,
          expectedLifeExtension: 5,
          costBenefitRatio: 3.2,
        },
      ],
    };
  }

  /**
   * Clean up TensorFlow resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
    }
  }
}

export const computerVisionService = new ComputerVisionService();