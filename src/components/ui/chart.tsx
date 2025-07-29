import * as React from 'react';
import { cn } from '@/lib/utils';

// Chart Container
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
  };
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    const id = React.useId();

    return (
      <div
        ref={ref}
        className={cn('relative aspect-auto w-full', className)}
        data-chart={id}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .map(
                ([key, value]) => `
                [data-chart="${id}"] {
                  --color-${key}: ${value.color || value.theme?.light || 'hsl(var(--muted))'};
                }
                .dark [data-chart="${id}"] {
                  --color-${key}: ${value.theme?.dark || value.color || 'hsl(var(--muted))'};
                }
              `
              )
              .join('\n'),
          }}
        />
        {children}
      </div>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

// Chart Tooltip
interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  config?: ChartConfig;
  labelKey?: string;
  nameKey?: string;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  className?: string;
}

export const ChartTooltip = ({
  active,
  payload,
  label,
  config = {},
  labelKey = 'label',
  nameKey = 'name',
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  className,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-2 shadow-md',
        className
      )}
    >
      {!hideLabel && label && (
        <div className="mb-2 border-b border-border pb-2 text-sm font-medium">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = item.dataKey || item.name;
          const itemConfig = config[key] || {};
          const color = itemConfig.color || item.color;
          
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {!hideIndicator && (
                <div
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    indicator === 'line' && 'h-[2px] w-3',
                    indicator === 'dashed' && 'h-[2px] w-3 border-dashed border-t'
                  )}
                  style={{
                    backgroundColor: indicator === 'dashed' ? undefined : color,
                    borderColor: indicator === 'dashed' ? color : undefined,
                  }}
                />
              )}
              <span className="font-medium">
                {itemConfig.label || item[nameKey] || key}:
              </span>
              <span className="ml-auto font-mono">
                {typeof item.value === 'number' 
                  ? item.value.toLocaleString() 
                  : item.value
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Chart Legend
interface ChartLegendProps {
  config?: ChartConfig;
  payload?: any[];
  verticalAlign?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const ChartLegend = ({
  config = {},
  payload = [],
  verticalAlign = 'bottom',
  align = 'center',
  className,
}: ChartLegendProps) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-4 text-sm',
        verticalAlign === 'top' && 'mb-4',
        verticalAlign === 'bottom' && 'mt-4',
        align === 'center' && 'justify-center',
        align === 'left' && 'justify-start',
        align === 'right' && 'justify-end',
        className
      )}
    >
      {payload.map((item, index) => {
        const key = item.dataKey || item.value;
        const itemConfig = config[key] || {};
        const color = itemConfig.color || item.color;

        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">
              {itemConfig.label || item.value || key}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Chart Styles Hook
export const useChartConfig = (config: ChartConfig) => {
  return React.useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    Object.entries(config).forEach(([key, value]) => {
      styles[key] = {
        '--color': value.color || value.theme?.light || 'hsl(var(--muted))',
      } as React.CSSProperties;
    });

    return styles;
  }, [config]);
};

// Chart Grid Component
interface ChartGridProps extends React.HTMLAttributes<HTMLDivElement> {
  horizontal?: boolean;
  vertical?: boolean;
}

export const ChartGrid = React.forwardRef<HTMLDivElement, ChartGridProps>(
  ({ className, horizontal = true, vertical = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 pointer-events-none',
        horizontal && 'border-grid-horizontal',
        vertical && 'border-grid-vertical',
        className
      )}
      {...props}
    />
  )
);
ChartGrid.displayName = 'ChartGrid';

// Chart Area Component
interface ChartAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const ChartArea = React.forwardRef<HTMLDivElement, ChartAreaProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
);
ChartArea.displayName = 'ChartArea';

export { ChartContainer as Chart };