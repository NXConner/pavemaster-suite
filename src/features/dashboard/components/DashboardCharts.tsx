import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Maximize } from 'lucide-react';
import { useDashboardCharts } from '../hooks/useDashboard';

export function DashboardCharts() {
  const { charts, isLoading, error } = useDashboardCharts();

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load charts</p>
        </CardContent>
      </Card>
    );
  }

  if (charts.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center">No charts available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <Button variant="outline" size="sm">
          View All Charts
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <ChartCard key={chart.id} chart={chart} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
}

interface ChartCardProps {
  chart: any;
  isLoading: boolean;
}

function ChartCard({ chart, isLoading }: ChartCardProps) {
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLoading ? 'opacity-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{chart.title}</CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          {chart.type === 'line' && <LineChartPlaceholder data={chart.data} />}
          {chart.type === 'bar' && <BarChartPlaceholder data={chart.data} />}
          {chart.type === 'pie' && <PieChartPlaceholder data={chart.data} />}
          {chart.type === 'area' && <AreaChartPlaceholder data={chart.data} />}
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder chart components (in a real app, you'd use a charting library like recharts)
function LineChartPlaceholder({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full flex items-end justify-between space-x-2 px-4">
      {data.map((point, index) => (
        <div key={index} className="flex flex-col items-center space-y-2">
          <div
            className="bg-blue-500 rounded-t-sm w-8"
            style={{
              height: `${(point.y / Math.max(...data.map(d => d.y))) * 80}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-gray-500 rotate-45 origin-bottom-left">
            {point.x}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarChartPlaceholder({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full flex items-end justify-between space-x-2 px-4">
      {data.map((point, index) => (
        <div key={index} className="flex flex-col items-center space-y-2">
          <div
            className="bg-green-500 rounded-t w-12"
            style={{
              height: `${(point.y / Math.max(...data.map(d => d.y))) * 80}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-gray-500 text-center">
            {point.x}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieChartPlaceholder({ data }: { data: any[] }) {
  const total = data.reduce((sum, point) => sum + point.y, 0);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg width="192" height="192" className="transform -rotate-90">
          {data.map((point, index) => {
            const percentage = (point.y / total) * 100;
            const strokeDasharray = `${percentage * 2.51} 251`;
            const strokeDashoffset = -index * 2.51 * (data.slice(0, index).reduce((sum, p) => sum + p.y, 0) / total);
            
            return (
              <circle
                key={index}
                cx="96"
                cy="96"
                r="40"
                fill="none"
                stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AreaChartPlaceholder({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full flex items-end justify-between space-x-1 px-4">
      {data.map((point, index) => (
        <div key={index} className="flex flex-col items-center space-y-2">
          <div
            className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm w-6"
            style={{
              height: `${(point.y / Math.max(...data.map(d => d.y))) * 80}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-gray-500">
            {point.x}
          </span>
        </div>
      ))}
    </div>
  );
}