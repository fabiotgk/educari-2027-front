'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import type { CourseEnrollmentRow } from './types';

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  suspended: 'Suspensa',
};

export function CourseEnrollmentsTab({ courseId }: { courseId: string }) {
  const query = useQuery({
    queryKey: ['courses', courseId, 'course-enrollments'],
    queryFn: () => listResource<CourseEnrollmentRow>('course-enrollments', { filter: { course_id: courseId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar as matrículas deste curso.</p>;
  const rows = query.data?.data ?? [];
  if (rows.length === 0) return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma matrícula vinculada a este curso.</div>;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40"><TableRow><TableHead>Aluno</TableHead><TableHead>Situação</TableHead><TableHead>Progresso</TableHead><TableHead>Matrícula</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="font-medium">{e.student?.name ?? e.user?.name ?? e.student_id ?? e.user_id ?? '—'}</TableCell>
            <TableCell><Badge variant="secondary">{STATUS_LABEL[e.status] ?? e.status}</Badge></TableCell>
            <TableCell>{e.progress_percent != null ? `${e.progress_percent}%` : '—'}</TableCell>
            <TableCell>{formatDate(e.enrolled_at)}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
