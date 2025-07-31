import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Wrench,
  Target,
  Zap,
  BarChart3,
  Activity,
  Clock,
  Settings,
  Info,
  Award,
  Shield,
  Truck,
  Users,
  FileText,
  Star
} from 'lucide-react';

// Types for predictive analytics
interface PredictiveModel {
  id: string;
  name: string;
  type: 'maintenance' | 'cost' | 'demand' | 'risk' | 'opportunity';
  accuracy: number;
  lastTrained: string;
  status: 'active' | 'training' | 'inactive';
  description: string;
}

interface Prediction {
  id: string;
  modelId: string;
  targetEntity: string;
  entityId: string;
  predictionType: 'failure' | 'cost_increase' | 'demand_spike' | 'opportunity' | 'risk';
  confidence: number;
  predictedDate: string;
  currentValue: number;
  predictedValue: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  details: Record<string, any>;
}

interface MLInsight {
  id: string;
  category: 'efficiency' | 'cost' | 'risk' | 'opportunity' | 'compliance';
  title: string;
  description: string;
  impact: number; // 1-10 scale
  confidence: number; // percentage
  actionable: boolean;
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  recommendations: string[];
  metrics: Record<string, number>;
}

interface OptimizationSuggestion {
  id: string;
  area: 'fleet' | 'scheduling' | 'resources' | 'costs' | 'routes' | 'maintenance';
  title: string;
  description: string;
  potentialSavings: number;
  implementationCost: number;
  roi: number;
  timeToImplement: number; // days
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: string[];
}

export default function PredictiveAnalytics() {
  // State management
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  // Load data
  useEffect(() => {
    loadPredictiveData();
  }, [selectedTimeframe]);

  const loadPredictiveData = () => {
    // Mock data - in production, this would come from ML models
    setModels([
      {
        id: 'maint-pred-1',
        name: 'Vehicle Maintenance Predictor',
        type: 'maintenance',
        accuracy: 94.2,
        lastTrained: '2024-01-20',
        status: 'active',
        description: 'Predicts vehicle maintenance needs based on usage patterns, age, and historical data'
      },
      {
        id: 'cost-pred-1',
        name: 'Cost Optimization Engine',
        type: 'cost',
        accuracy: 87.6,
        lastTrained: '2024-01-19',
        status: 'active',
        description: 'Forecasts project costs and identifies cost reduction opportunities'
      },
      {
        id: 'demand-pred-1',
        name: 'Demand Forecasting Model',
        type: 'demand',
        accuracy: 89.8,
        lastTrained: '2024-01-18',
        status: 'active',
        description: 'Predicts seasonal demand patterns and resource requirements'
      },
      {
        id: 'risk-pred-1',
        name: 'Risk Assessment AI',
        type: 'risk',
        accuracy: 92.1,
        lastTrained: '2024-01-21',
        status: 'training',
        description: 'Identifies potential project risks and safety concerns'
      }
    ]);

    setPredictions([
      {
        id: 'pred-1',
        modelId: 'maint-pred-1',
        targetEntity: 'Vehicle FL-001',
        entityId: 'vehicle-1',
        predictionType: 'failure',
        confidence: 89.2,
        predictedDate: '2024-02-15',
        currentValue: 45320,
        predictedValue: 47500,
        impact: 'high',
        recommendations: [
          'Schedule brake inspection before February 10th',
          'Order replacement brake pads (Part #BRK-001)',
          'Plan 4-hour downtime for maintenance'
        ],
        details: {
          component: 'Brake System',
          riskFactors: ['Heavy usage', 'Age of components', 'Environmental conditions'],
          estimatedCost: 850
        }
      },
      {
        id: 'pred-2',
        modelId: 'cost-pred-1',
        targetEntity: 'Project Route 29 Repaving',
        entityId: 'project-1',
        predictionType: 'cost_increase',
        confidence: 76.4,
        predictedDate: '2024-02-20',
        currentValue: 125000,
        predictedValue: 138000,
        impact: 'medium',
        recommendations: [
          'Lock in asphalt pricing with suppliers',
          'Consider alternative material sources',
          'Negotiate fixed-price contracts for subcontractors'
        ],
        details: {
          factors: ['Material price volatility', 'Labor costs', 'Weather delays'],
          estimatedIncrease: 13000
        }
      }
    ]);

    setInsights([
      {
        id: 'insight-1',
        category: 'efficiency',
        title: 'Fleet Utilization Optimization',
        description: 'Analysis shows 23% improvement potential in fleet utilization through route optimization',
        impact: 8.5,
        confidence: 92.3,
        actionable: true,
        timeframe: 'short_term',
        recommendations: [
          'Implement AI-powered route optimization',
          'Redistribute vehicles based on demand patterns',
          'Consider consolidating smaller projects'
        ],
        metrics: {
          currentUtilization: 67.2,
          potentialUtilization: 82.7,
          monthlySavings: 12500
        }
      },
      {
        id: 'insight-2',
        category: 'cost',
        title: 'Preventive Maintenance ROI',
        description: 'Shifting to predictive maintenance could reduce total maintenance costs by 35%',
        impact: 9.2,
        confidence: 87.9,
        actionable: true,
        timeframe: 'medium_term',
        recommendations: [
          'Install IoT sensors on critical equipment',
          'Implement condition-based maintenance',
          'Train staff on predictive maintenance protocols'
        ],
        metrics: {
          currentCosts: 45000,
          projectedSavings: 15750,
          implementationCost: 8000
        }
      },
      {
        id: 'insight-3',
        category: 'opportunity',
        title: 'Government Contract Potential',
        description: 'High probability of winning veteran set-aside contracts based on company profile',
        impact: 7.8,
        confidence: 84.2,
        actionable: true,
        timeframe: 'immediate',
        recommendations: [
          'Complete VOSB certification',
          'Bid on upcoming VDOT projects',
          'Strengthen veteran hiring program'
        ],
        metrics: {
          contractValue: 2500000,
          winProbability: 73.5,
          competitionLevel: 4.2
        }
      }
    ]);

    setOptimizations([
      {
        id: 'opt-1',
        area: 'fleet',
        title: 'Dynamic Vehicle Allocation',
        description: 'Implement AI-driven vehicle assignment based on real-time project demands',
        potentialSavings: 18500,
        implementationCost: 5000,
        roi: 270,
        timeToImplement: 14,
        difficulty: 'medium',
        priority: 'high',
        steps: [
          'Install GPS tracking on all vehicles',
          'Develop allocation algorithm',
          'Train dispatchers on new system',
          'Monitor and optimize for 30 days'
        ]
      },
      {
        id: 'opt-2',
        area: 'maintenance',
        title: 'Predictive Maintenance Schedule',
        description: 'Transition from time-based to condition-based maintenance scheduling',
        potentialSavings: 25000,
        implementationCost: 12000,
        roi: 108,
        timeToImplement: 45,
        difficulty: 'hard',
        priority: 'medium',
        steps: [
          'Install condition monitoring sensors',
          'Integrate with maintenance management system',
          'Train maintenance staff',
          'Establish new maintenance protocols'
        ]
      },
      {
        id: 'opt-3',
        area: 'scheduling',
        title: 'Weather-Aware Project Planning',
        description: 'Integrate weather forecasting with project scheduling to minimize delays',
        potentialSavings: 12000,
        implementationCost: 2500,
        roi: 380,
        timeToImplement: 7,
        difficulty: 'easy',
        priority: 'high',
        steps: [
          'Subscribe to weather API service',
          'Modify scheduling algorithms',
          'Train project managers',
          'Implement automated alerts'
        ]
      }
    ]);
  };

  // Helper functions
  const getImpactColor = (impact: string | number) => {
    if (typeof impact === 'string') {
      switch (impact) {
        case 'critical': return 'text-red-600';
        case 'high': return 'text-orange-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-green-600';
        default: return 'text-gray-600';
      }
    }
    if (impact >= 8) return 'text-red-600';
    if (impact >= 6) return 'text-orange-600';
    if (impact >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  // Chart data
  const accuracyData = models.map(model => ({
    name: model.name.split(' ')[0],
    accuracy: model.accuracy,
    type: model.type
  }));

  const predictionsOverTime = [
    { month: 'Oct', predictions: 12, accuracy: 89 },
    { month: 'Nov', predictions: 18, accuracy: 91 },
    { month: 'Dec', predictions: 15, accuracy: 93 },
    { month: 'Jan', predictions: 22, accuracy: 94 },
    { month: 'Feb', predictions: 28, accuracy: 92 }
  ];

  const costSavingsData = [
    { category: 'Maintenance', current: 45000, optimized: 29250, savings: 15750 },
    { category: 'Fuel', current: 28000, optimized: 22400, savings: 5600 },
    { category: 'Labor', current: 120000, optimized: 108000, savings: 12000 },
    { category: 'Materials', current: 85000, optimized: 76500, savings: 8500 }
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 65, color: '#22c55e' },
    { name: 'Medium Risk', value: 25, color: '#eab308' },
    { name: 'High Risk', value: 8, color: '#f97316' },
    { name: 'Critical Risk', value: 2, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Predictive Analytics & AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced machine learning insights for business optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Models
          </Button>
        </div>
      </div>

      {/* AI Model Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    model.status === 'active' ? 'bg-green-500' : 
                    model.status === 'training' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <CardTitle className="text-sm">{model.name}</CardTitle>
                </div>
                <Badge variant="outline">{model.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Accuracy</span>
                  <span className="font-bold text-green-600">{model.accuracy}%</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
                <p className="text-xs text-muted-foreground">{model.description}</p>
                <div className="text-xs text-muted-foreground">
                  Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{predictions.length}</div>
                <div className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +3 from last week
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">91.2%</div>
                <div className="text-xs text-muted-foreground">
                  Average across all models
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$41,850</div>
                <div className="text-xs text-muted-foreground">
                  Monthly optimization potential
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">Medium</div>
                <div className="text-xs text-muted-foreground">
                  Overall business risk level
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{prediction.targetEntity}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {prediction.predictionType.replace('_', ' ')} prediction
                    </p>
                    <Badge className={`mt-2 ${getPriorityBadge(prediction.impact)}`}>
                      {prediction.impact} impact
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {prediction.confidence.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Predicted Date</div>
                    <div className="font-medium">{new Date(prediction.predictedDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Estimated Cost</div>
                    <div className="font-medium">${prediction.details.estimatedCost?.toLocaleString() || 'N/A'}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule Action
                  </Button>
                  <Button size="sm" variant="outline">
                    <Info className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">{insight.category}</Badge>
                      <Badge variant="secondary" className="capitalize">{insight.timeframe.replace('_', ' ')}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getImpactColor(insight.impact)}`}>
                      {insight.impact.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Impact Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                    <div className="font-medium">{insight.confidence.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Actionable</div>
                    <div className="font-medium">{insight.actionable ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Potential Savings</div>
                    <div className="font-medium text-green-600">
                      ${insight.metrics.monthlySavings?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <Zap className="h-3 w-3 mr-1" />
                    Implement
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    View Analysis
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="space-y-4">
            {optimizations.map((opt) => (
              <Card key={opt.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">{opt.area}</Badge>
                      <Badge className={getPriorityBadge(opt.priority)}>{opt.priority}</Badge>
                      <Badge variant="secondary" className="capitalize">{opt.difficulty}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{opt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {opt.roi}%
                    </div>
                    <div className="text-sm text-muted-foreground">ROI</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Potential Savings</div>
                    <div className="font-medium text-green-600">${opt.potentialSavings.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Implementation Cost</div>
                    <div className="font-medium">${opt.implementationCost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time to Implement</div>
                    <div className="font-medium">{opt.timeToImplement} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Benefit</div>
                    <div className="font-medium text-green-600">
                      ${(opt.potentialSavings - opt.implementationCost).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Implementation Steps:</h4>
                  <ol className="space-y-1">
                    {opt.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Start Implementation
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    Get Detailed Plan
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Detailed Analytics Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Accuracy Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="predictions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costSavingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#ef4444" name="Current Cost" />
                    <Bar dataKey="optimized" fill="#22c55e" name="Optimized Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">94.2%</div>
                  <div className="text-sm text-muted-foreground">Best Model Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">$41.8K</div>
                  <div className="text-sm text-muted-foreground">Monthly Savings Potential</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">28</div>
                  <div className="text-sm text-muted-foreground">Active Predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">15</div>
                  <div className="text-sm text-muted-foreground">Optimization Opportunities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}