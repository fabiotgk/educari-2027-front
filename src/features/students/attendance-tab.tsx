'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AttendanceRow {
  id: string;
  lesson_date: string | null;
  status: string | null;
  absence_reason_id: string | null;
  lesson_number_in_day: number | string | null;
  class_diary_id: string | null;
  class_diary?: { id: string; class_name?: string; subject_name?: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  present: 'Presente',
  absent: 'Falta',
  justified: 'Justificada',
};

/** Aba de relacionamento: frequência do aluno. */
export function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'attendance-records', studentId],
    queryFn: () =>
      listResource<AttendanceRow>('attendance-records', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os registros de frequência deste aluno.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum registro de frequência encontrado para este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aula</TableHead>
            <TableHead>Disciplina</TableHead>
            <TableHead>Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{formatDate(record.lesson_date)}</TableCell>
              <TableCell>{record.status ? STATUS_LABEL[record.status] ?? record.status : '—'}</TableCell>
              <TableCell>{record.class_diary_id ?? '—'}</TableCell>
              <TableCell>{record.class_diary?.subject_name ?? '—'}</TableCell>
              <TableCell>
                <Link
                  href={`/frequencia/${record.id}`}
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  Ver
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
