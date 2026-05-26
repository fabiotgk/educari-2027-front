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
import { formatPercent } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildLessonProgressColumns } from './columns';
import { LESSON_PROGRESS_STATUS_LABELS, toNumber, type LessonProgress } from './types';
import { useDeleteLessonProgress, useDeleteLessonProgressMany, useLessonProgressList } from './hooks';

type ConfirmState =
  | { mode: 'single'; progress: LessonProgress }
  | { mode: 'bulk'; progressList: LessonProgress[] }
  | null;

export function LessonProgressPage() {
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

  const query = useLessonProgressList({
    filter: {
      status: status !== 'all' ? status : undefined,
      course_enrollment_id: search || undefined,
    },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteLessonProgress();
  const deleteMany = useDeleteLessonProgressMany();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildLessonProgressColumns({
        onView: (p) => router.push(`/ava/progresso/${p.id}`),
        onEdit: (p) => router.push(`/ava/progresso/${p.id}/editar`),
        onDelete: (p) => setConfirm({ mode: 'single', progress: p }),
      }),
    [router],
  );

  const average = rows.length ? rows.reduce((sum, p) => sum + (toNumber(p.progress_percent) ?? 0), 0) / rows.length : 0;
  const stats: Stat[] = [
    { label: 'Registros', value: rows.length, icon: 'ListChecks', accent: 'primary' },
    { label: 'Em andamento', value: rows.filter((p) => p.status === 'in_progress').length, icon: 'CircleDotDashed', accent: 'warning' },
    { label: 'Concluídos', value: rows.filter((p) => p.status === 'completed').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Média de progresso', value: formatPercent(average, 0), icon: 'ChartNoAxesColumnIncreasing', accent: 'secondary' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.progress.id);
        toastSuccess('Progresso excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.progressList.map((p) => p.id));
        toastSuccess(`${confirm.progressList.length} registros excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Progresso' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Progresso das aulas" description="Registros de andamento por aula nas matrículas do AVA." actions={<Button asChild><Link href="/ava/progresso/novo"><Plus /> Novo progresso</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar o progresso.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(p) => p.id}
              loading={query.isLoading}
              exportFilename="progresso-aulas-ava"
              emptyMessage="Nenhum progresso encontrado com os filtros atuais."
              onRowClick={(p) => router.push(`/ava/progresso/${p.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Filtrar por UUID da matrícula…' }}
              filters={<Select value={status} onValueChange={setStatus}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as situações</SelectItem>{Object.entries(LESSON_PROGRESS_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', progressList: selected }); clear(); }}><Trash2 /> Excluir selecionados</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((stack) => { const next = [...stack]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((stack) => [...stack, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir progressos selecionados?' : 'Excluir progresso?'} description={confirm?.mode === 'bulk' ? `${confirm.progressList.length} registros serão excluídos.` : 'O registro de progresso será excluído.'} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
