'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BarPoint {
  label: string;
  value: number;
}

/** Gráfico de barras simples (CSS), sem dependência de lib de chart. */
export function BarChart({
  title,
  subtitle,
  data,
  suffix = '',
}: {
  title: string;
  subtitle?: string;
  data: BarPoint[];
  suffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-2">
          {data.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="group relative w-full rounded-t-md bg-primary/85 transition-colors hover:bg-primary"
                  style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {d.value}
                    {suffix}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressItem {
  label: string;
  value: number; // 0..100
  hint?: string;
}

/** Lista com barras de progresso horizontais (ex: frequência por escola). */
export function ProgressList({
  title,
  items,
}: {
  title: string;
  items: ProgressItem[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {items.map((it) => (
          <div key={it.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="truncate">{it.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {it.hint ?? `${it.value}%`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full',
                  it.value >= 90 ? 'bg-emerald-500' : it.value >= 75 ? 'bg-amber-500' : 'bg-rose-500',
                )}
                style={{ width: `${it.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
