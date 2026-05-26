'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
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
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  type Question,
} from './types';

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  hard: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

/** Aba de relacionamento: questões vinculadas a este banco. */
export function QuestionsTab({ questionBankId }: { questionBankId: string }) {
  const query = useQuery({
    queryKey: ['question-banks', 'questions', questionBankId],
    queryFn: () =>
      listResource<Question>('questions', {
        filter: { question_bank_id: questionBankId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as questões deste banco.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma questão vinculada a este banco.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Enunciado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Dificuldade</TableHead>
            <TableHead>Habilidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="max-w-xs">
                <p className="line-clamp-2 text-sm">{q.statement}</p>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {QUESTION_TYPE_LABELS[q.type] ?? q.type}
                </Badge>
              </TableCell>
              <TableCell>
                {q.difficulty ? (
                  <Badge
                    variant="outline"
                    className={DIFFICULTY_STYLE[q.difficulty] ?? ''}
                  >
                    {QUESTION_DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">{q.skill_code ?? '—'}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
