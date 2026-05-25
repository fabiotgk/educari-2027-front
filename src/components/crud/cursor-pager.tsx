'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PER_PAGE_OPTIONS = [25, 50, 100, 200];

/**
 * Paginação por cursor (o backend usa cursorPaginate). Avança/volta com
 * os cursores do envelope `meta`. Não há "página N" — é sequencial.
 */
export function CursorPager({
  count,
  perPage,
  onPerPageChange,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  loading,
}: {
  /** Quantidade de itens na página atual. */
  count: number;
  perPage: number;
  onPerPageChange: (n: number) => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Por página</span>
        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
          <SelectTrigger size="sm" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="tabular-nums">{count} nesta página</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev || loading}>
          <ChevronLeft /> Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext || loading}>
          Próxima <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
