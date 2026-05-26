'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/** Forma mínima da vaga que esta aba consome (ver TransferPositionResource). */
interface PositionRow {
  id: string;
  role_title: string;
  school_id: string | null;
  subject_id: string | null;
  vacancies: number;
  filled: number;
}

/** Aba de relacionamento: vagas vinculadas a este evento de remoção. */
export function TransferPositionsTab({ eventId }: { eventId: string }) {
  const query = useQuery({
    queryKey: ['transfer-events', 'positions', eventId],
    queryFn: () =>
      listResource<PositionRow>('transfer-positions', {
        filter: { transfer_event_id: eventId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as vagas deste evento.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma vaga vinculada a este evento de remoção.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Cargo / Função</TableHead>
            <TableHead>Escola (ID)</TableHead>
            <TableHead>Disciplina (ID)</TableHead>
            <TableHead className="text-right">Vagas</TableHead>
            <TableHead className="text-right">Preenchidas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.role_title}</TableCell>
              <TableCell className="font-mono text-xs">{p.school_id ?? '—'}</TableCell>
              <TableCell className="font-mono text-xs">{p.subject_id ?? '—'}</TableCell>
              <TableCell className="tabular-nums text-right">{p.vacancies}</TableCell>
              <TableCell className="tabular-nums text-right">{p.filled}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
