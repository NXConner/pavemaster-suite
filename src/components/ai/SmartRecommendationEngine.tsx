import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Activity,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Users,
  Calendar,
  DollarSign,
  Wrench,
  MapPin,
  Gauge,
  Award,
  Filter,
} from 'lucide-react';

// Recommendation Interfaces
interface Recommendation {
  id: string;
  type: 'optimization' | 'maintenance' | 'resource' | 'safety' | 'efficiency' | 'cost' | 'schedule';
  category: 'immediate' | 'short_term' | 'long_term' | 'strategic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  description: string;
  rationale: string;
  expectedImpact: {
    cost: number;
    time: number;
    quality: number;
    efficiency: number;
  };
  actions: RecommendationAction[];
  metadata: {
    projectId?: string;
    equipmentId?: string;
    userId?: string;
    location?: string;
    deadline?: Date;
  };
  timestamp: Date;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected' | 'implemented';
}

interface RecommendationAction {
  id: string;
  action: string;
  description: string;
  estimatedCost?: number;
  estimatedTime?: number;
  resources?: string[];
  dependencies?: string[];
}

interface UserBehaviorPattern {
  userId: string;
  patterns: {
    workingHours: { start: number; end: number; days: number[] };
    preferredActions: Map<string, number>;
    decisionSpeed: number;
    riskTolerance: 'low' | 'medium' | 'high';
    focusAreas: string[];
    responsePatterns: Map<string, number>;
  };
  analytics: {
    totalRecommendations: number;
    acceptanceRate: number;
    implementationRate: number;
    avgResponseTime: number;
    mostValuedCategories: string[];
  };
}

interface PredictiveInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'forecast';
  subject: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  evidence: string[];
  recommendations: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

interface ProjectAnalytics {
  projectId: string;
  metrics: {
    progress: number;
    efficiency: number;
    costVariance: number;
    timelineVariance: number;
    qualityScore: number;
    riskScore: number;
  };
  trends: {
    progressTrend: number[];
    costTrend: number[];
    qualityTrend: number[];
  };
  predictions: {
    completionDate: Date;
    finalCost: number;
    qualityOutcome: number;
    riskLevel: number;
  };
}

// Smart Recommendation Engine
class SmartRecommendationEngine {
  private recommendations: Map<string, Recommendation> = new Map();
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();
  private projectAnalytics: Map<string, ProjectAnalytics> = new Map();
  private insights: PredictiveInsight[] = [];
  private isLearning = true;

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine() {
    // Load historical data and initialize ML models
    this.loadHistoricalData();
    this.trainModels();
  }

  private loadHistoricalData() {
    // Simulate loading historical project data
    const sampleProjects = ['proj_1', 'proj_2', 'proj_3'];
    
    sampleProjects.forEach((projectId, index) => {
      this.projectAnalytics.set(projectId, {
        projectId,
        metrics: {
          progress: 40 + index * 20,
          efficiency: 85 + Math.random() * 10,
          costVariance: -5 + Math.random() * 10,
          timelineVariance: -2 + Math.random() * 8,
          qualityScore: 88 + Math.random() * 8,
          riskScore: 20 + Math.random() * 30,
        },
        trends: {
          progressTrend: this.generateTrendData(30),
          costTrend: this.generateTrendData(30, 100000),
          qualityTrend: this.generateTrendData(30, 85),
        },
        predictions: {
          completionDate: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000),
          finalCost: 150000 + index * 50000 + Math.random() * 25000,
          qualityOutcome: 85 + Math.random() * 10,
          riskLevel: 15 + Math.random() * 20,
        },
      });
    });
  }

  private generateTrendData(points: number, base = 50): number[] {
    const data: number[] = [];
    let current = base;
    for (let i = 0; i < points; i++) {
      current += (Math.random() - 0.5) * base * 0.1;
      data.push(Math.max(0, current));
    }
    return data;
  }

  private trainModels() {
    // Simulate ML model training
    console.log('Training recommendation models...');
    // In a real implementation, this would train various ML models
  }

  generateRecommendations(context: any): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Generate different types of recommendations
    recommendations.push(...this.generateOptimizationRecommendations(context));
    recommendations.push(...this.generateMaintenanceRecommendations(context));
    recommendations.push(...this.generateResourceRecommendations(context));
    recommendations.push(...this.generateSafetyRecommendations(context));
    recommendations.push(...this.generateCostRecommendations(context));
    
    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidence - a.confidence;
    });
  }

  private generateOptimizationRecommendations(context: any): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Workflow optimization
    recommendations.push({
      id: `opt_${Date.now()}_1`,
      type: 'optimization',
      category: 'short_term',
      priority: 'high',
      confidence: 0.87,
      title: 'Optimize Equipment Scheduling',
      description: 'Reorganize equipment allocation to reduce idle time and improve project efficiency.',
      rationale: 'Analysis shows 23% equipment idle time during peak hours. Optimized scheduling could improve efficiency by 15%.',
      expectedImpact: {
        cost: -8500,
        time: -3.2,
        quality: 2,
        efficiency: 15,
      },
      actions: [
        {
          id: 'action_1',
          action: 'Implement dynamic scheduling system',
          description: 'Deploy AI-powered equipment scheduling to minimize idle time',
          estimatedCost: 2500,
          estimatedTime: 5,
          resources: ['Project Manager', 'Equipment Coordinator'],
        },
        {
          id: 'action_2',
          action: 'Train operators on new schedule',
          description: 'Provide training sessions for equipment operators',
          estimatedCost: 1200,
          estimatedTime: 8,
          resources: ['Training Coordinator', 'Operators'],
        },
      ],
      metadata: {
        projectId: 'proj_1',
      },
      timestamp: new Date(),
      status: 'new',
    });

    // Process optimization
    recommendations.push({
      id: `opt_${Date.now()}_2`,
      type: 'optimization',
      category: 'immediate',
      priority: 'medium',
      confidence: 0.92,
      title: 'Streamline Material Delivery Process',
      description: 'Implement just-in-time delivery to reduce storage costs and material waste.',
      rationale: 'Current material storage costs are 18% above industry average. JIT delivery could reduce costs by $12,000.',
      expectedImpact: {
        cost: -12000,
        time: -1,
        quality: 3,
        efficiency: 8,
      },
      actions: [
        {
          id: 'action_1',
          action: 'Negotiate JIT contracts with suppliers',
          description: 'Establish agreements for just-in-time material delivery',
          estimatedCost: 0,
          estimatedTime: 10,
          resources: ['Procurement Manager', 'Legal'],
        },
      ],
      metadata: {},
      timestamp: new Date(),
      status: 'new',
    });

    return recommendations;
  }

  private generateMaintenanceRecommendations(context: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    recommendations.push({
      id: `maint_${Date.now()}_1`,
      type: 'maintenance',
      category: 'immediate',
      priority: 'critical',
      confidence: 0.94,
      title: 'Schedule Preventive Maintenance for Paver #3',
      description: 'Paver #3 shows early signs of hydraulic system wear and requires immediate attention.',
      rationale: 'Predictive analysis indicates 89% probability of hydraulic failure within 2 weeks if maintenance is delayed.',
      expectedImpact: {
        cost: -15000,
        time: -4,
        quality: 5,
        efficiency: 0,
      },
      actions: [
        {
          id: 'action_1',
          action: 'Schedule hydraulic system inspection',
          description: 'Complete hydraulic system inspection and fluid replacement',
          estimatedCost: 2500,
          estimatedTime: 6,
          resources: ['Maintenance Technician', 'Hydraulic Specialist'],
        },
      ],
      metadata: {
        equipmentId: 'paver_3',
      },
      timestamp: new Date(),
      status: 'new',
    });

    return recommendations;
  }

  private generateResourceRecommendations(context: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    recommendations.push({
      id: `resource_${Date.now()}_1`,
      type: 'resource',
      category: 'short_term',
      priority: 'medium',
      confidence: 0.81,
      title: 'Optimize Crew Size for Phase 2',
      description: 'Analysis suggests current crew size is 20% larger than optimal for upcoming work phase.',
      rationale: 'Productivity metrics indicate diminishing returns with current crew size. Optimization could save $8,000 weekly.',
      expectedImpact: {
        cost: -32000,
        time: 0,
        quality: 0,
        efficiency: 12,
      },
      actions: [
        {
          id: 'action_1',
          action: 'Reassign 3 crew members to other projects',
          description: 'Temporarily reassign excess crew to maximize utilization',
          estimatedCost: 0,
          estimatedTime: 2,
          resources: ['Project Manager', 'HR Coordinator'],
        },
      ],
      metadata: {
        projectId: 'proj_2',
      },
      timestamp: new Date(),
      status: 'new',
    });

    return recommendations;
  }

  private generateSafetyRecommendations(context: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    recommendations.push({
      id: `safety_${Date.now()}_1`,
      type: 'safety',
      category: 'immediate',
      priority: 'high',
      confidence: 0.96,
      title: 'Implement Additional Safety Measures for Intersection Work',
      description: 'Current safety setup for intersection work is below recommended standards for high-traffic areas.',
      rationale: 'Traffic analysis shows 40% higher vehicle volume than initially estimated. Enhanced safety measures required.',
      expectedImpact: {
        cost: 3500,
        time: 0.5,
        quality: 8,
        efficiency: -2,
      },
      actions: [
        {
          id: 'action_1',
          action: 'Deploy additional traffic control devices',
          description: 'Install extra cones, barriers, and signage for enhanced safety',
          estimatedCost: 2000,
          estimatedTime: 4,
          resources: ['Safety Officer', 'Traffic Control Crew'],
        },
      ],
      metadata: {
        location: 'Main St & 5th Ave',
      },
      timestamp: new Date(),
      status: 'new',
    });

    return recommendations;
  }

  private generateCostRecommendations(context: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    recommendations.push({
      id: `cost_${Date.now()}_1`,
      type: 'cost',
      category: 'long_term',
      priority: 'medium',
      confidence: 0.79,
      title: 'Consider Bulk Material Purchase for Q2 Projects',
      description: 'Bulk purchasing for upcoming Q2 projects could yield significant cost savings.',
      rationale: 'Market analysis shows 12% price increase expected in Q2. Bulk purchase now could save $25,000.',
      expectedImpact: {
        cost: -25000,
        time: 2,
        quality: 0,
        efficiency: 3,
      },
      actions: [
        {
          id: 'action_1',
          action: 'Negotiate bulk purchase agreements',
          description: 'Secure bulk pricing for Q2 material requirements',
          estimatedCost: 0,
          estimatedTime: 15,
          resources: ['Procurement Manager', 'Finance'],
        },
      ],
      metadata: {},
      timestamp: new Date(),
      status: 'new',
    });

    return recommendations;
  }

  analyzeUserBehavior(userId: string, interactions: any[]): UserBehaviorPattern {
    const existingPattern = this.userPatterns.get(userId) || {
      userId,
      patterns: {
        workingHours: { start: 8, end: 17, days: [1, 2, 3, 4, 5] },
        preferredActions: new Map(),
        decisionSpeed: 0.5,
        riskTolerance: 'medium',
        focusAreas: [],
        responsePatterns: new Map(),
      },
      analytics: {
        totalRecommendations: 0,
        acceptanceRate: 0,
        implementationRate: 0,
        avgResponseTime: 0,
        mostValuedCategories: [],
      },
    };

    // Analyze interactions to update patterns
    interactions.forEach(interaction => {
      existingPattern.analytics.totalRecommendations++;
      
      if (interaction.action === 'accepted') {
        existingPattern.analytics.acceptanceRate = 
          (existingPattern.analytics.acceptanceRate * (existingPattern.analytics.totalRecommendations - 1) + 1) / 
          existingPattern.analytics.totalRecommendations;
      }
    });

    this.userPatterns.set(userId, existingPattern);
    return existingPattern;
  }

  generatePredictiveInsights(projectId?: string): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Project completion predictions
    insights.push({
      id: `insight_${Date.now()}_1`,
      type: 'forecast',
      subject: 'Project Timeline',
      prediction: 'Highway Resurfacing project is likely to complete 3 days ahead of schedule',
      confidence: 0.87,
      timeframe: 'Next 2 weeks',
      evidence: [
        'Current progress is 12% ahead of baseline',
        'Weather forecast favorable for next 10 days',
        'No material delivery delays expected',
      ],
      recommendations: [
        'Consider moving up equipment deployment for next phase',
        'Reallocate crew for accelerated completion',
      ],
      impact: 'medium',
      timestamp: new Date(),
    });

    // Cost variance prediction
    insights.push({
      id: `insight_${Date.now()}_2`,
      type: 'trend',
      subject: 'Cost Management',
      prediction: 'Material costs trending 8% above budget across active projects',
      confidence: 0.92,
      timeframe: 'Current quarter',
      evidence: [
        'Asphalt prices increased 5% this month',
        'Fuel costs up 12% from last quarter',
        'Labor overtime 15% above planned',
      ],
      recommendations: [
        'Renegotiate material contracts for bulk pricing',
        'Implement fuel-efficient routing',
        'Optimize crew scheduling to reduce overtime',
      ],
      impact: 'high',
      timestamp: new Date(),
    });

    // Quality trend insight
    insights.push({
      id: `insight_${Date.now()}_3`,
      type: 'trend',
      subject: 'Quality Performance',
      prediction: 'Quality scores improving across all project types',
      confidence: 0.84,
      timeframe: 'Last 3 months',
      evidence: [
        'Average quality score increased from 82% to 89%',
        'Defect rate decreased by 23%',
        'Client satisfaction up 15%',
      ],
      recommendations: [
        'Document and standardize improved processes',
        'Share best practices across all teams',
        'Consider quality certification program',
      ],
      impact: 'medium',
      timestamp: new Date(),
    });

    // Risk prediction
    insights.push({
      id: `insight_${Date.now()}_4`,
      type: 'risk',
      subject: 'Equipment Reliability',
      prediction: 'Increased maintenance requirements expected for equipment over 5 years old',
      confidence: 0.91,
      timeframe: 'Next 6 months',
      evidence: [
        'Maintenance frequency up 25% for older equipment',
        'Parts availability decreasing for legacy models',
        'Downtime costs increased 18%',
      ],
      recommendations: [
        'Accelerate equipment replacement program',
        'Increase preventive maintenance frequency',
        'Negotiate extended parts warranty',
      ],
      impact: 'high',
      timestamp: new Date(),
    });

    return insights;
  }

  getPersonalizedRecommendations(userId: string, context: any): Recommendation[] {
    const userPattern = this.userPatterns.get(userId);
    const allRecommendations = this.generateRecommendations(context);
    
    if (!userPattern) return allRecommendations;

    // Personalize recommendations based on user behavior
    return allRecommendations.map(rec => {
      // Adjust confidence based on user's historical preferences
      let adjustedConfidence = rec.confidence;
      
      if (userPattern.patterns.riskTolerance === 'low' && rec.priority === 'critical') {
        adjustedConfidence *= 1.1;
      } else if (userPattern.patterns.riskTolerance === 'high' && rec.category === 'long_term') {
        adjustedConfidence *= 1.05;
      }

      return {
        ...rec,
        confidence: Math.min(1.0, adjustedConfidence),
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }

  getRecommendationAnalytics(): any {
    const allRecommendations = Array.from(this.recommendations.values());
    
    const analytics = {
      total: allRecommendations.length,
      byType: this.groupBy(allRecommendations, 'type'),
      byPriority: this.groupBy(allRecommendations, 'priority'),
      byStatus: this.groupBy(allRecommendations, 'status'),
      averageConfidence: allRecommendations.reduce((sum, r) => sum + r.confidence, 0) / allRecommendations.length,
      potentialSavings: allRecommendations.reduce((sum, r) => sum + Math.max(0, -r.expectedImpact.cost), 0),
      implementationRate: allRecommendations.filter(r => r.status === 'implemented').length / allRecommendations.length,
    };

    return analytics;
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}

export const SmartRecommendationEngine: React.FC = () => {
  const [engine] = useState(() => new SmartRecommendationEngine());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateNewRecommendations();
    generateInsights();
  }, []);

  const generateNewRecommendations = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const context = {
        userId: 'user_1',
        projectIds: ['proj_1', 'proj_2', 'proj_3'],
        currentDate: new Date(),
      };
      
      const newRecommendations = engine.generateRecommendations(context);
      setRecommendations(newRecommendations);
      setAnalytics(engine.getRecommendationAnalytics());
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInsights = () => {
    const newInsights = engine.generatePredictiveInsights();
    setInsights(newInsights);
  };

  const handleRecommendationAction = (recommendationId: string, action: 'accept' | 'reject' | 'implement') => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'implemented' }
        : rec
    ));
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterType !== 'all' && rec.type !== filterType) return false;
    if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp;
      case 'maintenance': return Wrench;
      case 'resource': return Users;
      case 'safety': return AlertTriangle;
      case 'efficiency': return Zap;
      case 'cost': return DollarSign;
      case 'schedule': return Calendar;
      default: return Lightbulb;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <CardTitle>Smart Recommendation Engine</CardTitle>
              <Badge variant="secondary">Phase 2.4</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isGenerating ? "default" : "secondary"}>
                {isGenerating ? <Activity className="h-3 w-3 mr-1 animate-spin" /> : <Brain className="h-3 w-3 mr-1" />}
                {isGenerating ? 'Analyzing' : 'Ready'}
              </Badge>
              <Button onClick={generateNewRecommendations} disabled={isGenerating}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Recommendations
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList>
              <TabsTrigger value="recommendations">
                <Star className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="insights">
                <TrendingUp className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="p-2 border rounded text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="optimization">Optimization</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="resource">Resource</option>
                      <option value="safety">Safety</option>
                      <option value="cost">Cost</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="p-2 border rounded text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <Badge variant="outline">
                      {filteredRecommendations.length} recommendations
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {filteredRecommendations.length > 0 ? (
                        <div className="space-y-3">
                          {filteredRecommendations.map((recommendation) => {
                            const Icon = getTypeIcon(recommendation.type);
                            return (
                              <div
                                key={recommendation.id}
                                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => setSelectedRecommendation(recommendation)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Icon className="h-4 w-4" />
                                    <Badge variant={getPriorityColor(recommendation.priority) as any}>
                                      {recommendation.priority}
                                    </Badge>
                                    <Badge variant="outline">{recommendation.type}</Badge>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(recommendation.confidence * 100)}%
                                  </span>
                                </div>
                                <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                                <p className="text-xs text-gray-600 mb-2">{recommendation.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    {recommendation.expectedImpact.cost < 0 && (
                                      <span className="text-green-600">
                                        Save ${Math.abs(recommendation.expectedImpact.cost).toLocaleString()}
                                      </span>
                                    )}
                                    {recommendation.expectedImpact.efficiency > 0 && (
                                      <span className="text-blue-600">
                                        +{recommendation.expectedImpact.efficiency}% efficiency
                                      </span>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {recommendation.status}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {isGenerating ? 'Generating recommendations...' : 'No recommendations match current filters'}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendation Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecommendation ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(selectedRecommendation.priority) as any}>
                            {selectedRecommendation.priority}
                          </Badge>
                          <Badge variant="outline">{selectedRecommendation.type}</Badge>
                          <Badge variant="secondary">{selectedRecommendation.category}</Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold">{selectedRecommendation.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{selectedRecommendation.description}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Rationale</Label>
                          <p className="text-sm mt-1">{selectedRecommendation.rationale}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Expected Impact</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex justify-between">
                              <span>Cost Impact:</span>
                              <span className={selectedRecommendation.expectedImpact.cost < 0 ? 'text-green-600' : 'text-red-600'}>
                                {selectedRecommendation.expectedImpact.cost < 0 ? '-' : '+'}$
                                {Math.abs(selectedRecommendation.expectedImpact.cost).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time Impact:</span>
                              <span className={selectedRecommendation.expectedImpact.time < 0 ? 'text-green-600' : 'text-red-600'}>
                                {selectedRecommendation.expectedImpact.time < 0 ? '-' : '+'}
                                {Math.abs(selectedRecommendation.expectedImpact.time)} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quality Impact:</span>
                              <span className="text-blue-600">+{selectedRecommendation.expectedImpact.quality}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Efficiency:</span>
                              <span className="text-green-600">+{selectedRecommendation.expectedImpact.efficiency}%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Action Items</Label>
                          <div className="space-y-2 mt-2">
                            {selectedRecommendation.actions.map((action, index) => (
                              <div key={action.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                <div className="font-medium">{index + 1}. {action.action}</div>
                                <div className="text-gray-600">{action.description}</div>
                                {action.estimatedCost && (
                                  <div className="text-xs mt-1">
                                    Cost: ${action.estimatedCost.toLocaleString()} | 
                                    Time: {action.estimatedTime} hours
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedRecommendation.status === 'new' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleRecommendationAction(selectedRecommendation.id, 'accept')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRecommendationAction(selectedRecommendation.id, 'reject')}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleRecommendationAction(selectedRecommendation.id, 'implement')}
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              Implement
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select a recommendation to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            insight.type === 'risk' ? 'destructive' :
                            insight.type === 'opportunity' ? 'default' :
                            insight.type === 'forecast' ? 'secondary' : 'outline'
                          }>
                            {insight.type}
                          </Badge>
                          <Badge variant={
                            insight.impact === 'critical' ? 'destructive' :
                            insight.impact === 'high' ? 'default' :
                            insight.impact === 'medium' ? 'secondary' : 'outline'
                          }>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>Confidence: {Math.round(insight.confidence * 100)}%</div>
                          <div>{insight.timeframe}</div>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{insight.subject}</h4>
                      <p className="text-sm mb-3">{insight.prediction}</p>
                      
                      <div className="mb-3">
                        <Label className="text-xs font-medium text-gray-600">Evidence:</Label>
                        <ul className="text-xs mt-1 space-y-1">
                          {insight.evidence.map((evidence, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <span className="text-gray-400">•</span>
                              <span>{evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Recommendations:</Label>
                        <ul className="text-xs mt-1 space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <span className="text-blue-400">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {analytics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{analytics.total}</p>
                      <p className="text-sm text-gray-600">Total Recommendations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{Math.round(analytics.averageConfidence * 100)}%</p>
                      <p className="text-sm text-gray-600">Avg Confidence</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">${(analytics.potentialSavings / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-gray-600">Potential Savings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{Math.round(analytics.implementationRate * 100)}%</p>
                      <p className="text-sm text-gray-600">Implementation Rate</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No analytics data available yet. Generate recommendations to see statistics.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendation Engine Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Machine Learning Engine</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Behavior Analysis</span>
                      </div>
                      <Badge variant="default">Learning</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Predictive Analytics</span>
                      </div>
                      <Badge variant="default">Advanced</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Real-time Processing</span>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div>
                      <Label className="text-sm font-medium">Recommendation Frequency</Label>
                      <select className="w-full p-2 border rounded-md mt-1">
                        <option>Real-time</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Minimum Confidence Threshold</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        defaultValue="0.7"
                        className="w-full mt-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">70% minimum confidence</div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Focus Areas</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['Cost Optimization', 'Safety', 'Efficiency', 'Quality', 'Schedule', 'Maintenance'].map((area) => (
                          <label key={area} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" defaultChecked />
                            <span>{area}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { SmartRecommendationEngine as SmartRecommendationEngineClass };
export type { Recommendation, PredictiveInsight, UserBehaviorPattern, ProjectAnalytics };