import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ClipboardList,
  Truck,
  DollarSign,
  Shield,
  Users,
  Award
} from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useDashboard';
import type { DashboardMetric } from '../types';

const iconMap = {
  ClipboardList,
  Truck,
  DollarSign,
  Shield,
  Users,
  Award
};

export function DashboardMetrics() {
  const { metrics, isLoading, error } = useDashboardMetrics();

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} isLoading={isLoading} />
      ))}
    </div>
  );
}

interface MetricCardProps {
  metric: DashboardMetric;
  isLoading: boolean;
}

function MetricCard({ metric, isLoading }: MetricCardProps) {
  const Icon = iconMap[metric.icon as keyof typeof iconMap] || ClipboardList;
  
  const getChangeIcon = () => {
    if (metric.changeType === 'increase') return TrendingUp;
    if (metric.changeType === 'decrease') return TrendingDown;
    return Minus;
  };

  const getChangeColor = () => {
    if (metric.changeType === 'increase') return 'text-green-600';
    if (metric.changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  const getMetricColor = () => {
    switch (metric.color) {
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'green': return 'text-green-600 bg-green-50';
      case 'orange': return 'text-orange-600 bg-orange-50';
      case 'red': return 'text-red-600 bg-red-50';
      case 'purple': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const ChangeIcon = getChangeIcon();

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLoading ? 'opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${getMetricColor()}`}>
            <Icon className="h-4 w-4" />
          </div>
          {metric.change !== 0 && (
            <Badge variant="outline" className={`${getChangeColor()} border-current`}>
              <ChangeIcon className="h-3 w-3 mr-1" />
              {Math.abs(metric.change)}%
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatMetricValue(metric.value, metric.unit)}
          </p>
        </div>

        {/* Mini trend chart could go here */}
        <div className="mt-3 h-8 flex items-end space-x-1">
          {metric.trend.slice(-7).map((point, index) => (
            <div
              key={index}
              className={`bg-${metric.color}-200 rounded-sm flex-1`}
              style={{
                height: `${(point.value / Math.max(...metric.trend.map(t => t.value))) * 100}%`,
                minHeight: '2px'
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value}%`;
  }
  
  if (unit === 'points' && value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  
  if (typeof value === 'number' && value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  
  if (typeof value === 'number' && value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  
  return `${value}${unit !== 'projects' && unit !== 'incidents' && unit !== 'points' ? ' ' + unit : ''}`;
}