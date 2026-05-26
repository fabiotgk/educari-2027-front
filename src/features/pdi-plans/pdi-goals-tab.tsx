'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
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
import { formatDate } from '@/lib/format';

/** Forma mínima da meta PDI (ver PdiGoalResource). */
interface PdiGoalRow {
  id: string;
  area: string | null;
  goal: string | null;
  target_date: string | null;
  status: string | null;
  progress: number | null;
}

const GOAL_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  achieved: 'Alcançada',
  not_achieved: 'Não alcançada',
};

/** Aba de relacionamento: metas vinculadas a este plano PDI. */
export function PdiGoalsTab({ pdiPlanId }: { pdiPlanId: string }) {
  const query = useQuery({
    queryKey: ['pdi-plans', 'goals', pdiPlanId],
    queryFn: () =>
      listResource<PdiGoalRow>('pdi-plans/' + pdiPlanId + '/pdi-goals', {
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as metas deste PDI.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma meta vinculada a este PDI.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Área</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((g) => (
            <TableRow key={g.id}>
              <TableCell className="font-medium">{g.area ?? '—'}</TableCell>
              <TableCell className="max-w-xs truncate">{g.goal ?? '—'}</TableCell>
              <TableCell className="text-xs">{formatDate(g.target_date)}</TableCell>
              <TableCell className="tabular-nums">
                {g.progress != null ? `${g.progress}%` : '—'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {g.status ? (GOAL_STATUS_LABEL[g.status] ?? g.status) : '—'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
