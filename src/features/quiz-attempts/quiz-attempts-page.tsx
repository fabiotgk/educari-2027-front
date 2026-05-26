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
import { buildQuizAttemptColumns } from './columns';
import { useDeleteQuizAttempt, useDeleteQuizAttempts, useQuizAttempts } from './hooks';
import { QUIZ_ATTEMPT_STATUS_LABELS, type QuizAttempt } from './types';

type ConfirmState = { mode: 'single'; attempt: QuizAttempt } | { mode: 'bulk'; attempts: QuizAttempt[] } | null;

export function QuizAttemptsPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);

  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [status, perPage]);

  const query = useQuizAttempts({ filter: { status: status !== 'all' ? status : undefined }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const deleteOne = useDeleteQuizAttempt();
  const deleteMany = useDeleteQuizAttempts();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(() => buildQuizAttemptColumns({
    onView: (a) => router.push(`/ava/tentativas/${a.id}`),
    onEdit: (a) => router.push(`/ava/tentativas/${a.id}/editar`),
    onDelete: (a) => setConfirm({ mode: 'single', attempt: a }),
  }), [router]);

  const stats: Stat[] = [
    { label: 'Tentativas (página)', value: rows.length, icon: 'ClipboardCheck', accent: 'primary' },
    { label: 'Em andamento', value: rows.filter((a) => a.status === 'in_progress').length, icon: 'CirclePause', accent: 'warning' },
    { label: 'Corrigidas', value: rows.filter((a) => a.status === 'graded').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Aprovadas', value: rows.filter((a) => a.passed === true).length, icon: 'BadgeCheck', accent: 'muted' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.attempt.id);
        toastSuccess('Tentativa excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.attempts.map((a) => a.id));
        toastSuccess(`${confirm.attempts.length} tentativas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Tentativas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Tentativas" description="Execuções de avaliações por estudante ou usuário do AVA." actions={<Button asChild><Link href="/ava/tentativas/nova"><Plus /> Nova tentativa</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as tentativas.</div> : (
            <DataTable columns={columns} rows={rows} getRowId={(a) => a.id} loading={query.isLoading} exportFilename="tentativas-ava" emptyMessage="Nenhuma tentativa encontrada com os filtros atuais." onRowClick={(a) => router.push(`/ava/tentativas/${a.id}`)} filters={<Select value={status} onValueChange={setStatus}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{Object.entries(QUIZ_ATTEMPT_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', attempts: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir tentativas selecionadas?' : 'Excluir tentativa?'} description={confirm?.mode === 'bulk' ? `${confirm.attempts.length} tentativas serão excluídas.` : confirm?.mode === 'single' ? `A tentativa #${confirm.attempt.attempt_number} será excluída.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
