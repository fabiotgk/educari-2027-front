'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; positive: boolean };
  icon: keyof typeof Icons;
  accent?: 'primary' | 'success' | 'warning' | 'danger';
  href?: string;
  index?: number;
}

const ACCENT_COLORS = {
  primary: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
  warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
  danger: 'text-rose-600 bg-rose-50 dark:bg-rose-950',
} as const;

export function MetricCard({
  label,
  value,
  delta,
  icon,
  accent = 'primary',
  index = 0,
}: MetricCardProps) {
  const IconComponent = (Icons[icon] as React.ComponentType<{ className?: string }>) ?? Icons.Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </CardTitle>
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', ACCENT_COLORS[accent])}>
            <IconComponent className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {delta && (
            <p className={cn(
              'text-xs flex items-center gap-1 mt-1',
              delta.positive ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {delta.positive ? <Icons.TrendingUp className="h-3 w-3" /> : <Icons.TrendingDown className="h-3 w-3" />}
              <span>{delta.positive ? '+' : ''}{delta.value}% vs. semana anterior</span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
