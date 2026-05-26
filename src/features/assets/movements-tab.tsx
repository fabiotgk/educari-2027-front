'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import { useAssetMovements } from './hooks';

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  transfer: 'Transferência',
  loan: 'Empréstimo',
  return: 'Devolução',
  maintenance: 'Manutenção',
  disposal: 'Baixa',
};

/** Aba de relacionamento: movimentações vinculadas a este bem. */
export function AssetMovementsTab({ assetId }: { assetId: string }) {
  const query = useAssetMovements(assetId);

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as movimentações deste bem.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma movimentação registrada para este bem.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>De</TableHead>
            <TableHead>Para</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <Badge variant="secondary">
                  {MOVEMENT_TYPE_LABELS[m.movement_type] ?? m.movement_type}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {m.from_school_id ? (
                  <span className="font-mono text-xs">{m.from_school_id}</span>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell className="text-sm">
                {m.to_school_id ? (
                  <span className="font-mono text-xs">{m.to_school_id}</span>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell className="tabular-nums text-xs">
                {m.moved_at ? formatDateTime(m.moved_at) : '—'}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm">{m.notes ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
