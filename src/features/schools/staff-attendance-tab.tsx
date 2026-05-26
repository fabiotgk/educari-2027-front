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

interface StaffMonthlyAttendanceRow {
  id: string;
  school_id: string | null;
  user_id: string;
  reference_month: string | null;
  justified_absences: string | number | null;
  unjustified_absences: string | number | null;
  closed_at: string | null;
}

function formatMonth(value: string | null): string {
  if (!value) return '—';
  return value;
}

/** Aba de relacionamento: frequência mensal de servidores da escola. */
export function SchoolStaffAttendanceTab({ schoolId }: { schoolId: string }) {
  const query = useQuery({
    queryKey: ['schools', 'staff-monthly-attendance', schoolId],
    queryFn: () =>
      listResource<StaffMonthlyAttendanceRow>('staff-monthly-attendance', {
        filter: { school_id: schoolId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar a frequência desta escola.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum apontamento de frequência de servidores para esta escola.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Mês de referência</TableHead>
            <TableHead>Servidor</TableHead>
            <TableHead>Faltas justificadas</TableHead>
            <TableHead>Faltas injustificadas</TableHead>
            <TableHead>Total de faltas</TableHead>
            <TableHead>Concluído em</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((record) => {
            const justified = Number(record.justified_absences ?? 0);
            const unjustified = Number(record.unjustified_absences ?? 0);

            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/servidores/frequencia/${record.id}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {formatMonth(record.reference_month)}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{record.user_id}</TableCell>
                <TableCell>{Number.isNaN(justified) ? '—' : justified}</TableCell>
                <TableCell>{Number.isNaN(unjustified) ? '—' : unjustified}</TableCell>
                <TableCell>{Number.isNaN(justified + unjustified) ? '—' : justified + unjustified}</TableCell>
                <TableCell>{record.closed_at ? formatDate(record.closed_at) : '—'}</TableCell>
                <TableCell>
                  <Link
                    href={`/servidores/frequencia/${record.id}`}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Ver detalhes
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
