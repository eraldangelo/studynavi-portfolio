import * as React from 'react';
import { cn } from '@/lib/core/utils';
import type { ChartConfig } from '@/components/ui/layout/chart-shared';
import { getPayloadConfigFromPayload } from '@/components/ui/layout/chart-shared';

type ChartLegendContentViewProps = React.ComponentProps<'div'>
  & { payload?: any; verticalAlign?: string }
  & {
    config: ChartConfig;
    hideIcon?: boolean;
    nameKey?: string;
  };

export const ChartLegendContentView = React.forwardRef<HTMLDivElement, ChartLegendContentViewProps>(
  ({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey, config }, ref) => {
    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className,
        )}
      >
        {payload.map((item: any) => {
          const key = `${nameKey || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn('flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground')}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  },
);

ChartLegendContentView.displayName = 'ChartLegendContentView';
