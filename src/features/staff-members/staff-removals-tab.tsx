'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { formatDate } from '@/lib/format';
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

interface TransferCandidateRow {
  id: string;
  transfer_event_id: string | null;
  total_points: number | string | null;
  service_time_points: number | string | null;
  title_points: number | string | null;
  dependents_points: number | string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Aba de relacionamento: histórico de candidaturas de remoção. */
export function StaffRemovalsTab({ staffUserId }: { staffUserId: string | null }) {
  if (!staffUserId) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Este servidor não possui usuário vinculado para consultar remoções.
      </div>
    );
  }

  const query = useQuery({
    queryKey: ['staff-members', 'transfer-candidates', 'staff-removals', staffUserId],
    queryFn: () =>
      listResource<TransferCandidateRow>('transfer-candidates', {
        filter: { user_id: staffUserId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as candidaturas de remoção deste servidor.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma candidatura de remoção vinculada a este servidor.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>Data da candidatura</TableHead>
            <TableHead>Total de pontos</TableHead>
            <TableHead>Pontos por tempo de serviço</TableHead>
            <TableHead>Pontos por cargo</TableHead>
            <TableHead>Pontos por dependência</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((candidate) => {
            const eventId = candidate.transfer_event_id;
            const eventLabel = candidate.transfer_event_id ?? 'Sem evento';

            return (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">
                  {eventId ? (
                    <Link
                      href={`/remocao/${eventId}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {eventLabel}
                    </Link>
                  ) : (
                    eventLabel
                  )}
                </TableCell>
                <TableCell>{formatDate(candidate.created_at)}</TableCell>
                <TableCell>{candidate.total_points ?? '—'}</TableCell>
                <TableCell>{candidate.service_time_points ?? '—'}</TableCell>
                <TableCell>{candidate.title_points ?? '—'}</TableCell>
                <TableCell>{candidate.dependents_points ?? '—'}</TableCell>
                <TableCell>
                  <Link
                    href={eventId ? `/remocao/${eventId}` : '/remocao'}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Ver concurso
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
