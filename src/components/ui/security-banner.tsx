import { AlertTriangle, Shield, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface SecurityBannerProps {
  level: 'secure' | 'warning' | 'critical';
  message: string;
  details?: string;
}

export function SecurityBanner({ level, message, details }: SecurityBannerProps) {
  const getIcon = () => {
    switch (level) {
      case 'secure':
        return <Check className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <Shield className="h-4 w-4 text-destructive" />;
    }
  };

  const getBadgeVariant = () => {
    switch (level) {
      case 'secure':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
    }
  };

  const getAlertClassName = () => {
    switch (level) {
      case 'secure':
        return 'border-success/20 bg-success/5';
      case 'warning':
        return 'border-warning/20 bg-warning/5';
      case 'critical':
        return 'border-destructive/20 bg-destructive/5';
    }
  };

  return (
    <Alert className={getAlertClassName()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{message}</span>
              <Badge variant={getBadgeVariant()} className="text-xs">
                {level.toUpperCase()}
              </Badge>
            </div>
            {details && (
              <AlertDescription className="mt-1 text-xs">
                {details}
              </AlertDescription>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}