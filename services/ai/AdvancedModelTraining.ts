import * as tf from '@tensorflow/tfjs';
import * as numpy from 'numpy-js';
import { v4 as uuidv4 } from 'uuid';
import { AIModelType } from './ModelTrainingInfrastructure';

// Advanced Model Training Configuration
export interface AdvancedModelConfig {
  type: AIModelType;
  inputShape: number[];
  layers: {
    type: 'dense' | 'lstm' | 'conv1d' | 'conv2d';
    units: number;
    activation: string;
    dropoutRate?: number;
  }[];
  learningRate: number;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  earlyStoppingPatience?: number;
}

// Advanced Training Metrics
export interface AdvancedTrainingMetrics {
  modelId: string;
  type: AIModelType;
  trainingTime: number;
  epochs: number;
  finalLoss: number;
  finalAccuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
  overallConfidence: number;
  performanceProfile: {
    epoch: number;
    loss: number;
    accuracy: number;
    validationLoss?: number;
    validationAccuracy?: number;
  }[];
}

// Data Augmentation Interface
export interface DataAugmentationConfig {
  noise?: {
    mean: number;
    stdDev: number;
  };
  scaling?: {
    min: number;
    max: number;
  };
  rotation?: number;
  flip?: boolean;
}

export class AdvancedModelTrainer {
  private defaultConfigs: Record<AIModelType, AdvancedModelConfig> = {
    [AIModelType.COST_PREDICTION]: {
      type: AIModelType.COST_PREDICTION,
      inputShape: [10],
      layers: [
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dense', units: 32, activation: 'relu', dropoutRate: 0.2 },
        { type: 'dense', units: 16, activation: 'relu', dropoutRate: 0.1 }
      ],
      learningRate: 0.001,
      epochs: 200,
      batchSize: 32,
      validationSplit: 0.2,
      earlyStoppingPatience: 10
    },
    [AIModelType.PRODUCTIVITY_OPTIMIZATION]: {
      type: AIModelType.PRODUCTIVITY_OPTIMIZATION,
      inputShape: [15],
      layers: [
        { type: 'lstm', units: 128, activation: 'tanh' },
        { type: 'dense', units: 64, activation: 'relu', dropoutRate: 0.3 },
        { type: 'dense', units: 32, activation: 'relu', dropoutRate: 0.2 }
      ],
      learningRate: 0.0005,
      epochs: 250,
      batchSize: 64,
      validationSplit: 0.25,
      earlyStoppingPatience: 15
    },
    // Add more model-specific configurations
    [AIModelType.ANOMALY_DETECTION]: {
      type: AIModelType.ANOMALY_DETECTION,
      inputShape: [20],
      layers: [
        { type: 'conv1d', units: 256, activation: 'relu' },
        { type: 'dense', units: 128, activation: 'relu', dropoutRate: 0.4 },
        { type: 'dense', units: 64, activation: 'relu', dropoutRate: 0.3 }
      ],
      learningRate: 0.0001,
      epochs: 300,
      batchSize: 32,
      validationSplit: 0.2,
      earlyStoppingPatience: 20
    }
  };

  public async trainAdvancedModel(
    modelType: AIModelType,
    trainingData: {
      x: tf.Tensor, 
      y: tf.Tensor,
      augmentationConfig?: DataAugmentationConfig
    }
  ): Promise<AdvancedTrainingMetrics> {
    const config = this.defaultConfigs[modelType];
    const startTime = Date.now();

    // Data augmentation
    const augmentedData = this.augmentData(trainingData.x, trainingData.augmentationConfig);

    // Create model
    const model = this.createAdvancedModel(config);

    // Early stopping callback
    const earlyStoppingCallback = tf.callbacks.earlyStopping({
      patience: config.earlyStoppingPatience || 10
    });

    // Training
    const history = await model.fit(augmentedData, trainingData.y, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationSplit: config.validationSplit,
      callbacks: [earlyStoppingCallback]
    });

    const endTime = Date.now();

    // Performance profile
    const performanceProfile = history.epoch.map((epoch, index) => ({
      epoch,
      loss: history.history.loss[index],
      accuracy: history.history.acc[index],
      validationLoss: history.history.val_loss?.[index],
      validationAccuracy: history.history.val_acc?.[index]
    }));

    // Calculate confidence
    const finalAccuracy = performanceProfile[performanceProfile.length - 1].accuracy;
    const finalValidationAccuracy = performanceProfile[performanceProfile.length - 1].validationAccuracy || finalAccuracy;
    const overallConfidence = Math.min(
      ((finalAccuracy + finalValidationAccuracy) / 2) * 100, 
      99.9
    );

    return {
      modelId: uuidv4(),
      type: modelType,
      trainingTime: endTime - startTime,
      epochs: history.epoch.length,
      finalLoss: performanceProfile[performanceProfile.length - 1].loss,
      finalAccuracy,
      validationLoss: performanceProfile[performanceProfile.length - 1].validationLoss,
      validationAccuracy: finalValidationAccuracy,
      overallConfidence,
      performanceProfile
    };
  }

  private createAdvancedModel(config: AdvancedModelConfig): tf.Sequential {
    const model = tf.sequential();

    // Input layer
    const inputLayer = config.layers[0];
    if (inputLayer.type === 'dense') {
      model.add(tf.layers.dense({
        inputShape: config.inputShape,
        units: inputLayer.units,
        activation: inputLayer.activation
      }));
    } else if (inputLayer.type === 'lstm') {
      model.add(tf.layers.lstm({
        inputShape: config.inputShape,
        units: inputLayer.units,
        activation: inputLayer.activation
      }));
    } else if (inputLayer.type === 'conv1d') {
      model.add(tf.layers.conv1d({
        inputShape: config.inputShape,
        filters: inputLayer.units,
        kernelSize: 3,
        activation: inputLayer.activation
      }));
    }

    // Hidden layers
    config.layers.slice(1).forEach(layer => {
      if (layer.type === 'dense') {
        model.add(tf.layers.dense({
          units: layer.units,
          activation: layer.activation
        }));
      }

      // Add dropout if specified
      if (layer.dropoutRate) {
        model.add(tf.layers.dropout({ rate: layer.dropoutRate }));
      }
    });

    // Output layer
    model.add(tf.layers.dense({
      units: 1,
      activation: config.type === AIModelType.ANOMALY_DETECTION ? 'sigmoid' : 'linear'
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: config.type === AIModelType.ANOMALY_DETECTION ? 'binaryCrossentropy' : 'meanSquaredError',
      metrics: ['accuracy']
    });

    return model;
  }

  private augmentData(
    data: tf.Tensor, 
    augmentationConfig?: DataAugmentationConfig
  ): tf.Tensor {
    if (!augmentationConfig) return data;

    let augmentedData = data;

    // Add Gaussian noise
    if (augmentationConfig.noise) {
      const noise = tf.randomNormal(
        data.shape, 
        augmentationConfig.noise.mean, 
        augmentationConfig.noise.stdDev
      );
      augmentedData = augmentedData.add(noise);
    }

    // Scale data
    if (augmentationConfig.scaling) {
      const { min, max } = augmentationConfig.scaling;
      const scaledData = augmentedData.mul(max - min).add(min);
      augmentedData = scaledData;
    }

    return augmentedData;
  }

  // Advanced model evaluation
  public async evaluateModel(
    model: tf.Sequential, 
    testData: { x: tf.Tensor, y: tf.Tensor }
  ): Promise<{
    testLoss: number, 
    testAccuracy: number,
    confusionMatrix?: tf.Tensor
  }> {
    const result = model.evaluate(testData.x, testData.y);
    
    // For classification models, generate confusion matrix
    if (model.layers[model.layers.length - 1].activation === 'sigmoid') {
      const predictions = model.predict(testData.x) as tf.Tensor;
      const confusionMatrix = this.computeConfusionMatrix(predictions, testData.y);
      
      return {
        testLoss: (result[0] as tf.Tensor).dataSync()[0],
        testAccuracy: (result[1] as tf.Tensor).dataSync()[0],
        confusionMatrix
      };
    }

    return {
      testLoss: (result[0] as tf.Tensor).dataSync()[0],
      testAccuracy: (result[1] as tf.Tensor).dataSync()[0]
    };
  }

  private computeConfusionMatrix(
    predictions: tf.Tensor, 
    labels: tf.Tensor
  ): tf.Tensor {
    // Simplified confusion matrix computation
    const predData = predictions.dataSync();
    const labelData = labels.dataSync();

    const confusionMatrix = tf.zeros([2, 2]);
    
    predData.forEach((pred, index) => {
      const predictedClass = pred > 0.5 ? 1 : 0;
      const actualClass = labelData[index];
      
      const currentValue = confusionMatrix.bufferSync().get(actualClass, predictedClass);
      confusionMatrix.bufferSync().set(currentValue + 1, actualClass, predictedClass);
    });

    return confusionMatrix;
  }
}

// Singleton instance for advanced model training
export const advancedModelTrainer = new AdvancedModelTrainer();