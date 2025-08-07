import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Settings,
} from 'lucide-react';

interface IntelligenceInsight {
  id: string;
  type: 'recommendation' | 'prediction' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  data?: any;
}

const MOCK_INSIGHTS: IntelligenceInsight[] = [
  {
    id: '1',
    type: 'prediction',
    title: 'Weather Impact Forecast',
    description: 'Rain predicted in 48 hours may delay current projects by 6-8 hours. Recommend rescheduling outdoor operations.',
    confidence: 87,
    impact: 'high',
    actionable: true,
  },
  {
    id: '2',
    type: 'optimization',
    title: 'Route Optimization',
    description: 'Alternative routing for Crew B could reduce travel time by 23% and fuel costs by $45 daily.',
    confidence: 94,
    impact: 'medium',
    actionable: true,
  },
  {
    id: '3',
    type: 'alert',
    title: 'Equipment Maintenance Due',
    description: 'Compactor Unit-7 showing patterns consistent with upcoming maintenance needs within 72 hours.',
    confidence: 76,
    impact: 'high',
    actionable: true,
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Material Procurement',
    description: 'Asphalt prices expected to increase 8% next month. Consider bulk purchase to save approximately $2,400.',
    confidence: 82,
    impact: 'medium',
    actionable: true,
  },
];

export function IntelligenceEngine() {
  const [insights] = useState<IntelligenceInsight[]>(MOCK_INSIGHTS);
  const [selectedInsight, setSelectedInsight] = useState<IntelligenceInsight | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'optimization': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) { return 'text-green-500'; }
    if (confidence >= 60) { return 'text-yellow-500'; }
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Intelligence Engine
            <Badge variant="outline" className="ml-2">
              {insights.filter(i => i.actionable).length} Actionable
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights List */}
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`border/50 bg-surface/80 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/50 ${
                selectedInsight?.id === insight.id ? 'border-primary/50 bg-primary/5' : ''
              }`}
              onClick={() => { setSelectedInsight(insight); }}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(insight.type)}
                      <span className="text-sm font-medium capitalize">{insight.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                        {insight.impact} impact
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}%
                      </span>
                    </div>
                    <div className="w-16 h-1.5 bg-muted rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${getConfidenceColor(insight.confidence).replace('text-', 'bg-')}`}
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insight Details */}
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Insight Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInsight ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedInsight.type)}
                  <span className="font-medium capitalize">{selectedInsight.type}</span>
                  <Badge variant={getImpactColor(selectedInsight.impact)}>
                    {selectedInsight.impact} impact
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{selectedInsight.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedInsight.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Confidence Level</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div
                          className={`h-2 rounded-full ${getConfidenceColor(selectedInsight.confidence).replace('text-', 'bg-')}`}
                          style={{ width: `${selectedInsight.confidence}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getConfidenceColor(selectedInsight.confidence)}`}>
                        {selectedInsight.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Impact Level</span>
                    <Badge variant={getImpactColor(selectedInsight.impact)} className="w-full justify-center">
                      {selectedInsight.impact.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {selectedInsight.actionable && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Recommended Actions:</span>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Implement Recommendation
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Brain className="h-4 w-4 mr-2" />
                        Request More Analysis
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Schedule Review
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an insight to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Predictions</div>
                <div className="text-2xl font-bold">
                  {insights.filter(i => i.type === 'prediction').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Optimizations</div>
                <div className="text-2xl font-bold">
                  {insights.filter(i => i.type === 'optimization').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Recommendations</div>
                <div className="text-2xl font-bold">
                  {insights.filter(i => i.type === 'recommendation').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}