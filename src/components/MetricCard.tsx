import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className={cn("transition-all duration-300 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          {change && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              change.positive ? "text-success" : "text-destructive"
            )}>
              <span className={cn(
                "mr-1",
                change.positive ? "text-success" : "text-destructive"
              )}>
                {change.positive ? "↗" : "↘"}
              </span>
              {change.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}