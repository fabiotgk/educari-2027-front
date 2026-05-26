'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AttemptStatusBadge, PassedBadge } from '@/features/quiz-attempts/columns';
import type { QuizAttempt } from '@/features/quiz-attempts/types';

export function LmsQuizAttemptsTab({ quizId }: { quizId: string }) {
  const query = useQuery({
    queryKey: ['lms-quizzes', quizId, 'quiz-attempts'],
    queryFn: () => listResource<QuizAttempt>('quiz-attempts', { filter: { lms_quiz_id: quizId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar as tentativas desta avaliação.</p>;
  const rows = query.data?.data ?? [];

  return rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma tentativa vinculada a esta avaliação.</div> : (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40"><TableRow><TableHead>Tentativa</TableHead><TableHead>Participante</TableHead><TableHead>Status</TableHead><TableHead>Resultado</TableHead><TableHead>Envio</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium"><Link href={`/ava/tentativas/${a.id}`} className="hover:underline">#{a.attempt_number}</Link></TableCell>
            <TableCell className="font-mono text-xs">{a.student_id ?? a.user_id ?? '—'}</TableCell>
            <TableCell><AttemptStatusBadge status={a.status} /></TableCell>
            <TableCell><PassedBadge passed={a.passed} /></TableCell>
            <TableCell>{formatDateTime(a.submitted_at)}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
