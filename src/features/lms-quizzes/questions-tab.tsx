'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QuestionTypeBadge } from '@/features/lms-questions/columns';
import type { LmsQuestion } from '@/features/lms-questions/types';

export function LmsQuizQuestionsTab({ quizId }: { quizId: string }) {
  const query = useQuery({
    queryKey: ['lms-quizzes', quizId, 'lms-questions'],
    queryFn: () => listResource<LmsQuestion>('lms-questions', { filter: { lms_quiz_id: quizId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar as questões desta avaliação.</p>;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild><Link href={`/ava/questoes/nova?lms_quiz_id=${quizId}`}><Plus /> Nova questão</Link></Button>
      </div>
      {rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma questão vinculada a esta avaliação.</div> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40"><TableRow><TableHead>Ordem</TableHead><TableHead>Questão</TableHead><TableHead>Tipo</TableHead><TableHead>Pontuação</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-mono text-xs">{q.position}</TableCell>
                <TableCell className="font-medium"><Link href={`/ava/questoes/${q.id}`} className="hover:underline">{q.statement}</Link></TableCell>
                <TableCell><QuestionTypeBadge type={q.type} /></TableCell>
                <TableCell>{q.score}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
