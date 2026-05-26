import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ProgressBar({ value, className }: { value: number | null; className?: string }) {
  const safeValue = value == null ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progresso</span>
        <span className="font-medium tabular-nums text-foreground">{formatPercent(safeValue, 0)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
