'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, formatPercent } from '@/lib/format';
import type { LessonProgress, LessonProgressStatus } from '@/features/lesson-progress/types';
import { LESSON_PROGRESS_STATUS_LABELS, toNumber } from '@/features/lesson-progress/types';

export function CourseEnrollmentLessonProgressTab({ courseEnrollmentId }: { courseEnrollmentId: string }) {
  const query = useQuery({
    queryKey: ['course-enrollments', courseEnrollmentId, 'lesson-progress'],
    queryFn: () =>
      listResource<LessonProgress>('lesson-progress', {
        filter: { course_enrollment_id: courseEnrollmentId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar o progresso das aulas desta matrícula.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/ava/progresso/novo?course_enrollment_id=${courseEnrollmentId}`}>
            <Plus /> Novo progresso
          </Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum progresso de aula vinculado a esta matrícula.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Aula</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Último acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const progress = toNumber(p.progress_percent);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/ava/progresso/${p.id}`} className="font-mono text-xs underline-offset-4 hover:underline">
                        {p.lesson_id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{LESSON_PROGRESS_STATUS_LABELS[p.status as LessonProgressStatus]}</Badge>
                    </TableCell>
                    <TableCell>{progress == null ? '—' : formatPercent(progress, 0)}</TableCell>
                    <TableCell>{formatDateTime(p.last_accessed_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
