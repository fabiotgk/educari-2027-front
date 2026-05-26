'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { CursorPager } from '@/components/crud/cursor-pager';
import { DataTable } from '@/components/crud/data-table';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildForumReplyColumns } from './columns';
import { useDeleteForumReplies, useDeleteForumReply, useForumReplies } from './hooks';
import type { ForumReply } from './types';

type ConfirmState = { mode: 'single'; reply: ForumReply } | { mode: 'bulk'; replies: ForumReply[] } | null;

export function ForumRepliesPage() {
  const router = useRouter();
  const [threadId, setThreadId] = React.useState('');
  const [solution, setSolution] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [threadId, solution, perPage]);

  const query = useForumReplies({
    filter: {
      forum_thread_id: threadId || undefined,
      is_solution: solution === 'solution' ? true : solution === 'regular' ? false : undefined,
    },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteForumReply();
  const deleteMany = useDeleteForumReplies();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildForumReplyColumns({
    onView: (reply) => router.push(`/ava/respostas-forum/${reply.id}`),
    onEdit: (reply) => router.push(`/ava/respostas-forum/${reply.id}/editar`),
    onDelete: (reply) => setConfirm({ mode: 'single', reply }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Respostas (página)', value: rows.length, icon: 'MessageCircle', accent: 'primary' },
    { label: 'Soluções', value: rows.filter((reply) => reply.is_solution).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Comentários', value: rows.filter((reply) => !reply.is_solution).length, icon: 'MessagesSquare', accent: 'muted' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.reply.id);
        toastSuccess('Resposta excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.replies.map((reply) => reply.id));
        toastSuccess(`${confirm.replies.length} respostas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Respostas do fórum' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Respostas do fórum" description="Respostas registradas nos tópicos de discussão do AVA." actions={<Button asChild><Link href="/ava/respostas-forum/nova"><Plus /> Nova resposta</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as respostas.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(reply) => reply.id}
              loading={query.isLoading}
              exportFilename="respostas-forum"
              emptyMessage="Nenhuma resposta encontrada com os filtros atuais."
              onRowClick={(reply) => router.push(`/ava/respostas-forum/${reply.id}`)}
              search={{ value: threadId, onChange: setThreadId, placeholder: 'Filtrar por tópico UUID…' }}
              filters={<Select value={solution} onValueChange={setSolution}><SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem><SelectItem value="solution">Soluções</SelectItem><SelectItem value="regular">Comentários</SelectItem></SelectContent></Select>}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', replies: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((stack) => { const next = [...stack]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((stack) => [...stack, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir respostas selecionadas?' : 'Excluir resposta?'} description={confirm?.mode === 'bulk' ? `${confirm.replies.length} respostas serão excluídas.` : 'A resposta selecionada será excluída.'} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
