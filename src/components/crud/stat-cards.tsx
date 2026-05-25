'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface Stat {
  label: string;
  value: React.ReactNode;
  /** Nome de ícone lucide (ex: 'Users'). */
  icon?: string;
  hint?: string;
  /** Acento de cor do ícone. */
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'muted';
}

const ACCENT: Record<NonNullable<Stat['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  success: 'bg-emerald-500/10 text-emerald-600',
  warning: 'bg-amber-500/10 text-amber-600',
  muted: 'bg-muted text-muted-foreground',
};

/** Faixa de cards de estatística no topo da listagem. */
export function StatCards({ stats, loading }: { stats: Stat[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = s.icon
          ? (Icons[s.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
          : null;
        return (
          <Card key={i} className="flex flex-row items-center gap-4 p-4">
            {Icon && (
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg',
                  ACCENT[s.accent ?? 'primary'],
                )}
              >
                <Icon className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">{s.label}</p>
              {loading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</p>
              )}
              {s.hint && <p className="text-xs text-muted-foreground">{s.hint}</p>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
