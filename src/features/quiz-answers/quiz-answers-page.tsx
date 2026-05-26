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
import { buildQuizAnswerColumns } from './columns';
import { useDeleteQuizAnswer, useDeleteQuizAnswers, useQuizAnswers } from './hooks';
import type { QuizAnswer } from './types';

type ConfirmState = { mode: 'single'; answer: QuizAnswer } | { mode: 'bulk'; answers: QuizAnswer[] } | null;

export function QuizAnswersPage() {
  const router = useRouter();
  const [correct, setCorrect] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);

  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [correct, perPage]);

  const query = useQuizAnswers({ filter: { is_correct: correct === 'all' ? undefined : correct === 'correct' }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const deleteOne = useDeleteQuizAnswer();
  const deleteMany = useDeleteQuizAnswers();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildQuizAnswerColumns({
    onView: (a) => router.push(`/ava/respostas/${a.id}`),
    onEdit: (a) => router.push(`/ava/respostas/${a.id}/editar`),
    onDelete: (a) => setConfirm({ mode: 'single', answer: a }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Respostas (página)', value: rows.length, icon: 'MessagesSquare', accent: 'primary' },
    { label: 'Corretas', value: rows.filter((a) => a.is_correct === true).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Incorretas', value: rows.filter((a) => a.is_correct === false).length, icon: 'CircleX', accent: 'warning' },
    { label: 'Sem correção', value: rows.filter((a) => a.is_correct === null).length, icon: 'CircleHelp', accent: 'muted' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.answer.id);
        toastSuccess('Resposta excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.answers.map((a) => a.id));
        toastSuccess(`${confirm.answers.length} respostas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Respostas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Respostas" description="Respostas registradas nas tentativas de avaliações do AVA." actions={<Button asChild><Link href="/ava/respostas/nova"><Plus /> Nova resposta</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as respostas.</div> : (
            <DataTable columns={columns} rows={rows} getRowId={(a) => a.id} loading={query.isLoading} exportFilename="respostas-ava" emptyMessage="Nenhuma resposta encontrada com os filtros atuais." onRowClick={(a) => router.push(`/ava/respostas/${a.id}`)} filters={<Select value={correct} onValueChange={setCorrect}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="correct">Corretas</SelectItem><SelectItem value="incorrect">Incorretas</SelectItem></SelectContent></Select>} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', answers: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir respostas selecionadas?' : 'Excluir resposta?'} description={confirm?.mode === 'bulk' ? `${confirm.answers.length} respostas serão excluídas.` : confirm?.mode === 'single' ? 'A resposta selecionada será excluída.' : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
