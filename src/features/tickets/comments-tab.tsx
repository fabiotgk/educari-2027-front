'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/format';
import { useTicketComments } from './hooks';

/** Aba de relacionamento: comentários vinculados a este chamado. */
export function TicketCommentsTab({ ticketId }: { ticketId: string }) {
  const query = useTicketComments(ticketId);

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os comentários deste chamado.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum comentário registrado neste chamado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {comment.author?.name ?? 'Usuário desconhecido'}
                </span>
                {comment.is_internal && (
                  <Badge variant="outline" className="text-xs">
                    Interno
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDateTime(comment.created_at)}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
