import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
// import { supabase } from '../integrations/supabase/client';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'optimization' | 'prediction' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
}

interface MLPrediction {
  category: string;
  prediction: string;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
}

export default function IntelligenceEngine() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
    generatePredictions();
  }, []);

  const fetchAIInsights = async () => {
    try {
      // Simulate AI insights generation
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'optimization',
          title: 'Equipment Utilization Opportunity',
          description: 'Truck #3 has been idle for 4+ hours. Consider reassigning to pending project.',
          confidence: 0.87,
          impact: 'medium',
          category: 'Operations',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Weather Impact Forecast',
          description: 'Rain expected tomorrow will delay 3 scheduled projects. Reschedule recommended.',
          confidence: 0.92,
          impact: 'high',
          category: 'Scheduling',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Material Cost Optimization',
          description: 'Switch to Supplier B for next order to save 12% on asphalt costs.',
          confidence: 0.78,
          impact: 'high',
          category: 'Procurement',
          timestamp: new Date().toISOString()
        },
        {
          id: '4',
          type: 'alert',
          title: 'Maintenance Alert',
          description: 'Compactor unit showing stress patterns. Schedule maintenance within 48 hours.',
          confidence: 0.94,
          impact: 'high',
          category: 'Maintenance',
          timestamp: new Date().toISOString()
        }
      ];
      
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = () => {
    const mockPredictions: MLPrediction[] = [
      {
        category: 'Project Completion',
        prediction: '94% on-time delivery rate this month',
        accuracy: 0.89,
        trend: 'up'
      },
      {
        category: 'Equipment Efficiency',
        prediction: '8% improvement in fuel economy',
        accuracy: 0.82,
        trend: 'up'
      },
      {
        category: 'Customer Satisfaction',
        prediction: '96% satisfaction score predicted',
        accuracy: 0.91,
        trend: 'stable'
      },
      {
        category: 'Revenue Forecast',
        prediction: '+15% revenue growth this quarter',
        accuracy: 0.76,
        trend: 'up'
      }
    ];
    
    setPredictions(mockPredictions);
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis process
    setTimeout(() => {
      fetchAIInsights();
      generatePredictions();
      setIsAnalyzing(false);
    }, 3000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'prediction': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'recommendation': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading AI Intelligence Engine...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="mr-3 h-8 w-8 text-purple-500" />
            Intelligence Engine
          </h1>
          <p className="text-muted-foreground">AI-powered insights and predictive analytics</p>
        </div>
        <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* ML Predictions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {predictions.map((prediction, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{prediction.category}</CardTitle>
              <span className="text-lg">{getTrendIcon(prediction.trend)}</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold mb-2">{prediction.prediction}</div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {Math.round(prediction.accuracy * 100)}% accuracy
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Recommendations</CardTitle>
          <CardDescription>Actionable insights powered by machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{insight.category}</span>
                    <span>{new Date(insight.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Model Performance</CardTitle>
            <CardDescription>Machine learning model accuracy and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Predictive Accuracy</span>
                <span className="text-sm font-bold">87.3%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.3%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recommendation Success</span>
                <span className="text-sm font-bold">92.1%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92.1%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Alert Precision</span>
                <span className="text-sm font-bold">94.7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94.7%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>AI system learning and improvement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">47,392</div>
                <p className="text-sm text-muted-foreground">Data Points Processed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1,247</div>
                <p className="text-sm text-muted-foreground">Successful Predictions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">856</div>
                <p className="text-sm text-muted-foreground">Optimizations Applied</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}