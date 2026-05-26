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

interface StaffAttendanceRow {
  id: string;
  school_id: string | null;
  user_id: string;
  date: string | null;
  shift: string | null;
  status: string | null;
  reason_code: string | null;
  is_justified: boolean | null;
  justification: string | null;
}

/** Aba de relacionamento: frequência de servidores. */
export function StaffAttendanceTab({
  staffUserId,
}: {
  staffUserId: string | null;
}) {
  if (!staffUserId) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Este servidor não possui usuário vinculado para consultar frequência.
      </div>
    );
  }

  const query = useQuery({
    queryKey: ['staff-members', 'staff-attendance', staffUserId],
    queryFn: () =>
      listResource<StaffAttendanceRow>('staff-attendance-records', {
        filter: { user_id: staffUserId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os registros de frequência deste servidor.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum registro de frequência encontrado para este servidor.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Justificação</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
              <TableCell className="font-mono text-xs">{record.school_id ?? '—'}</TableCell>
              <TableCell>{record.shift ?? '—'}</TableCell>
              <TableCell>{record.status ?? '—'}</TableCell>
              <TableCell>
                {record.reason_code ?? (record.is_justified ? 'Justificado' : 'Não justificado')}
                {record.justification ? <span className="ml-1 text-xs text-muted-foreground">· {record.justification}</span> : null}
              </TableCell>
              <TableCell>
                <Link
                  href={`/servidores/frequencia/${record.id}`}
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
