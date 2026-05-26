'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import type { ForumSubscriptionRow } from './types';

export function ForumThreadSubscriptionsTab({ threadId }: { threadId: string }) {
  const query = useQuery({
    queryKey: ['forum-threads', threadId, 'forum-subscriptions'],
    queryFn: () =>
      listResource<ForumSubscriptionRow>('forum-subscriptions', {
        filter: { forum_thread_id: threadId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as inscrições deste tópico.
      </p>
    );
  }

  const rows = query.data?.data ?? [];
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma inscrição vinculada a este tópico.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Notificar</TableHead>
            <TableHead>Criada em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">{subscription.user?.name ?? subscription.user_id ?? '—'}</TableCell>
              <TableCell>{subscription.user?.email ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={subscription.notify ? 'default' : 'secondary'}>{subscription.notify ? 'Sim' : 'Não'}</Badge>
              </TableCell>
              <TableCell>{formatDateTime(subscription.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
