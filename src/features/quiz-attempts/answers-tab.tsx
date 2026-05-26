'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnswerCorrectBadge } from '@/features/quiz-answers/columns';
import type { QuizAnswer } from '@/features/quiz-answers/types';

export function QuizAttemptAnswersTab({ attemptId }: { attemptId: string }) {
  const query = useQuery({
    queryKey: ['quiz-attempts', attemptId, 'quiz-answers'],
    queryFn: () => listResource<QuizAnswer>('quiz-answers', { filter: { quiz_attempt_id: attemptId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar as respostas desta tentativa.</p>;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild><Link href={`/ava/respostas/nova?quiz_attempt_id=${attemptId}`}><Plus /> Nova resposta</Link></Button>
      </div>
      {rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma resposta vinculada a esta tentativa.</div> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40"><TableRow><TableHead>Questão</TableHead><TableHead>Correção</TableHead><TableHead>Pontuação</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium"><Link href={`/ava/respostas/${a.id}`} className="hover:underline">{a.question?.statement ?? a.lms_question_id}</Link></TableCell>
                <TableCell><AnswerCorrectBadge correct={a.is_correct} /></TableCell>
                <TableCell>{a.score_awarded ?? '—'}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
