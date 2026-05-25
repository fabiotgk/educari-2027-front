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

/** Forma mínima da matrícula que esta aba consome (ver EnrollmentResource). */
interface EnrollmentRow {
  id: string;
  academic_year: number | string | null;
  status: string;
  enrolled_at: string | null;
  student: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  transferred: 'Transferida',
  cancelled: 'Cancelada',
  completed: 'Concluída',
};

/** Aba de relacionamento: matrículas vinculadas a esta escola. */
export function SchoolEnrollmentsTab({ schoolId }: { schoolId: string }) {
  const query = useQuery({
    queryKey: ['schools', 'enrollments', schoolId],
    queryFn: () => listResource<EnrollmentRow>('enrollments', { filter: { school_id: schoolId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as matrículas desta escola.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma matrícula vinculada a esta escola.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Ano letivo</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.student?.name ?? '—'}</TableCell>
              <TableCell>{e.class?.name ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{e.academic_year ?? '—'}</TableCell>
              <TableCell>{formatDate(e.enrolled_at)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{STATUS_LABEL[e.status] ?? e.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
