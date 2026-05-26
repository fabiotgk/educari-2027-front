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

interface KitSizingRecordRow {
  id: string;
  measure_type: string | null;
  size: string;
  measured_at: string | null;
}

const MEASURE_LABELS: Record<string, string> = {
  shirt: 'Camisa',
  pants: 'Calça',
  shoe: 'Sapato',
  other: 'Outro',
};

export function StudentKitSizingTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'kit-sizing-records', studentId],
    queryFn: () =>
      listResource<KitSizingRecordRow>('kit-sizing-records', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as medidas do kit.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum registro escolar de kit encontrado para este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Medida</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Data de medição</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{MEASURE_LABELS[row.measure_type ?? 'other'] ?? row.measure_type ?? '—'}</TableCell>
              <TableCell className="font-medium">{row.size}</TableCell>
              <TableCell>{formatDate(row.measured_at)}</TableCell>
              <TableCell>
                <Link href={`/alunos/${studentId}`} className="text-xs text-primary underline-offset-2 hover:underline">
                  Ver aluno
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
