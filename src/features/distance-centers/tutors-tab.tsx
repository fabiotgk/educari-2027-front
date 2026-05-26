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
import type { Tutor } from './types';

/** Aba de relacionamento: tutores vinculados a este polo EAD. */
export function TutorsTab({ distanceCenterId }: { distanceCenterId: string }) {
  const query = useQuery({
    queryKey: ['distance-centers', 'tutors', distanceCenterId],
    queryFn: () =>
      listResource<Tutor>('tutors', {
        filter: { distance_center_id: distanceCenterId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os tutores deste polo.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum tutor vinculado a este polo.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Especialização</TableHead>
            <TableHead>Usuário (ID)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell className="text-sm">
                {t.specialization ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {t.user_id ?? '—'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
