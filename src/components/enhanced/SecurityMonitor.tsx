import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export function SecurityMonitor() {
  const securityMetrics = [
    {
      title: 'Security Status',
      value: 'Secure',
      icon: Shield,
      status: 'good'
    },
    {
      title: 'Failed Logins',
      value: '0',
      icon: Lock,
      status: 'good'
    },
    {
      title: 'Active Sessions',
      value: '24',
      icon: CheckCircle,
      status: 'good'
    },
    {
      title: 'Threats Blocked',
      value: '7',
      icon: AlertTriangle,
      status: 'warning'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {securityMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const statusColor = metric.status === 'good' ? 'text-green-600' : 
                               metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
            
            return (
              <div key={index} className="text-center p-2">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${statusColor}`} />
                <div className="text-sm font-medium">{metric.title}</div>
                <div className="text-lg font-bold">{metric.value}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}