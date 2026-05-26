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
import { buildForumThreadColumns } from './columns';
import { useDeleteForumThread, useDeleteForumThreads, useForumThreads } from './hooks';
import type { ForumThread } from './types';

type ConfirmState = { mode: 'single'; thread: ForumThread } | { mode: 'bulk'; threads: ForumThread[] } | null;

export function ForumThreadsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [search, status, perPage]);

  const query = useForumThreads({
    search: { title: search || undefined },
    filter: {
      is_pinned: status === 'pinned' ? true : undefined,
      is_locked: status === 'locked' ? true : undefined,
    },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteForumThread();
  const deleteMany = useDeleteForumThreads();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildForumThreadColumns({
    onView: (thread) => router.push(`/ava/foruns/${thread.id}`),
    onEdit: (thread) => router.push(`/ava/foruns/${thread.id}/editar`),
    onDelete: (thread) => setConfirm({ mode: 'single', thread }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Tópicos (página)', value: rows.length, icon: 'MessagesSquare', accent: 'primary' },
    { label: 'Fixados', value: rows.filter((thread) => thread.is_pinned).length, icon: 'Pin', accent: 'success' },
    { label: 'Bloqueados', value: rows.filter((thread) => thread.is_locked).length, icon: 'Lock', accent: 'warning' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.thread.id);
        toastSuccess('Tópico excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.threads.map((thread) => thread.id));
        toastSuccess(`${confirm.threads.length} tópicos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Fóruns' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Fóruns" description="Hub de tópicos de discussão, respostas e inscrições do AVA." actions={<Button asChild><Link href="/ava/foruns/nova"><Plus /> Novo tópico</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os fóruns.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(thread) => thread.id}
              loading={query.isLoading}
              exportFilename="foruns-ava"
              emptyMessage="Nenhum tópico encontrado com os filtros atuais."
              onRowClick={(thread) => router.push(`/ava/foruns/${thread.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }}
              filters={<Select value={status} onValueChange={setStatus}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem><SelectItem value="pinned">Fixados</SelectItem><SelectItem value="locked">Bloqueados</SelectItem></SelectContent></Select>}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', threads: selected }); clear(); }}><Trash2 /> Excluir selecionados</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((stack) => { const next = [...stack]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((stack) => [...stack, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir tópicos selecionados?' : 'Excluir tópico?'} description={confirm?.mode === 'bulk' ? `${confirm.threads.length} tópicos serão excluídos.` : confirm?.mode === 'single' ? `O tópico "${confirm.thread.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
