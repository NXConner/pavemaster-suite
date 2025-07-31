import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Clock, Database } from 'lucide-react';

export function RealtimeDashboard() {
  const stats = [
    {
      title: 'System Status',
      value: 'Online',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '127',
      icon: Zap,
      color: 'text-blue-600'
    },
    {
      title: 'Uptime',
      value: '99.9%',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Database',
      value: 'Healthy',
      icon: Database,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-2">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-sm font-medium">{stat.title}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}