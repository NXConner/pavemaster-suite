import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  className,
  trend = 'stable',
  description,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'group relative transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        className,
      )}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300',
              'bg-gradient-to-br from-primary/20 to-primary/10 text-primary',
              'group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg',
              'group-hover:from-primary/30 group-hover:to-primary/20',
            )}>
              <div className="transition-transform duration-300 group-hover:scale-110">
                {icon}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground transition-all duration-300 group-hover:scale-105">
                {value}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-muted-foreground/80">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {/* Trend indicator */}
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
              trend === 'up' && 'bg-success/20 text-success',
              trend === 'down' && 'bg-destructive/20 text-destructive',
              trend === 'stable' && 'bg-muted text-muted-foreground',
              'group-hover:scale-110',
            )}>
              {trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4" />}
              {trend === 'stable' && <div className="w-3 h-0.5 bg-current rounded" />}
            </div>

            {/* Change percentage */}
            {change && (
              <div className={cn(
                'flex items-center text-sm font-medium transition-all duration-300',
                change.positive ? 'text-success' : 'text-destructive',
                'group-hover:scale-105',
              )}>
                <span className={cn(
                  'mr-1 transition-transform duration-300 group-hover:scale-110',
                  change.positive ? 'text-success' : 'text-destructive',
                )}>
                  {change.positive ? '↗' : '↘'}
                </span>
                {change.value}
              </div>
            )}
          </div>
        </div>

        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}