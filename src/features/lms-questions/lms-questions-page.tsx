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
import { buildLmsQuestionColumns } from './columns';
import { useDeleteLmsQuestion, useDeleteLmsQuestions, useLmsQuestions } from './hooks';
import { LMS_QUESTION_TYPE_LABELS, type LmsQuestion } from './types';

type ConfirmState = { mode: 'single'; question: LmsQuestion } | { mode: 'bulk'; questions: LmsQuestion[] } | null;

export function LmsQuestionsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);
  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [search, type, perPage]);

  const query = useLmsQuestions({ search: { statement: search || undefined }, filter: { type: type !== 'all' ? type : undefined }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const deleteOne = useDeleteLmsQuestion();
  const deleteMany = useDeleteLmsQuestions();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildLmsQuestionColumns({
    onView: (q) => router.push(`/ava/questoes/${q.id}`),
    onEdit: (q) => router.push(`/ava/questoes/${q.id}/editar`),
    onDelete: (q) => setConfirm({ mode: 'single', question: q }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Questões (página)', value: rows.length, icon: 'ListChecks', accent: 'primary' },
    { label: 'Objetivas', value: rows.filter((q) => q.type === 'single_choice' || q.type === 'multiple_choice').length, icon: 'CircleDot', accent: 'success' },
    { label: 'V/F', value: rows.filter((q) => q.type === 'true_false').length, icon: 'CheckCheck', accent: 'warning' },
    { label: 'Dissertativas', value: rows.filter((q) => q.type === 'essay').length, icon: 'Text', accent: 'muted' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.question.id);
        toastSuccess('Questão excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.questions.map((q) => q.id));
        toastSuccess(`${confirm.questions.length} questões excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Questões' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Questões" description="Banco de questões vinculado às avaliações do AVA." actions={<Button asChild><Link href="/ava/questoes/nova"><Plus /> Nova questão</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as questões.</div> : (
            <DataTable columns={columns} rows={rows} getRowId={(q) => q.id} loading={query.isLoading} exportFilename="questoes-ava" emptyMessage="Nenhuma questão encontrada com os filtros atuais." onRowClick={(q) => router.push(`/ava/questoes/${q.id}`)} search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por enunciado…' }} filters={<Select value={type} onValueChange={setType}><SelectTrigger size="sm" className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{Object.entries(LMS_QUESTION_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', questions: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir questões selecionadas?' : 'Excluir questão?'} description={confirm?.mode === 'bulk' ? `${confirm.questions.length} questões serão excluídas.` : confirm?.mode === 'single' ? 'A questão selecionada será excluída.' : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
