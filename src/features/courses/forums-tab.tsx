'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import type { ForumThreadRow } from './types';

export function CourseForumsTab({ courseId }: { courseId: string }) {
  const query = useQuery({
    queryKey: ['courses', courseId, 'forum-threads'],
    queryFn: () => listResource<ForumThreadRow>('forum-threads', { filter: { course_id: courseId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar os fóruns deste curso.</p>;
  const rows = query.data?.data ?? [];
  if (rows.length === 0) return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhum tópico de fórum vinculado a este curso.</div>;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40"><TableRow><TableHead>Tópico</TableHead><TableHead>Respostas</TableHead><TableHead>Visualizações</TableHead><TableHead>Última resposta</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((thread) => (
          <TableRow key={thread.id}>
            <TableCell className="font-medium">{thread.title}</TableCell>
            <TableCell>{thread.replies_count ?? 0}</TableCell>
            <TableCell>{thread.views_count ?? 0}</TableCell>
            <TableCell>{formatDateTime(thread.last_reply_at ?? null)}</TableCell>
            <TableCell><Badge variant={thread.is_locked ? 'secondary' : 'default'}>{thread.is_locked ? 'Fechado' : 'Aberto'}</Badge></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
