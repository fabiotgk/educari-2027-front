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

/** Forma mínima da inscrição que esta aba consome (ver TrainingEnrollmentResource). */
interface EnrollmentRow {
  id: string;
  user_id: string;
  enrolled_at: string | null;
  completed_at: string | null;
  attended_hours: number | string | null;
  achievement: string | null;
  certificate_issued: boolean | null;
}

/** Aba de relacionamento: inscrições vinculadas a este curso de capacitação. */
export function TrainingEnrollmentsTab({ courseId }: { courseId: string }) {
  const query = useQuery({
    queryKey: ['training-courses', 'enrollments', courseId],
    queryFn: () =>
      listResource<EnrollmentRow>(`training-courses/${courseId}/enrollments`, { limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as inscrições deste curso.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma inscrição vinculada a este curso.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Usuário (ID)</TableHead>
            <TableHead>Inscrito em</TableHead>
            <TableHead>Concluído em</TableHead>
            <TableHead>Horas frequentadas</TableHead>
            <TableHead>Aproveitamento</TableHead>
            <TableHead>Certificado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-mono text-xs">{e.user_id}</TableCell>
              <TableCell>{formatDate(e.enrolled_at)}</TableCell>
              <TableCell>{formatDate(e.completed_at)}</TableCell>
              <TableCell className="tabular-nums">
                {e.attended_hours != null ? `${e.attended_hours}h` : '—'}
              </TableCell>
              <TableCell>{e.achievement ?? '—'}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    e.certificate_issued
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                      : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  }
                >
                  {e.certificate_issued ? 'Emitido' : 'Não emitido'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
