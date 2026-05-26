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
import { buildForumSubscriptionColumns } from './columns';
import { useDeleteForumSubscription, useDeleteForumSubscriptions, useForumSubscriptions } from './hooks';
import type { ForumSubscription } from './types';

type ConfirmState = { mode: 'single'; subscription: ForumSubscription } | { mode: 'bulk'; subscriptions: ForumSubscription[] } | null;

export function ForumSubscriptionsPage() {
  const router = useRouter();
  const [threadId, setThreadId] = React.useState('');
  const [notify, setNotify] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [threadId, notify, perPage]);

  const query = useForumSubscriptions({
    filter: {
      forum_thread_id: threadId || undefined,
      notify: notify === 'enabled' ? true : notify === 'disabled' ? false : undefined,
    },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteForumSubscription();
  const deleteMany = useDeleteForumSubscriptions();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildForumSubscriptionColumns({
    onView: (subscription) => router.push(`/ava/inscricoes-forum/${subscription.id}`),
    onEdit: (subscription) => router.push(`/ava/inscricoes-forum/${subscription.id}/editar`),
    onDelete: (subscription) => setConfirm({ mode: 'single', subscription }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Inscrições (página)', value: rows.length, icon: 'Bell', accent: 'primary' },
    { label: 'Com notificação', value: rows.filter((subscription) => subscription.notify).length, icon: 'BellRing', accent: 'success' },
    { label: 'Silenciosas', value: rows.filter((subscription) => !subscription.notify).length, icon: 'BellOff', accent: 'muted' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.subscription.id);
        toastSuccess('Inscrição excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.subscriptions.map((subscription) => subscription.id));
        toastSuccess(`${confirm.subscriptions.length} inscrições excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Inscrições do fórum' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Inscrições do fórum" description="Acompanhamento e notificações de usuários em tópicos do AVA." actions={<Button asChild><Link href="/ava/inscricoes-forum/nova"><Plus /> Nova inscrição</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as inscrições.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(subscription) => subscription.id}
              loading={query.isLoading}
              exportFilename="inscricoes-forum"
              emptyMessage="Nenhuma inscrição encontrada com os filtros atuais."
              onRowClick={(subscription) => router.push(`/ava/inscricoes-forum/${subscription.id}`)}
              search={{ value: threadId, onChange: setThreadId, placeholder: 'Filtrar por tópico UUID…' }}
              filters={<Select value={notify} onValueChange={setNotify}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="enabled">Com notificação</SelectItem><SelectItem value="disabled">Silenciosas</SelectItem></SelectContent></Select>}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', subscriptions: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((stack) => { const next = [...stack]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((stack) => [...stack, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir inscrições selecionadas?' : 'Excluir inscrição?'} description={confirm?.mode === 'bulk' ? `${confirm.subscriptions.length} inscrições serão excluídas.` : 'A inscrição selecionada será excluída.'} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
