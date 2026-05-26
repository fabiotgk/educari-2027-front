'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
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

interface EssayEvaluationRow {
  id: string;
  prompt_text: string;
  score: number | string | null;
  status: string;
  evaluated_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluída',
  failed: 'Falhou',
};

const toScore = (score: number | string | null): string => {
  if (score === null) return '—';

  const asNumber = typeof score === 'number' ? score : Number.parseFloat(score);
  return Number.isFinite(asNumber) ? asNumber.toFixed(2).replace('.', ',') : '—';
};

export function StudentEssayEvaluationsTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'essay-evaluations', studentId],
    queryFn: () =>
      listResource<EssayEvaluationRow>('essay-evaluations', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as redações deste aluno.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma redação vinculada a este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Tema</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Data de avaliação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const prompt = row.prompt_text.length > 90 ? `${row.prompt_text.slice(0, 90)}…` : row.prompt_text;

            return (
              <TableRow key={row.id}>
                <TableCell className="max-w-md">
                  <Link href={`/ia-redacao/${row.id}`} className="text-primary underline-offset-2 hover:underline">
                    <p className="line-clamp-2 text-sm">{prompt}</p>
                  </Link>
                </TableCell>
                <TableCell className="font-mono tabular-nums">{toScore(row.score)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{STATUS_LABEL[row.status] ?? row.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(row.evaluated_at)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
