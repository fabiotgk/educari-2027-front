'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { CalendarPublishedBadge } from '@/features/school-calendars/columns';
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

interface SchoolCalendarRow {
  id: string;
  academic_year: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  total_school_days_planned: number | null;
  total_school_days_actual: number | null;
  is_published: boolean;
  school_id: string | null;
}

/** Aba de relacionamento: calendários letivos da escola. */
export function SchoolCalendarsTab({ schoolId }: { schoolId: string }) {
  const query = useQuery({
    queryKey: ['schools', 'school-calendars', schoolId],
    queryFn: () =>
      listResource<SchoolCalendarRow>('school-calendars', {
        filter: { school_id: schoolId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os calendários desta escola.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum calendário vinculado a esta escola.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Ano letivo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Horas e dias</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((calendar) => (
            <TableRow key={calendar.id}>
              <TableCell className="font-mono">{calendar.academic_year}</TableCell>
              <TableCell className="font-medium">
                <Link
                  href={`/calendario/${calendar.id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {calendar.name}
                </Link>
              </TableCell>
              <TableCell>
                {calendar.starts_at ? formatDate(calendar.starts_at) : '—'}
                {calendar.starts_at && calendar.ends_at ? ' · ' : ''}
                {calendar.ends_at ? formatDate(calendar.ends_at) : ''}
              </TableCell>
              <TableCell>
                <CalendarPublishedBadge published={calendar.is_published} />
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {calendar.total_school_days_planned != null ? calendar.total_school_days_planned : '—'}
                </span>
              </TableCell>
              <TableCell>
                <Link
                  href={`/calendario/${calendar.id}`}
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  Ver detalhes
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
