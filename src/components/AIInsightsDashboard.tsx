// PHASE 11: AI Insights Dashboard
// Advanced AI/ML analytics and predictions interface
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Camera, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Activity,
  Eye,
  Cpu,
  Database,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Scan,
  Upload,
  Download,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

// PHASE 11: Import AI service
import { 
  advancedAIService,
  PavementAnalysisResult,
  PavementDefect,
  Recommendation,
  CostEstimate
} from '@/services/advancedAIService';

interface AIInsightsDashboardProps {
  className?: string;
}

interface ModelPerformance {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastUpdated: string;
  status: 'active' | 'training' | 'updating' | 'error';
}

interface PredictionResult {
  type: 'deterioration' | 'cost' | 'maintenance' | 'risk';
  confidence: number;
  value: any;
  timeline: string[];
  factors: string[];
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ className = '' }) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [aiServiceStatus, setAiServiceStatus] = useState<any>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<PavementAnalysisResult | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [detectedDefects, setDetectedDefects] = useState<PavementDefect[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    predictionsToday: 0,
    accuracyRate: 0,
    modelsActive: 0,
    memoryUsage: '0 MB'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize AI dashboard
  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(updateRealTimeMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Get AI service status
      const status = advancedAIService.getPerformanceStats();
      setAiServiceStatus(status);
      
      // Initialize model performance data
      const mockPerformance: ModelPerformance[] = [
        {
          name: 'Crack Detection CNN',
          accuracy: 94.2,
          precision: 91.8,
          recall: 96.1,
          f1Score: 93.9,
          lastUpdated: '2024-01-15 14:30',
          status: 'active'
        },
        {
          name: 'Deterioration LSTM',
          accuracy: 87.5,
          precision: 85.3,
          recall: 89.7,
          f1Score: 87.5,
          lastUpdated: '2024-01-15 12:15',
          status: 'active'
        },
        {
          name: 'Weather Impact RNN',
          accuracy: 82.1,
          precision: 79.4,
          recall: 84.8,
          f1Score: 82.1,
          lastUpdated: '2024-01-15 10:45',
          status: 'training'
        },
        {
          name: 'Cost Prediction NN',
          accuracy: 89.7,
          precision: 88.2,
          recall: 91.2,
          f1Score: 89.7,
          lastUpdated: '2024-01-15 09:20',
          status: 'active'
        }
      ];
      
      setModelPerformance(mockPerformance);
      
      // Load sample predictions
      await loadSamplePredictions();
      
      // Warm up models for better performance
      await advancedAIService.warmupModels();
      
    } catch (error) {
      console.error('Error initializing AI dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSamplePredictions = async () => {
    // Generate sample predictions for demonstration
    const samplePredictions: PredictionResult[] = [
      {
        type: 'deterioration',
        confidence: 0.89,
        value: [0.85, 0.78, 0.71, 0.63, 0.54],
        timeline: ['0 months: Good (85%)', '6 months: Good (78%)', '12 months: Fair (71%)', '18 months: Fair (63%)', '24 months: Poor (54%)'],
        factors: ['Heavy traffic loading', 'Freeze-thaw cycles', 'Age of pavement']
      },
      {
        type: 'cost',
        confidence: 0.92,
        value: { immediate: 5200, sixMonth: 12800, oneYear: 28500, fiveYear: 125000 },
        timeline: ['Immediate: $5,200', '6 Months: $12,800', '1 Year: $28,500', '5 Years: $125,000'],
        factors: ['Material costs trending up', 'Labor availability', 'Seasonal pricing']
      },
      {
        type: 'maintenance',
        confidence: 0.85,
        value: 'Preventive maintenance recommended',
        timeline: ['Next 30 days: Crack sealing', 'Next 6 months: Surface treatment', 'Next year: Overlay evaluation'],
        factors: ['Current condition score', 'Weather forecast', 'Budget optimization']
      }
    ];
    
    setPredictions(samplePredictions);
  };

  const updateRealTimeMetrics = () => {
    // Simulate real-time metrics updates
    setRealTimeMetrics({
      predictionsToday: Math.floor(Math.random() * 50) + 150,
      accuracyRate: 92.5 + Math.random() * 5,
      modelsActive: aiServiceStatus?.modelsLoaded || 0,
      memoryUsage: aiServiceStatus?.memoryUsage || '0 MB'
    });
  };

  // Image upload and analysis
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      // Create image element
      const img = new Image();
      img.onload = async () => {
        setSelectedImage(img);
        
        // Analyze image with AI
        const defects = await advancedAIService.analyzePavementImage(img);
        setDetectedDefects(defects);
        
        // Draw detection results on canvas
        drawDetectionResults(img, defects);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawDetectionResults = (img: HTMLImageElement, defects: PavementDefect[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Draw detection boxes
    defects.forEach((defect, index) => {
      const { x, y, width, height } = defect.location;
      
      // Color based on severity
      const colors = {
        low: '#22C55E',
        medium: '#F59E0B', 
        high: '#EF4444',
        critical: '#DC2626'
      };
      
      ctx.strokeStyle = colors[defect.severity];
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = colors[defect.severity];
      ctx.fillRect(x, y - 25, width, 25);
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText(`${defect.type} (${(defect.confidence * 100).toFixed(1)}%)`, x + 5, y - 8);
    });
  };

  // Generate AI recommendations
  const generateRecommendations = async () => {
    try {
      setIsLoading(true);
      
      const mockCondition = {
        roughness: 0.7,
        cracks: 0.4,
        skidResistance: 0.8,
        deflection: 0.6,
        surface: 0.7
      };
      
      const recs = await advancedAIService.generateIntelligentRecommendations(
        mockCondition,
        50000, // $50k budget
        '3 months',
        ['cost_effective', 'preventive', 'safety']
      );
      
      setRecommendations(recs);
      
      // Also get cost estimates
      const costs = await advancedAIService.predictMaintenanceCosts(mockCondition);
      setCostEstimate(costs);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'training': return 'text-blue-600';
      case 'updating': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'updating': return <Refresh className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading && !aiServiceStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-semibold">Initializing AI Systems...</p>
          <p className="text-sm text-gray-500">Loading machine learning models</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Service Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Models Active</p>
                <p className="text-2xl font-bold">{realTimeMetrics.modelsActive}/4</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictions Today</p>
                <p className="text-2xl font-bold">{realTimeMetrics.predictionsToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold">{realTimeMetrics.accuracyRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold">{realTimeMetrics.memoryUsage}</p>
              </div>
              <Cpu className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Dashboard Tabs */}
      <Tabs defaultValue="computer-vision" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="computer-vision" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Computer Vision
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Computer Vision Tab */}
        <TabsContent value="computer-vision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                AI-Powered Pavement Analysis
              </CardTitle>
              <CardDescription>
                Upload pavement images for real-time defect detection and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">Upload Pavement Image</p>
                <p className="text-sm text-gray-500 mb-4">
                  AI will automatically detect cracks, potholes, and surface defects
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </div>

              {selectedImage && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">AI Analysis Results</h4>
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto border rounded"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Detected Defects ({detectedDefects.length})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {detectedDefects.map((defect, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  defect.severity === 'critical' ? 'destructive' :
                                  defect.severity === 'high' ? 'destructive' :
                                  defect.severity === 'medium' ? 'default' : 'secondary'
                                }>
                                  {defect.type}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {(defect.confidence * 100).toFixed(1)}% confident
                                </span>
                              </div>
                              <p className="text-sm mt-1">{defect.description}</p>
                              <p className="text-xs text-gray-500">
                                Area: {defect.area.toFixed(0)} px² | Priority: {defect.priority.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {prediction.type === 'deterioration' && <TrendingUp className="h-5 w-5" />}
                    {prediction.type === 'cost' && <DollarSign className="h-5 w-5" />}
                    {prediction.type === 'maintenance' && <Settings className="h-5 w-5" />}
                    {prediction.type === 'risk' && <AlertTriangle className="h-5 w-5" />}
                    {prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)} Prediction
                  </CardTitle>
                  <CardDescription>
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={prediction.confidence * 100} className="w-full" />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Timeline Forecast</h4>
                    <div className="space-y-1">
                      {prediction.timeline.slice(0, 3).map((item, idx) => (
                        <p key={idx} className="text-sm">{item}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Factors</h4>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI-Generated Recommendations</h3>
            <Button onClick={generateRecommendations} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>

          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Maintenance Recommendations</h4>
                {recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={
                          rec.priority === 'immediate' ? 'destructive' :
                          rec.priority === 'urgent' ? 'destructive' :
                          rec.priority === 'scheduled' ? 'default' : 'secondary'
                        }>
                          {rec.priority}
                        </Badge>
                        <span className="text-sm font-semibold">${rec.estimatedCost.toLocaleString()}</span>
                      </div>
                      
                      <h5 className="font-semibold">{rec.description}</h5>
                      <p className="text-sm text-gray-600 mt-1">{rec.impact}</p>
                      <p className="text-xs text-gray-500 mt-2">Timeframe: {rec.timeframe}</p>
                      
                      <div className="mt-2">
                        <p className="text-xs font-semibold">AI Reasoning:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {rec.reasoning.slice(0, 2).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {costEstimate && (
                <div>
                  <h4 className="font-semibold mb-4">Cost Predictions</h4>
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Immediate</p>
                          <p className="text-xl font-bold">${costEstimate.immediate.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">6 Months</p>
                          <p className="text-xl font-bold">${costEstimate.sixMonth.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">1 Year</p>
                          <p className="text-xl font-bold">${costEstimate.oneYear.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">5 Years</p>
                          <p className="text-xl font-bold">${costEstimate.fiveYear.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold mb-2">Cost Breakdown</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Materials:</span>
                            <span>${costEstimate.breakdown.materials.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor:</span>
                            <span>${costEstimate.breakdown.labor.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Equipment:</span>
                            <span>${costEstimate.breakdown.equipment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overhead:</span>
                            <span>${costEstimate.breakdown.overhead.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {modelPerformance.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{model.name}</span>
                    <div className={`flex items-center gap-1 ${getStatusColor(model.status)}`}>
                      {getStatusIcon(model.status)}
                      <span className="text-sm capitalize">{model.status}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>Last updated: {model.lastUpdated}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <div className="flex items-center gap-2">
                        <Progress value={model.accuracy} className="flex-1" />
                        <span className="text-sm font-semibold">{model.accuracy}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precision</p>
                      <div className="flex items-center gap-2">
                        <Progress value={model.precision} className="flex-1" />
                        <span className="text-sm font-semibold">{model.precision}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recall</p>
                      <div className="flex items-center gap-2">
                        <Progress value={model.recall} className="flex-1" />
                        <span className="text-sm font-semibold">{model.recall}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">F1 Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={model.f1Score} className="flex-1" />
                        <span className="text-sm font-semibold">{model.f1Score}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Detection Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cracks</span>
                    <span className="text-sm font-semibold">45%</span>
                  </div>
                  <Progress value={45} />
                  <div className="flex justify-between">
                    <span className="text-sm">Potholes</span>
                    <span className="text-sm font-semibold">25%</span>
                  </div>
                  <Progress value={25} />
                  <div className="flex justify-between">
                    <span className="text-sm">Surface Defects</span>
                    <span className="text-sm font-semibold">20%</span>
                  </div>
                  <Progress value={20} />
                  <div className="flex justify-between">
                    <span className="text-sm">Other</span>
                    <span className="text-sm font-semibold">10%</span>
                  </div>
                  <Progress value={10} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">94.2%</div>
                  <p className="text-sm text-gray-600">Average across all models</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span className="text-green-600">+2.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="text-green-600">+5.7%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processing Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Images Processed</span>
                      <span className="text-sm font-semibold">1,247</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Predictions Made</span>
                      <span className="text-sm font-semibold">3,891</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Models Trained</span>
                      <span className="text-sm font-semibold">12</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>AI Performance Insights</AlertTitle>
            <AlertDescription>
              All models are performing within optimal parameters. The crack detection CNN shows the highest accuracy 
              with 94.2%, while the weather impact model is currently being retrained with new seasonal data to improve 
              prediction accuracy.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsDashboard;