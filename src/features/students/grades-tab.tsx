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

interface GradeRow {
  id: string;
  score_numeric: number | string | null;
  score_concept: string | null;
  kind: string | null;
  recorded_at: string | null;
  subject?: { id: string; name: string } | null;
  evaluation_period?: { id: string; name: string } | null;
}

const KIND_LABEL: Record<string, string> = {
  parcial: 'Parcial',
  bimestral: 'Bimestral',
  final: 'Final',
  recovery: 'Recuperação',
};

const toScore = (score: number | string | null): string => {
  if (score === null) return '—';

  const value = typeof score === 'number' ? score : Number.parseFloat(score);
  return Number.isFinite(value) ? value.toFixed(2).replace('.', ',') : '—';
};

/** Aba de relacionamento: notas do aluno. */
export function StudentGradesTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'grades', studentId],
    queryFn: () =>
      listResource<GradeRow>('grades', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as notas deste aluno.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma nota vinculada a este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Componente curricular</TableHead>
            <TableHead>Período avaliativo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Data do registro</TableHead>
            <TableHead>Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((grade) => {
            const hasConcept = Boolean(grade.score_concept);
            const scoreText = hasConcept ? grade.score_concept : toScore(grade.score_numeric);

            return (
              <TableRow key={grade.id}>
                <TableCell>{grade.subject?.name ?? '—'}</TableCell>
                <TableCell>{grade.evaluation_period?.name ?? '—'}</TableCell>
                <TableCell className="font-mono tabular-nums">{scoreText ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{grade.kind ? KIND_LABEL[grade.kind] ?? grade.kind : '—'}</Badge>
                </TableCell>
                <TableCell>{formatDate(grade.recorded_at)}</TableCell>
                <TableCell>
                  <Link
                    href={`/notas/${grade.id}`}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Ver
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
