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
import { formatDate } from '@/lib/format';

/** Forma mínima do post que esta aba consome (ver PostResource). */
interface PostRow {
  id: string;
  title: string;
  kind: string | null;
  status: string;
  published_at: string | null;
  view_count: number | null;
}

const KIND_LABEL: Record<string, string> = {
  news: 'Notícia',
  article: 'Artigo',
  project: 'Projeto',
  lesson: 'Aula',
  video: 'Vídeo',
};

const STATUS_STYLE: Record<string, string> = {
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  published: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  scheduled: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  archived: 'border-muted-foreground/30 bg-muted text-muted-foreground',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  scheduled: 'Agendado',
  archived: 'Arquivado',
};

/** Aba de relacionamento: posts vinculados a este site. */
export function PostsTab({ siteId }: { siteId: string }) {
  const query = useQuery({
    queryKey: ['sites', 'posts', siteId],
    queryFn: () =>
      listResource<PostRow>('posts', {
        filter: { site_id: siteId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as publicações deste site.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma publicação vinculada a este site.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Publicado em</TableHead>
            <TableHead className="text-right">Visualizações</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell>
                {p.kind ? (
                  <Badge variant="secondary">{KIND_LABEL[p.kind] ?? p.kind}</Badge>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>{formatDate(p.published_at)}</TableCell>
              <TableCell className="tabular-nums text-right">{p.view_count ?? '—'}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_STYLE[p.status] ?? ''}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
