import * as tf from '@tensorflow/tfjs';
import * as numpy from 'numpy-js';
import { v4 as uuidv4 } from 'uuid';

// Enum for AI Model Types
export enum AIModelType {
  COST_PREDICTION = 'cost_prediction',
  PRODUCTIVITY_OPTIMIZATION = 'productivity_optimization',
  ANOMALY_DETECTION = 'anomaly_detection',
  ROUTE_OPTIMIZATION = 'route_optimization',
  SAFETY_RISK_ASSESSMENT = 'safety_risk_assessment',
  RESOURCE_ALLOCATION = 'resource_allocation'
}

// Model Configuration Interface
export interface AIModelConfig {
  type: AIModelType;
  inputShape: number[];
  layers: number[];
  learningRate: number;
  epochs: number;
  batchSize: number;
}

// Training Metrics Interface
export interface TrainingMetrics {
  loss: number[];
  accuracy: number[];
  validationLoss?: number[];
  validationAccuracy?: number[];
}

// Model Training Result
export interface ModelTrainingResult {
  modelId: string;
  type: AIModelType;
  metrics: TrainingMetrics;
  timestamp: number;
  confidence: number;
}

export class AIModelTrainingInfrastructure {
  private models: Map<string, tf.LayersModel> = new Map();
  private trainingHistory: ModelTrainingResult[] = [];

  // Default model configurations
  private defaultConfigs: Record<AIModelType, AIModelConfig> = {
    [AIModelType.COST_PREDICTION]: {
      type: AIModelType.COST_PREDICTION,
      inputShape: [10],
      layers: [64, 32, 16],
      learningRate: 0.001,
      epochs: 100,
      batchSize: 32
    },
    [AIModelType.PRODUCTIVITY_OPTIMIZATION]: {
      type: AIModelType.PRODUCTIVITY_OPTIMIZATION,
      inputShape: [15],
      layers: [128, 64, 32],
      learningRate: 0.0005,
      epochs: 150,
      batchSize: 64
    },
    // Add configurations for other model types
    [AIModelType.ANOMALY_DETECTION]: {
      type: AIModelType.ANOMALY_DETECTION,
      inputShape: [20],
      layers: [256, 128, 64],
      learningRate: 0.0001,
      epochs: 200,
      batchSize: 32
    },
    // ... other model type configurations
  };

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    Object.values(AIModelType).forEach(modelType => {
      this.createModel(modelType);
    });
  }

  private createModel(modelType: AIModelType): tf.LayersModel {
    const config = this.defaultConfigs[modelType];
    
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: config.inputShape,
      units: config.layers[0],
      activation: 'relu'
    }));

    // Hidden layers
    config.layers.slice(1).forEach(units => {
      model.add(tf.layers.dense({
        units,
        activation: 'relu'
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
    });

    // Output layer (adjust based on specific model type)
    model.add(tf.layers.dense({
      units: 1,
      activation: modelType === AIModelType.ANOMALY_DETECTION ? 'sigmoid' : 'linear'
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: modelType === AIModelType.ANOMALY_DETECTION ? 'binaryCrossentropy' : 'meanSquaredError',
      metrics: ['accuracy']
    });

    this.models.set(modelType, model);
    return model;
  }

  public async trainModel(
    modelType: AIModelType, 
    trainingData: {
      x: tf.Tensor, 
      y: tf.Tensor, 
      xVal?: tf.Tensor, 
      yVal?: tf.Tensor
    }
  ): Promise<ModelTrainingResult> {
    const model = this.models.get(modelType);
    const config = this.defaultConfigs[modelType];

    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }

    const history = await model.fit(trainingData.x, trainingData.y, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData: trainingData.xVal && trainingData.yVal 
        ? [trainingData.xVal, trainingData.yVal] 
        : undefined,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}, accuracy = ${logs.acc}`);
        }
      }
    });

    // Calculate confidence based on final validation metrics
    const confidence = this.calculateConfidence(history);

    const trainingResult: ModelTrainingResult = {
      modelId: uuidv4(),
      type: modelType,
      metrics: {
        loss: history.history.loss,
        accuracy: history.history.acc,
        validationLoss: history.history.val_loss,
        validationAccuracy: history.history.val_acc
      },
      timestamp: Date.now(),
      confidence
    };

    this.trainingHistory.push(trainingResult);
    return trainingResult;
  }

  private calculateConfidence(history: tf.History): number {
    const finalAccuracy = history.history.acc[history.history.acc.length - 1];
    const finalValidationAccuracy = history.history.val_acc 
      ? history.history.val_acc[history.history.val_acc.length - 1] 
      : finalAccuracy;

    return Math.min(
      (finalAccuracy + finalValidationAccuracy) / 2 * 100, 
      99.9
    );
  }

  public async predictWithModel(
    modelType: AIModelType, 
    inputData: tf.Tensor
  ): Promise<tf.Tensor> {
    const model = this.models.get(modelType);
    
    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }

    return model.predict(inputData) as tf.Tensor;
  }

  public getTrainingHistory(modelType?: AIModelType): ModelTrainingResult[] {
    return modelType 
      ? this.trainingHistory.filter(result => result.type === modelType)
      : this.trainingHistory;
  }

  public async saveModel(modelType: AIModelType, path: string) {
    const model = this.models.get(modelType);
    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }
    await model.save(path);
  }

  public async loadModel(modelType: AIModelType, path: string) {
    const loadedModel = await tf.loadLayersModel(path);
    this.models.set(modelType, loadedModel);
  }
}

// Singleton instance for global access
export const aiModelTrainer = new AIModelTrainingInfrastructure();