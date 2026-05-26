'use client';

import Link from 'next/link';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { ProgressBar } from '@/features/course-enrollments/progress-bar';
import { listResource } from '@/lib/api-client';
import { toNumber } from '@/features/course-enrollments/types';
import { formatDate } from '@/lib/format';
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

interface CourseEnrollmentRow {
  id: string;
  course_id: string;
  status: string;
  progress_percent: number | string | null;
  enrolled_at: string | null;
}

interface CourseRow {
  id: string;
  title: string;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  dropped: 'Desistente',
  suspended: 'Suspensa',
};

export function StudentCourseEnrollmentsTab({ studentId }: { studentId: string }) {
  const enrollmentsQuery = useQuery({
    queryKey: ['students', 'course-enrollments', studentId],
    queryFn: () =>
      listResource<CourseEnrollmentRow>('course-enrollments', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  const courseIds = React.useMemo(
    () => Array.from(new Set(enrollmentsQuery.data?.data.map((enrollment) => enrollment.course_id).filter(Boolean))),
    [enrollmentsQuery.data?.data],
  );

  const coursesQuery = useQuery({
    queryKey: ['students', 'course-enrollments', 'courses', courseIds.join(',')],
    queryFn: () => listResource<CourseRow>('courses', { limit: 200 }),
    enabled: courseIds.length > 0,
  });

  const courseMap = React.useMemo(
    () => new Map((coursesQuery.data?.data ?? []).map((course) => [course.id, course.title])),
    [coursesQuery.data?.data],
  );

  if (enrollmentsQuery.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (enrollmentsQuery.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as matrículas do AVA.
      </p>
    );
  }

  const rows = enrollmentsQuery.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma matrícula AVA vinculada a este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Curso</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Data de matrícula</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((enrollment) => {
            const courseTitle = courseMap.get(enrollment.course_id);

            return (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <Link
                    href={`/ava/matriculas/${enrollment.id}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {courseTitle ?? `Curso #${enrollment.course_id}`}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{STATUS_LABEL[enrollment.status] ?? enrollment.status}</Badge>
                </TableCell>
                <TableCell>
                  <ProgressBar value={toNumber(enrollment.progress_percent)} />
                </TableCell>
                <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
