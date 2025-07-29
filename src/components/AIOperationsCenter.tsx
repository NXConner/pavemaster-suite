import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Cpu, Zap, TrendingUp, AlertTriangle, Target, Activity, 
  BarChart3, PieChart, LineChart, Radar, Globe, Satellite, Shield,
  Eye, Camera, Mic, Radio, Database, Server, HardDrive, Network,
  Gauge, Timer, Clock, Calendar, Users, MapPin, Car, DollarSign,
  Settings, Play, Pause, RotateCcw, Save, Download, Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIModel {
  id: string;
  name: string;
  type: 'predictive' | 'classification' | 'optimization' | 'anomaly_detection' | 'nlp' | 'computer_vision';
  status: 'training' | 'active' | 'inactive' | 'error';
  accuracy: number;
  last_trained: string;
  prediction_confidence: number;
  resource_usage: number;
}

interface PredictiveInsight {
  id: string;
  category: 'cost' | 'productivity' | 'safety' | 'resource' | 'schedule' | 'risk';
  prediction: string;
  confidence: number;
  impact_score: number;
  recommended_actions: string[];
  time_horizon: '1h' | '24h' | '7d' | '30d' | '90d';
  created_at: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger_condition: string;
  action: string;
  is_active: boolean;
  execution_count: number;
  last_executed: string;
  success_rate: number;
  impact_metrics: {
    cost_savings: number;
    time_saved: number;
    efficiency_gain: number;
  };
}

interface PerformanceMetric {
  metric_name: string;
  current_value: number;
  predicted_value: number;
  trend: 'up' | 'down' | 'stable';
  variance: number;
  confidence: number;
}

const AIOperationsCenter: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeModels, setActiveModels] = useState<AIModel[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [processingPower, setProcessingPower] = useState(75);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [autoExecute, setAutoExecute] = useState(false);
  const [militaryJargon, setMilitaryJargon] = useState(true);
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState<string>('24h');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const processingInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole && ['super_admin', 'admin'].includes(userRole)) {
      initializeAISystem();
      startAIProcessing();
    }

    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, [userRole, isAIEnabled]);

  const initializeAISystem = async () => {
    await Promise.all([
      loadAIModels(),
      generateInsights(),
      loadAutomationRules(),
      calculatePerformanceMetrics()
    ]);
  };

  const startAIProcessing = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }

    if (isAIEnabled) {
      processingInterval.current = setInterval(() => {
        runAIAnalysis();
      }, 30000); // Process every 30 seconds
    }
  };

  const loadAIModels = async () => {
    // Simulate AI model loading with realistic data
    const models: AIModel[] = [
      {
        id: 'cost_predictor',
        name: 'Cost Prediction Engine',
        type: 'predictive',
        status: 'active',
        accuracy: 94.2,
        last_trained: new Date().toISOString(),
        prediction_confidence: 91.5,
        resource_usage: 23
      },
      {
        id: 'productivity_optimizer',
        name: 'Productivity Optimization',
        type: 'optimization',
        status: 'active',
        accuracy: 87.8,
        last_trained: new Date().toISOString(),
        prediction_confidence: 89.2,
        resource_usage: 31
      },
      {
        id: 'anomaly_detector',
        name: 'Anomaly Detection System',
        type: 'anomaly_detection',
        status: 'active',
        accuracy: 96.1,
        last_trained: new Date().toISOString(),
        prediction_confidence: 93.7,
        resource_usage: 18
      },
      {
        id: 'route_optimizer',
        name: 'Route Optimization AI',
        type: 'optimization',
        status: 'active',
        accuracy: 92.4,
        last_trained: new Date().toISOString(),
        prediction_confidence: 88.9,
        resource_usage: 27
      },
      {
        id: 'safety_predictor',
        name: 'Safety Risk Assessment',
        type: 'classification',
        status: 'training',
        accuracy: 89.6,
        last_trained: new Date().toISOString(),
        prediction_confidence: 85.3,
        resource_usage: 15
      },
      {
        id: 'resource_allocator',
        name: 'Resource Allocation AI',
        type: 'optimization',
        status: 'active',
        accuracy: 91.7,
        last_trained: new Date().toISOString(),
        prediction_confidence: 90.2,
        resource_usage: 22
      }
    ];

    setActiveModels(models);
  };

  const generateInsights = async () => {
    const insights: PredictiveInsight[] = [
      {
        id: 'insight_1',
        category: 'cost',
        prediction: 'Project costs are projected to exceed budget by 12% in the next 7 days based on current spending patterns.',
        confidence: 94.2,
        impact_score: 8.5,
        recommended_actions: [
          'Implement cost control measures on non-essential expenses',
          'Reassign resources to optimize labor costs',
          'Negotiate with suppliers for bulk discounts'
        ],
        time_horizon: '7d',
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_2',
        category: 'productivity',
        prediction: 'Employee productivity could increase by 23% with optimized task scheduling and break intervals.',
        confidence: 89.1,
        impact_score: 7.8,
        recommended_actions: [
          'Implement dynamic break scheduling',
          'Optimize task assignments based on individual performance patterns',
          'Introduce productivity incentive programs'
        ],
        time_horizon: '30d',
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_3',
        category: 'safety',
        prediction: 'High risk of safety incidents detected in Zone 3 during evening shifts (85% probability).',
        confidence: 92.7,
        impact_score: 9.2,
        recommended_actions: [
          'Increase lighting in Zone 3',
          'Deploy additional safety personnel during evening shifts',
          'Implement mandatory safety checks every 2 hours'
        ],
        time_horizon: '24h',
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_4',
        category: 'resource',
        prediction: 'Equipment maintenance needs can be reduced by 18% through predictive maintenance scheduling.',
        confidence: 91.4,
        impact_score: 7.1,
        recommended_actions: [
          'Implement IoT sensors on critical equipment',
          'Schedule maintenance based on usage patterns',
          'Train technicians on predictive maintenance protocols'
        ],
        time_horizon: '90d',
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_5',
        category: 'schedule',
        prediction: 'Weather patterns suggest 67% chance of delays in outdoor projects next week.',
        confidence: 88.3,
        impact_score: 6.9,
        recommended_actions: [
          'Reschedule weather-sensitive tasks',
          'Prepare indoor backup activities',
          'Communicate schedule changes to all stakeholders'
        ],
        time_horizon: '7d',
        created_at: new Date().toISOString()
      }
    ];

    setInsights(insights);
  };

  const loadAutomationRules = async () => {
    const rules: AutomationRule[] = [
      {
        id: 'auto_clock',
        name: 'Automatic Clock Management',
        trigger_condition: 'Employee enters/exits geofence',
        action: 'Clock in/out employee automatically',
        is_active: true,
        execution_count: 1247,
        last_executed: new Date().toISOString(),
        success_rate: 98.2,
        impact_metrics: {
          cost_savings: 12500,
          time_saved: 340,
          efficiency_gain: 15.2
        }
      },
      {
        id: 'cost_alert',
        name: 'Budget Overrun Prevention',
        trigger_condition: 'Project cost exceeds 90% of budget',
        action: 'Send alert and suggest cost reduction measures',
        is_active: true,
        execution_count: 89,
        last_executed: new Date().toISOString(),
        success_rate: 94.7,
        impact_metrics: {
          cost_savings: 45600,
          time_saved: 120,
          efficiency_gain: 8.9
        }
      },
      {
        id: 'resource_optimization',
        name: 'Dynamic Resource Allocation',
        trigger_condition: 'Resource utilization below 70%',
        action: 'Redistribute resources to high-priority tasks',
        is_active: true,
        execution_count: 567,
        last_executed: new Date().toISOString(),
        success_rate: 91.3,
        impact_metrics: {
          cost_savings: 23800,
          time_saved: 890,
          efficiency_gain: 22.1
        }
      },
      {
        id: 'safety_monitoring',
        name: 'Proactive Safety Alerts',
        trigger_condition: 'Anomaly detected in safety metrics',
        action: 'Dispatch safety personnel and notify supervisors',
        is_active: true,
        execution_count: 156,
        last_executed: new Date().toISOString(),
        success_rate: 97.1,
        impact_metrics: {
          cost_savings: 78900,
          time_saved: 450,
          efficiency_gain: 12.7
        }
      }
    ];

    setAutomationRules(rules);
  };

  const calculatePerformanceMetrics = async () => {
    const metrics: PerformanceMetric[] = [
      {
        metric_name: 'Overall Efficiency',
        current_value: 87.3,
        predicted_value: 91.7,
        trend: 'up',
        variance: 2.1,
        confidence: 94.2
      },
      {
        metric_name: 'Cost Per Hour',
        current_value: 125.50,
        predicted_value: 118.30,
        trend: 'down',
        variance: 5.7,
        confidence: 89.8
      },
      {
        metric_name: 'Safety Score',
        current_value: 94.1,
        predicted_value: 96.8,
        trend: 'up',
        variance: 1.8,
        confidence: 92.5
      },
      {
        metric_name: 'Resource Utilization',
        current_value: 78.9,
        predicted_value: 84.2,
        trend: 'up',
        variance: 3.4,
        confidence: 87.1
      },
      {
        metric_name: 'Project Completion Rate',
        current_value: 89.6,
        predicted_value: 92.3,
        trend: 'up',
        variance: 2.9,
        confidence: 90.7
      }
    ];

    setPerformanceMetrics(metrics);
  };

  const runAIAnalysis = async () => {
    // Simulate AI processing
    await Promise.all([
      updateModelAccuracy(),
      generateNewInsights(),
      executeAutomationRules(),
      updatePerformanceMetrics()
    ]);
  };

  const updateModelAccuracy = async () => {
    setActiveModels(prev => prev.map(model => ({
      ...model,
      accuracy: Math.min(99.9, model.accuracy + (Math.random() - 0.5) * 0.5),
      prediction_confidence: Math.min(99.9, model.prediction_confidence + (Math.random() - 0.5) * 0.3),
      resource_usage: Math.max(5, Math.min(50, model.resource_usage + (Math.random() - 0.5) * 2))
    })));
  };

  const generateNewInsights = async () => {
    // Simulate new insight generation
    if (Math.random() > 0.8) {
      const newInsight: PredictiveInsight = {
        id: `insight_${Date.now()}`,
        category: (['cost', 'productivity', 'safety', 'resource', 'schedule', 'risk'] as const)[Math.floor(Math.random() * 6)],
        prediction: 'New AI-generated insight based on real-time data analysis.',
        confidence: 80 + Math.random() * 15,
        impact_score: 5 + Math.random() * 5,
        recommended_actions: ['AI-recommended action based on analysis'],
        time_horizon: (['1h', '24h', '7d', '30d', '90d'] as const)[Math.floor(Math.random() * 5)],
        created_at: new Date().toISOString()
      };

      setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
    }
  };

  const executeAutomationRules = async () => {
    setAutomationRules(prev => prev.map(rule => ({
      ...rule,
      execution_count: rule.execution_count + (Math.random() > 0.7 ? 1 : 0),
      success_rate: Math.min(99.9, rule.success_rate + (Math.random() - 0.5) * 0.1),
      impact_metrics: {
        cost_savings: rule.impact_metrics.cost_savings + Math.random() * 100,
        time_saved: rule.impact_metrics.time_saved + Math.random() * 10,
        efficiency_gain: Math.min(30, rule.impact_metrics.efficiency_gain + Math.random() * 0.2)
      }
    })));
  };

  const updatePerformanceMetrics = async () => {
    setPerformanceMetrics(prev => prev.map(metric => ({
      ...metric,
      current_value: metric.predicted_value + (Math.random() - 0.5) * metric.variance,
      predicted_value: metric.predicted_value + (Math.random() - 0.5) * 1
    })));
  };

  const trainModel = async (modelId: string) => {
    setActiveModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'training' }
        : model
    ));

    // Simulate training process
    setTimeout(() => {
      setActiveModels(prev => prev.map(model => 
        model.id === modelId 
          ? { 
              ...model, 
              status: 'active',
              accuracy: Math.min(99.9, model.accuracy + Math.random() * 2),
              last_trained: new Date().toISOString()
            }
          : model
      ));

      toast({
        title: "Model Training Complete",
        description: `${modelId} has been successfully retrained with improved accuracy.`
      });
    }, 5000);
  };

  const exportInsights = () => {
    const dataStr = JSON.stringify({
      insights,
      performanceMetrics,
      automationRules,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      case 'safety': return <Shield className="h-4 w-4" />;
      case 'resource': return <Database className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <TrendingUp className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'anomaly_detection': return <AlertTriangle className="h-4 w-4" />;
      case 'classification': return <BarChart3 className="h-4 w-4" />;
      case 'nlp': return <Mic className="h-4 w-4" />;
      case 'computer_vision': return <Eye className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">AI Access Restricted</h2>
          <p className="text-muted-foreground">
            {getJargonText(
              'Administrative access required for AI Operations Center',
              'Command authorization required for AI Intelligence Systems'
            )}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {getJargonText('AI Operations Center', 'Artificial Intelligence Command')}
            </h1>
          </div>
          <Badge variant={isAIEnabled ? "default" : "secondary"} className="animate-pulse">
            {isAIEnabled ? 'AI ACTIVE' : 'AI STANDBY'}
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Processing</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <span>{activeModels.filter(m => m.status === 'active').length} Models Active</span>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="military-jargon"
              checked={militaryJargon}
              onCheckedChange={setMilitaryJargon}
            />
            <Label htmlFor="military-jargon" className="text-xs">
              {getJargonText('Military', 'Tactical')}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ai-enabled"
              checked={isAIEnabled}
              onCheckedChange={(checked) => {
                setIsAIEnabled(checked);
                if (checked) {
                  startAIProcessing();
                }
              }}
            />
            <Label htmlFor="ai-enabled" className="text-xs">AI Processing</Label>
          </div>

          <Button variant="outline" onClick={exportInsights}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing Power</p>
                <p className="text-2xl font-bold">{processingPower}%</p>
              </div>
              <Cpu className="h-8 w-8 text-primary" />
            </div>
            <Progress value={processingPower} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Active Models', 'Operational Systems')}
                </p>
                <p className="text-2xl font-bold">{activeModels.filter(m => m.status === 'active').length}</p>
              </div>
              <Brain className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Insights Generated', 'Intelligence Reports')}
                </p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Automation Success', 'Mission Success Rate')}
                </p>
                <p className="text-2xl font-bold">
                  {automationRules.reduce((avg, rule) => avg + rule.success_rate, 0) / automationRules.length || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">
            {getJargonText('Insights', 'Intelligence')}
          </TabsTrigger>
          <TabsTrigger value="models">
            {getJargonText('AI Models', 'Systems')}
          </TabsTrigger>
          <TabsTrigger value="automation">
            {getJargonText('Automation', 'Protocols')}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {getJargonText('Performance', 'Metrics')}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {getJargonText('Settings', 'Configuration')}
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {getJargonText('Predictive Insights', 'Strategic Intelligence')}
            </h3>
            <Select value={selectedTimeHorizon} onValueChange={setSelectedTimeHorizon}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Next Hour</SelectItem>
                <SelectItem value="24h">Next 24 Hours</SelectItem>
                <SelectItem value="7d">Next 7 Days</SelectItem>
                <SelectItem value="30d">Next 30 Days</SelectItem>
                <SelectItem value="90d">Next 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights
              .filter(insight => selectedTimeHorizon === 'all' || insight.time_horizon === selectedTimeHorizon)
              .map(insight => (
              <Card key={insight.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <CardTitle className="text-sm font-medium capitalize">
                        {insight.category} {getJargonText('Analysis', 'Assessment')}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence.toFixed(1)}% confidence
                      </Badge>
                      <Badge variant={insight.impact_score > 8 ? "destructive" : insight.impact_score > 6 ? "default" : "secondary"}>
                        Impact: {insight.impact_score.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{insight.prediction}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium">
                      {getJargonText('Recommended Actions:', 'Tactical Recommendations:')}
                    </h5>
                    <ul className="text-xs space-y-1">
                      {insight.recommended_actions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Horizon: {insight.time_horizon}</span>
                      <span>{new Date(insight.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <h3 className="text-lg font-semibold">
            {getJargonText('AI Model Status', 'System Status')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeModels.map(model => (
              <Card key={model.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getModelTypeIcon(model.type)}
                      <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                    </div>
                    <Badge variant={
                      model.status === 'active' ? 'default' :
                      model.status === 'training' ? 'secondary' :
                      model.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {model.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Accuracy</span>
                      <span>{model.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Confidence</span>
                      <span>{model.prediction_confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={model.prediction_confidence} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Resource Usage</span>
                      <span>{model.resource_usage}%</span>
                    </div>
                    <Progress value={model.resource_usage} className="h-1" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => trainModel(model.id)}
                      disabled={model.status === 'training'}
                    >
                      {model.status === 'training' ? (
                        <>
                          <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                          Training
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Retrain
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <h3 className="text-lg font-semibold">
            {getJargonText('Automation Rules', 'Operational Protocols')}
          </h3>
          
          <div className="space-y-4">
            {automationRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Switch checked={rule.is_active} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Trigger:</strong> {rule.trigger_condition}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Action:</strong> {rule.action}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">{rule.success_rate.toFixed(1)}% Success</div>
                      <div className="text-xs text-muted-foreground">{rule.execution_count} executions</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        ${rule.impact_metrics.cost_savings.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Cost Savings</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {rule.impact_metrics.time_saved}h
                      </div>
                      <div className="text-xs text-muted-foreground">Time Saved</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        +{rule.impact_metrics.efficiency_gain.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Efficiency Gain</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <h3 className="text-lg font-semibold">
            {getJargonText('Performance Metrics', 'Operational Metrics')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {performanceMetrics.map(metric => (
              <Card key={metric.metric_name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{metric.metric_name}</h4>
                    <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}>
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Value</span>
                      <span className="font-medium">{metric.current_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Predicted Value</span>
                      <span className="font-medium text-primary">{metric.predicted_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Confidence</span>
                      <span className="font-medium">{metric.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <Progress value={metric.confidence} className="mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h3 className="text-lg font-semibold">
            {getJargonText('AI Configuration', 'System Configuration')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Processing Power Allocation: {processingPower}%</Label>
                  <Slider
                    value={[processingPower]}
                    onValueChange={(value) => setProcessingPower(value[0])}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Confidence Threshold: {confidenceThreshold}%</Label>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                    min={50}
                    max={99}
                    step={1}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-execute">Auto-execute Recommendations</Label>
                  <Switch
                    id="auto-execute"
                    checked={autoExecute}
                    onCheckedChange={setAutoExecute}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Advanced Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="advanced-metrics">Show Advanced Metrics</Label>
                  <Switch
                    id="advanced-metrics"
                    checked={showAdvancedMetrics}
                    onCheckedChange={setShowAdvancedMetrics}
                  />
                </div>
                
                {showAdvancedMetrics && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Neural Network Layers:</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Data Points:</span>
                      <span>2.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model Parameters:</span>
                      <span>847K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inference Time:</span>
                      <span>23ms</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIOperationsCenter;