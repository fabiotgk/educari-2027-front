import * as React from 'react';

import { cn } from '@/lib/utils';

/** Bloco de pares rótulo/valor (usado dentro de cards nas páginas de detalhe). */
export function DetailGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
      )}
    >
      {children}
    </dl>
  );
}

/** Par rótulo/valor. `full` ocupa a linha inteira. */
export function DetailField({
  label,
  value,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn(full && 'sm:col-span-full')}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">
        {value === null || value === undefined || value === '' ? '—' : value}
      </dd>
    </div>
  );
}
