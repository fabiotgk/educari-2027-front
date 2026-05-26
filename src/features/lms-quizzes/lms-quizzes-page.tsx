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
import { buildLmsQuizColumns } from './columns';
import { useDeleteLmsQuiz, useDeleteLmsQuizzes, useLmsQuizzes } from './hooks';
import type { LmsQuiz } from './types';

type ConfirmState = { mode: 'single'; quiz: LmsQuiz } | { mode: 'bulk'; quizzes: LmsQuiz[] } | null;

export function LmsQuizzesPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [published, setPublished] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);
  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [search, published, perPage]);

  const query = useLmsQuizzes({
    search: { title: search || undefined },
    filter: { is_published: published === 'all' ? undefined : published === 'published' },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const deleteOne = useDeleteLmsQuiz();
  const deleteMany = useDeleteLmsQuizzes();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildLmsQuizColumns({
    onView: (q) => router.push(`/ava/avaliacoes/${q.id}`),
    onEdit: (q) => router.push(`/ava/avaliacoes/${q.id}/editar`),
    onDelete: (q) => setConfirm({ mode: 'single', quiz: q }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Avaliações (página)', value: rows.length, icon: 'ClipboardList', accent: 'primary' },
    { label: 'Publicadas', value: rows.filter((q) => q.is_published).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Rascunhos', value: rows.filter((q) => !q.is_published).length, icon: 'CirclePause', accent: 'warning' },
    { label: 'Com limite', value: rows.filter((q) => q.time_limit_minutes != null).length, icon: 'Clock', accent: 'muted' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.quiz.id);
        toastSuccess('Avaliação excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.quizzes.map((q) => q.id));
        toastSuccess(`${confirm.quizzes.length} avaliações excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Avaliações' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Avaliações" description="Hub de questionários do AVA: questões, tentativas, respostas e auditoria." actions={<Button asChild><Link href="/ava/avaliacoes/nova"><Plus /> Nova avaliação</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as avaliações.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(q) => q.id}
              loading={query.isLoading}
              exportFilename="avaliacoes-ava"
              emptyMessage="Nenhuma avaliação encontrada com os filtros atuais."
              onRowClick={(q) => router.push(`/ava/avaliacoes/${q.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }}
              filters={<Select value={published} onValueChange={setPublished}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="published">Publicadas</SelectItem><SelectItem value="draft">Rascunhos</SelectItem></SelectContent></Select>}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', quizzes: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir avaliações selecionadas?' : 'Excluir avaliação?'} description={confirm?.mode === 'bulk' ? `${confirm.quizzes.length} avaliações serão excluídas.` : confirm?.mode === 'single' ? `A avaliação "${confirm.quiz.title}" será excluída.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
