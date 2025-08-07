import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Brain,
  Zap,
  TrendingUp,
  Bot,
  Cpu,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Play,
  Pause,
  Square,
  Settings,
  Database,
  Lightbulb,
  Sparkles,
  Workflow,
} from 'lucide-react';

// AI/ML Interfaces
interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'neural_network';
  status: 'training' | 'ready' | 'error' | 'predicting';
  accuracy?: number;
  trainingProgress: number;
  version: string;
  lastTrained: Date;
  parameters: Record<string, any>;
}

interface PredictionResult {
  id: string;
  modelId: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: Date;
  executionTime: number;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'data_change' | 'time_based' | 'event' | 'prediction';
    condition: string;
    threshold?: number;
  };
  actions: {
    type: 'notification' | 'data_update' | 'api_call' | 'email';
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
  lastExecuted?: Date;
  executionCount: number;
}

interface TrainingData {
  features: number[][];
  labels: number[];
  split: {
    train: number;
    validation: number;
    test: number;
  };
}

// Simple ML utilities (placeholder for TensorFlow.js)
class SimpleMLEngine {
  private models: Map<string, any> = new Map();

  // Linear regression implementation
  linearRegression(X: number[][], y: number[]): { weights: number[]; bias: number } {
    const n = X.length;
    const features = X[0].length;

    // Initialize weights and bias
    const weights = new Array(features).fill(0);
    let bias = 0;
    const learningRate = 0.01;
    const epochs = 1000;

    // Training loop
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < n; i++) {
        // Forward pass
        let prediction = bias;
        for (let j = 0; j < features; j++) {
          prediction += weights[j] * X[i][j];
        }

        // Calculate loss
        const error = prediction - y[i];
        totalLoss += error * error;

        // Backward pass (gradient descent)
        bias -= learningRate * error;
        for (let j = 0; j < features; j++) {
          weights[j] -= learningRate * error * X[i][j];
        }
      }

      // Early stopping for demo
      if (totalLoss / n < 0.001) { break; }
    }

    return { weights, bias };
  }

  // Simple classification using logistic regression
  logisticRegression(X: number[][], y: number[]): { weights: number[]; bias: number } {
    const n = X.length;
    const features = X[0].length;

    const weights = new Array(features).fill(0);
    let bias = 0;
    const learningRate = 0.1;
    const epochs = 1000;

    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        let z = bias;
        for (let j = 0; j < features; j++) {
          z += weights[j] * X[i][j];
        }

        const prediction = sigmoid(z);
        const error = prediction - y[i];

        bias -= learningRate * error;
        for (let j = 0; j < features; j++) {
          weights[j] -= learningRate * error * X[i][j];
        }
      }
    }

    return { weights, bias };
  }

  // K-means clustering
  kMeansClustering(X: number[][], k: number): { centroids: number[][]; labels: number[] } {
    const n = X.length;
    const features = X[0].length;

    // Initialize centroids randomly
    const centroids: number[][] = [];
    for (let i = 0; i < k; i++) {
      centroids.push(X[Math.floor(Math.random() * n)].slice());
    }

    let labels = new Array(n).fill(0);
    const maxIterations = 100;

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to nearest centroid
      const newLabels = new Array(n);
      for (let i = 0; i < n; i++) {
        let minDistance = Infinity;
        let closestCentroid = 0;

        for (let j = 0; j < k; j++) {
          let distance = 0;
          for (let f = 0; f < features; f++) {
            distance += (X[i][f] - centroids[j][f]) ** 2;
          }

          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = j;
          }
        }

        newLabels[i] = closestCentroid;
      }

      // Update centroids
      const newCentroids: number[][] = new Array(k).fill(null).map(() => new Array(features).fill(0));
      const counts = new Array(k).fill(0);

      for (let i = 0; i < n; i++) {
        const label = newLabels[i];
        counts[label]++;
        for (let f = 0; f < features; f++) {
          newCentroids[label][f] += X[i][f];
        }
      }

      for (let j = 0; j < k; j++) {
        if (counts[j] > 0) {
          for (let f = 0; f < features; f++) {
            newCentroids[j][f] /= counts[j];
          }
        }
      }

      // Check for convergence
      let converged = true;
      for (let i = 0; i < n; i++) {
        if (newLabels[i] !== labels[i]) {
          converged = false;
          break;
        }
      }

      labels = newLabels;
      centroids.splice(0, k, ...newCentroids);

      if (converged) { break; }
    }

    return { centroids, labels };
  }

  predict(modelId: string, modelType: string, input: number[], modelParams: any): number {
    switch (modelType) {
      case 'regression': {
        const { weights, bias } = modelParams;
        let prediction = bias;
        for (let i = 0; i < input.length; i++) {
          prediction += weights[i] * input[i];
        }
        return prediction;
      }
      case 'classification': {
        const { weights, bias } = modelParams;
        let z = bias;
        for (let i = 0; i < input.length; i++) {
          z += weights[i] * input[i];
        }
        return 1 / (1 + Math.exp(-z));
      }
      default:
        return 0;
    }
  }
}

// ML Model Manager Component
const MLModelManager: React.FC = () => {
  const [models, setModels] = useState<MLModel[]>([
    {
      id: 'model-1',
      name: 'Project Duration Predictor',
      type: 'regression',
      status: 'ready',
      accuracy: 0.87,
      trainingProgress: 100,
      version: '1.2.0',
      lastTrained: new Date('2024-01-15'),
      parameters: { learningRate: 0.01, epochs: 1000 },
    },
    {
      id: 'model-2',
      name: 'Risk Classification',
      type: 'classification',
      status: 'ready',
      accuracy: 0.92,
      trainingProgress: 100,
      version: '2.1.0',
      lastTrained: new Date('2024-01-10'),
      parameters: { learningRate: 0.1, epochs: 500 },
    },
  ]);

  const [newModel, setNewModel] = useState({
    name: '',
    type: 'regression' as MLModel['type'],
    trainingData: '',
  });

  const [isTraining, setIsTraining] = useState(false);
  const mlEngine = useRef(new SimpleMLEngine());

  const trainModel = async (modelId: string) => {
    setIsTraining(true);

    // Update model status
    setModels(prev => prev.map(model =>
      model.id === modelId
        ? { ...model, status: 'training' as const, trainingProgress: 0 }
        : model,
    ));

    // Simulate training progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setModels(prev => prev.map(model =>
        model.id === modelId
          ? { ...model, trainingProgress: progress }
          : model,
      ));
    }

    // Complete training
    setModels(prev => prev.map(model =>
      model.id === modelId
        ? {
            ...model,
            status: 'ready' as const,
            accuracy: 0.85 + Math.random() * 0.1,
            lastTrained: new Date(),
          }
        : model,
    ));

    setIsTraining(false);
  };

  const createModel = () => {
    if (!newModel.name.trim()) { return; }

    const model: MLModel = {
      id: `model-${Date.now()}`,
      name: newModel.name,
      type: newModel.type,
      status: 'training',
      trainingProgress: 0,
      version: '1.0.0',
      lastTrained: new Date(),
      parameters: {},
    };

    setModels(prev => [...prev, model]);
    trainModel(model.id);

    setNewModel({ name: '', type: 'regression', trainingData: '' });
  };

  const getStatusColor = (status: MLModel['status']) => {
    switch (status) {
      case 'ready': return 'default';
      case 'training': return 'secondary';
      case 'error': return 'destructive';
      case 'predicting': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          ML Model Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {model.type} • v{model.version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      {model.accuracy && (
                        <Badge variant="outline">
                          {(model.accuracy * 100).toFixed(1)}% accuracy
                        </Badge>
                      )}
                    </div>
                  </div>

                  {model.status === 'training' && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Training Progress</span>
                        <span>{model.trainingProgress}%</span>
                      </div>
                      <Progress value={model.trainingProgress} className="w-full" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Last Trained</div>
                      <div>{model.lastTrained.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="capitalize">{model.type.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => trainModel(model.id)}
                      disabled={model.status === 'training' || isTraining}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Retrain
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={newModel.name}
                  onChange={(e) => { setNewModel(prev => ({ ...prev, name: e.target.value })); }}
                  placeholder="Project Duration Predictor"
                />
              </div>

              <div>
                <Label htmlFor="model-type">Model Type</Label>
                <Select
                  value={newModel.type}
                  onValueChange={(value: MLModel['type']) => { setNewModel(prev => ({ ...prev, type: value })); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="clustering">Clustering</SelectItem>
                    <SelectItem value="neural_network">Neural Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="training-data">Training Data (CSV)</Label>
                <Textarea
                  id="training-data"
                  value={newModel.trainingData}
                  onChange={(e) => { setNewModel(prev => ({ ...prev, trainingData: e.target.value })); }}
                  placeholder="feature1,feature2,target&#10;1.0,2.0,3.0&#10;2.0,3.0,5.0"
                  rows={4}
                />
              </div>

              <Button onClick={createModel} className="w-full" disabled={isTraining}>
                <Brain className="h-4 w-4 mr-2" />
                Create & Train Model
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Predictive Analytics Engine
const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data for predictions
  const samplePredictions = [
    {
      id: 'pred-1',
      modelId: 'model-1',
      input: { projectSize: 'Large', complexity: 'High', team: 8 },
      output: { duration: 120, confidence: 0.87 },
      confidence: 0.87,
      timestamp: new Date(),
      executionTime: 45,
    },
    {
      id: 'pred-2',
      modelId: 'model-2',
      input: { budget: 50000, timeline: 90, resources: 5 },
      output: { risk: 'Medium', probability: 0.34 },
      confidence: 0.92,
      timestamp: new Date(),
      executionTime: 32,
    },
  ];

  const generatePredictions = async () => {
    setIsGenerating(true);

    // Simulate prediction generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newPrediction: PredictionResult = {
      id: `pred-${Date.now()}`,
      modelId: 'model-1',
      input: {
        projectSize: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)],
        complexity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        team: Math.floor(Math.random() * 10) + 3,
      },
      output: {
        duration: Math.floor(Math.random() * 100) + 30,
        confidence: Math.random() * 0.3 + 0.7,
      },
      confidence: Math.random() * 0.3 + 0.7,
      timestamp: new Date(),
      executionTime: Math.floor(Math.random() * 50) + 20,
    };

    setPredictions(prev => [newPrediction, ...prev.slice(0, 9)]);
    setIsGenerating(false);
  };

  // Initialize with sample data
  useEffect(() => {
    setPredictions(samplePredictions);
  }, []);

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    actual: Math.sin(i * 0.3) * 20 + 50 + Math.random() * 10,
    predicted: Math.sin(i * 0.3) * 18 + 52 + Math.random() * 8,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Predictive Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={generatePredictions} disabled={isGenerating} className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Predictions'}
          </Button>
        </div>

        {/* Prediction Results */}
        <div className="space-y-4">
          <h3 className="font-medium">Recent Predictions</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Model: {prediction.modelId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prediction.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {(prediction.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Input</div>
                      <div className="space-y-1">
                        {Object.entries(prediction.input).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Output</div>
                      <div className="space-y-1">
                        {Object.entries(prediction.output).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    Execution time: {prediction.executionTime}ms
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prediction Accuracy Chart */}
        <div className="space-y-2">
          <h3 className="font-medium">Prediction vs Actual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Smart Automation Engine
const SmartAutomation: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'High Risk Alert',
      description: 'Send notification when project risk exceeds 80%',
      trigger: {
        type: 'prediction',
        condition: 'risk_probability > 0.8',
        threshold: 0.8,
      },
      actions: [
        {
          type: 'notification',
          parameters: { message: 'High risk detected', priority: 'urgent' },
        },
        {
          type: 'email',
          parameters: { recipients: ['manager@company.com'], template: 'risk-alert' },
        },
      ],
      isActive: true,
      lastExecuted: new Date('2024-01-14'),
      executionCount: 23,
    },
    {
      id: 'rule-2',
      name: 'Resource Optimization',
      description: 'Automatically optimize resource allocation based on workload',
      trigger: {
        type: 'data_change',
        condition: 'workload_change > 20%',
        threshold: 0.2,
      },
      actions: [
        {
          type: 'data_update',
          parameters: { table: 'resources', action: 'rebalance' },
        },
      ],
      isActive: true,
      executionCount: 156,
    },
  ]);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerType: 'prediction' as AutomationRule['trigger']['type'],
    condition: '',
    threshold: 0,
  });

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, isActive: !rule.isActive }
        : rule,
    ));
  };

  const executeRule = async (ruleId: string) => {
    // Simulate rule execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    setRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? {
            ...rule,
            lastExecuted: new Date(),
            executionCount: rule.executionCount + 1,
          }
        : rule,
    ));
  };

  const createRule = () => {
    if (!newRule.name.trim()) { return; }

    const rule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      trigger: {
        type: newRule.triggerType,
        condition: newRule.condition,
        threshold: newRule.threshold,
      },
      actions: [
        {
          type: 'notification',
          parameters: { message: `Triggered by ${newRule.name}` },
        },
      ],
      isActive: true,
      executionCount: 0,
    };

    setRules(prev => [...prev, rule]);
    setNewRule({
      name: '',
      description: '',
      triggerType: 'prediction',
      condition: '',
      threshold: 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Smart Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
            <TabsTrigger value="create">Create Rule</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { toggleRule(rule.id); }}
                      >
                        {rule.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded">
                      <div className="text-sm font-medium mb-1">Trigger</div>
                      <div className="text-sm">
                        <span className="capitalize">{rule.trigger.type.replace('_', ' ')}</span>
                        {rule.trigger.condition && (
                          <>: {rule.trigger.condition}</>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded">
                      <div className="text-sm font-medium mb-1">Actions</div>
                      <div className="space-y-1">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="text-sm">
                            <span className="capitalize">{action.type.replace('_', ' ')}</span>
                            {action.parameters.message && (
                              <span className="text-muted-foreground">
                                : {action.parameters.message}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Executions</div>
                        <div className="font-medium">{rule.executionCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Executed</div>
                        <div className="font-medium">
                          {rule.lastExecuted ? rule.lastExecuted.toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => executeRule(rule.id)}
                        disabled={!rule.isActive}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Test Execute
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => { setNewRule(prev => ({ ...prev, name: e.target.value })); }}
                  placeholder="High Risk Alert"
                />
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={newRule.description}
                  onChange={(e) => { setNewRule(prev => ({ ...prev, description: e.target.value })); }}
                  placeholder="Send notification when project risk exceeds threshold"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select
                  value={newRule.triggerType}
                  onValueChange={(value: AutomationRule['trigger']['type']) => { setNewRule(prev => ({ ...prev, triggerType: value })); }
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prediction">Prediction</SelectItem>
                    <SelectItem value="data_change">Data Change</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Input
                  id="condition"
                  value={newRule.condition}
                  onChange={(e) => { setNewRule(prev => ({ ...prev, condition: e.target.value })); }}
                  placeholder="risk_probability > 0.8"
                />
              </div>

              <div>
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => { setNewRule(prev => ({ ...prev, threshold: parseFloat(e.target.value) })); }}
                  placeholder="0.8"
                  step="0.1"
                />
              </div>

              <Button onClick={createRule} className="w-full">
                <Bot className="h-4 w-4 mr-2" />
                Create Automation Rule
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Main AI Foundation Component
const AIFoundation: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">AI Foundation</h1>
        <p className="text-muted-foreground">
          Machine learning, predictive analytics, and smart automation
        </p>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <MLModelManager />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="automation">
          <SmartAutomation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export {
  MLModelManager,
  PredictiveAnalytics,
  SmartAutomation,
  AIFoundation,
};

export default AIFoundation;