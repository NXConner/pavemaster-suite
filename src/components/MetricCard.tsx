import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  return (
    <Card className={cn('group transition-all duration-300 hover:shadow-lg hover:scale-105', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          {change && (
            <div className={cn(
              'flex items-center text-sm font-medium',
              change.positive ? 'text-green-600' : 'text-red-600',
            )}>
              <span className={cn(
                'mr-1',
                change.positive ? 'text-green-600' : 'text-red-600',
              )}>
                {change.positive ? '↗' : '↘'}
              </span>
              {change.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}