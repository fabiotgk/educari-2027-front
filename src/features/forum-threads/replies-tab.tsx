'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import type { ForumReplyRow } from './types';

export function ForumThreadRepliesTab({ threadId }: { threadId: string }) {
  const query = useQuery({
    queryKey: ['forum-threads', threadId, 'forum-replies'],
    queryFn: () => listResource<ForumReplyRow>('forum-replies', { filter: { forum_thread_id: threadId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as respostas deste tópico.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/ava/respostas-forum/nova?forum_thread_id=${threadId}`}>
            <Plus /> Nova resposta
          </Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma resposta vinculada a este tópico.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Resposta</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Solução</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((reply) => (
                <TableRow key={reply.id}>
                  <TableCell className="max-w-xl">
                    <Link href={`/ava/respostas-forum/${reply.id}`} className="line-clamp-2 font-medium hover:underline">
                      {reply.body}
                    </Link>
                  </TableCell>
                  <TableCell>{reply.author?.name ?? reply.author_id ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={reply.is_solution ? 'default' : 'secondary'}>{reply.is_solution ? 'Sim' : 'Não'}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(reply.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
