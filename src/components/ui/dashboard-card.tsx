import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description?: string;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  } | undefined;
  action?: {
    label: string;
    href: string;
    variant?: 'default' | 'outline' | 'ghost';
  };
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  value,
  trend,
  action,
  icon,
  className,
  children,
}: DashboardCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {value && (
          <div className="text-2xl font-bold mb-1">{value}</div>
        )}

        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
            )}
            <span className={trend.isPositive ? 'text-success' : 'text-destructive'}>
              {trend.value}%
            </span>
            <span className="ml-1">{trend.label}</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mb-4">{description}</p>
        )}

        {children}

        {action && (
          <Button
            variant={action.variant || 'default'}
            size="sm"
            className="w-full mt-4"
            asChild
          >
            <a href={action.href} className="flex items-center justify-center">
              {action.label}
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}