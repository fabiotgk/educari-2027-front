'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { formatPercent } from '@/lib/format';
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

interface LearningPathRow {
  id: string;
  title: string;
  status: string | null;
  difficulty: string | null;
  progress_pct: number | string | null;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Concluída',
};

export function StudentLearningPathsTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'learning-paths', studentId],
    queryFn: () =>
      listResource<LearningPathRow>('learning-paths', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as trilhas adaptativas.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma trilha vinculada a este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Dificuldade</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const numericProgress =
              typeof row.progress_pct === 'number'
                ? row.progress_pct
                : Number.parseFloat(String(row.progress_pct ?? ''));

            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  <Link href={`/ia-adaptativo/${row.id}`} className="text-primary underline-offset-2 hover:underline">
                    {row.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{row.difficulty ? DIFFICULTY_LABEL[row.difficulty] ?? row.difficulty : '—'}</Badge>
                </TableCell>
                <TableCell>
                  {Number.isFinite(numericProgress) ? formatPercent(Math.max(0, Math.min(100, numericProgress)), 0) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{STATUS_LABEL[row.status ?? ''] ?? row.status ?? '—'}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
