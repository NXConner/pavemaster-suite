import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Zap, 
  Eye, 
  Cpu, 
  BarChart3,
  TrendingUp,
  Target,
  Bot,
  Lightbulb,
  Cog,
  Camera,
  Mic,
  MessageSquare
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  type: 'predictive' | 'computer_vision' | 'nlp' | 'optimization' | 'anomaly_detection';
  status: 'training' | 'deployed' | 'testing' | 'idle';
  accuracy: number;
  lastTrained: Date;
  predictions: number;
  description: string;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
}

export default function AdvancedAI() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInsights, setProcessingInsights] = useState(false);

  useEffect(() => {
    // Simulate fetching AI models and insights
    const mockModels: AIModel[] = [
      {
        id: '1',
        name: 'Pavement Quality Predictor',
        type: 'predictive',
        status: 'deployed',
        accuracy: 94.2,
        lastTrained: new Date(Date.now() - 604800000), // 1 week ago
        predictions: 1247,
        description: 'Predicts pavement durability and maintenance needs based on materials and conditions'
      },
      {
        id: '2',
        name: 'Crack Detection Vision',
        type: 'computer_vision',
        status: 'deployed',
        accuracy: 96.8,
        lastTrained: new Date(Date.now() - 1209600000), // 2 weeks ago
        predictions: 856,
        description: 'Computer vision model for automated crack detection in asphalt surfaces'
      },
      {
        id: '3',
        name: 'Cost Optimization Engine',
        type: 'optimization',
        status: 'training',
        accuracy: 89.5,
        lastTrained: new Date(Date.now() - 86400000), // 1 day ago
        predictions: 432,
        description: 'Optimizes material usage and project costs based on historical data'
      },
      {
        id: '4',
        name: 'Equipment Failure Detector',
        type: 'anomaly_detection',
        status: 'deployed',
        accuracy: 91.7,
        lastTrained: new Date(Date.now() - 432000000), // 5 days ago
        predictions: 234,
        description: 'Detects anomalies in equipment behavior to predict maintenance needs'
      },
      {
        id: '5',
        name: 'Natural Language Processor',
        type: 'nlp',
        status: 'testing',
        accuracy: 87.3,
        lastTrained: new Date(Date.now() - 172800000), // 2 days ago
        predictions: 156,
        description: 'Processes customer feedback and project reports for sentiment analysis'
      }
    ];

    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'prediction',
        title: 'Equipment Maintenance Alert',
        description: 'Asphalt spreader #3 showing early signs of hydraulic system degradation. Recommend inspection within 48 hours.',
        confidence: 92,
        impact: 'high',
        category: 'Equipment',
        actionable: true
      },
      {
        id: '2',
        type: 'optimization',
        title: 'Route Optimization Opportunity',
        description: 'Current routing for next week can be optimized to reduce fuel costs by 18% and travel time by 25 minutes.',
        confidence: 87,
        impact: 'medium',
        category: 'Operations',
        actionable: true
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Material Purchase Timing',
        description: 'Market analysis suggests optimal timing for bulk asphalt purchase in 2-3 weeks based on price trends.',
        confidence: 84,
        impact: 'medium',
        category: 'Procurement',
        actionable: true
      },
      {
        id: '4',
        type: 'alert',
        title: 'Quality Control Warning',
        description: 'Recent project photos indicate potential surface irregularities. Recommend quality inspection.',
        confidence: 91,
        impact: 'high',
        category: 'Quality',
        actionable: true
      },
      {
        id: '5',
        type: 'prediction',
        title: 'Weather Impact Forecast',
        description: 'Upcoming weather patterns may affect scheduled projects. Consider rescheduling outdoor work for Thursday.',
        confidence: 78,
        impact: 'low',
        category: 'Weather',
        actionable: false
      }
    ];

    setModels(mockModels);
    setInsights(mockInsights);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-50';
      case 'training': return 'text-blue-600 bg-blue-50';
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      case 'idle': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <TrendingUp className="h-4 w-4" />;
      case 'computer_vision': return <Eye className="h-4 w-4" />;
      case 'nlp': return <MessageSquare className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'anomaly_detection': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'alert': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const handleGenerateInsights = async () => {
    setProcessingInsights(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add new insight
    const newInsight: AIInsight = {
      id: String(insights.length + 1),
      type: 'recommendation',
      title: 'New Optimization Opportunity',
      description: 'AI analysis identified potential for crew scheduling optimization to improve efficiency by 12%.',
      confidence: 89,
      impact: 'medium',
      category: 'Workforce',
      actionable: true
    };
    
    setInsights([newInsight, ...insights]);
    setProcessingInsights(false);
  };

  const handleRetrainModel = (modelId: string) => {
    setModels(models.map(model => 
      model.id === modelId 
        ? { ...model, status: 'training' as const, lastTrained: new Date() }
        : model
    ));

    // Simulate training completion
    setTimeout(() => {
      setModels(models.map(model => 
        model.id === modelId 
          ? { ...model, status: 'deployed' as const, accuracy: Math.min(100, model.accuracy + Math.random() * 2) }
          : model
      ));
    }, 5000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading AI systems...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced AI & Automation</h1>
          <p className="text-muted-foreground">
            Machine learning models and intelligent automation systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleGenerateInsights}
            disabled={processingInsights}
          >
            {processingInsights ? (
              <>
                <Cpu className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
          <Button className="gap-2">
            <Bot className="h-4 w-4" />
            New Model
          </Button>
        </div>
      </div>

      {/* AI Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(model.type)}
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(model.status)}>
                  {model.status}
                </Badge>
              </div>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accuracy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{model.accuracy.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Predictions</p>
                    <p className="font-medium">{model.predictions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Trained</p>
                    <p className="font-medium">{model.lastTrained.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRetrainModel(model.id)}
                    disabled={model.status === 'training'}
                  >
                    {model.status === 'training' ? (
                      <>
                        <Cpu className="h-3 w-3 mr-1 animate-spin" />
                        Training...
                      </>
                    ) : (
                      <>
                        <Cog className="h-3 w-3 mr-1" />
                        Retrain
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Metrics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>
            Intelligent recommendations and predictions from AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {insight.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {insight.type}
                    </Badge>
                  </div>
                  
                  {insight.actionable && (
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Computer Vision
            </CardTitle>
            <CardDescription>
              Automated visual inspection and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Crack Detection</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Surface Analysis</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Quality Assessment</span>
                <Badge variant="outline">Training</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Material Classification</span>
                <Badge variant="outline">Beta</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Natural Language Processing
            </CardTitle>
            <CardDescription>
              Text and speech analysis capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Report Analysis</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sentiment Analysis</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Voice Commands</span>
                <Badge variant="outline">Beta</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-Documentation</span>
                <Badge variant="outline">Development</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Optimization Engine
            </CardTitle>
            <CardDescription>
              Intelligent resource and process optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Route Optimization</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Resource Allocation</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cost Optimization</span>
                <Badge variant="outline">Training</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Schedule Optimization</span>
                <Badge variant="outline">Beta</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}