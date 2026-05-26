'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { formatNumber } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SchoolRecordRow {
  id: string;
  academic_year: string | null;
  kind: string | null;
  school_name: string | null;
  final_status: string | null;
  final_average: number | string | null;
  attendance_pct: number | string | null;
  school_inep_code: string | null;
}

const toNumber = (value: number | string | null): string => {
  if (value === null) return '—';
  const asNumber = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(asNumber) ? formatNumber(asNumber, 2) : '—';
};

export function StudentDocumentsTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'school-records', studentId],
    queryFn: () =>
      listResource<SchoolRecordRow>('school-records', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os documentos deste aluno.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum documento cadastrado para este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Ano letivo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>INEP</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Média final</TableHead>
            <TableHead>Frequência (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link href={`/documentos/${row.id}`} className="text-primary underline-offset-2 hover:underline">
                  {row.academic_year ?? '—'}
                </Link>
              </TableCell>
              <TableCell>{row.kind ?? '—'}</TableCell>
              <TableCell>{row.school_name ?? '—'}</TableCell>
              <TableCell>{row.school_inep_code ?? '—'}</TableCell>
              <TableCell>{row.final_status ?? '—'}</TableCell>
              <TableCell>{toNumber(row.final_average)}</TableCell>
              <TableCell>{toNumber(row.attendance_pct)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
