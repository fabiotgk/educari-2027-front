'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { PageHeader } from '@/components/crud/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildLessonPlanColumns } from './columns';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteLessonPlan, useDeleteLessonPlans, useLessonPlans } from './hooks';
import { lessonPlanApprovalLabel, type LessonPlan, type LessonPlanApprovalStatus } from './types';

interface ConfirmState {
  mode: 'single' | 'bulk';
  plans: LessonPlan[];
}

export function LessonPlansPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<LessonPlanApprovalStatus | 'all'>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  const params = {
    ...(searchInput.trim() ? { class_diary_id: searchInput.trim() } : {}),
    ...(statusFilter !== 'all' ? { approval_status: statusFilter } : {}),
  };

  const query = useLessonPlans({
    filter: params,
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const deleteOne = useDeleteLessonPlan();
  const deleteMany = useDeleteLessonPlans();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildLessonPlanColumns({
        onView: (plan) => router.push(`/diario/planos/${plan.id}`),
        onEdit: (plan) => router.push(`/diario/planos/${plan.id}/editar`),
        onDelete: (plan) => setConfirm({ mode: 'single', plans: [plan] }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;

    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.plans[0]!.id);
        toastSuccess('Plano excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.plans.map((plan) => plan.id));
        toastSuccess(`${confirm.plans.length} planos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Planos (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    {
      label: 'Aprovados',
      value: rows.filter((plan) => plan.approval_status === 'approved').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Pendentes',
      value: rows.filter((plan) => plan.approval_status === 'submitted').length,
      icon: 'CirclePause',
      accent: 'warning',
    },
    {
      label: 'Rascunhos',
      value: rows.filter((plan) => plan.approval_status === 'draft').length,
      icon: 'BookOpen',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Diário Online', href: '/diario' }, { label: 'Planos de aula' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Planos de aula"
            description="Cadastro de planejamentos vinculados aos diários e períodos avaliativos."
            actions={<Button asChild><Link href="/diario/planos/nova"><Plus /> Novo plano</Link></Button>}
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os planos.</div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(plan) => plan.id}
              loading={query.isLoading}
              exportFilename="planos-de-aula"
              emptyMessage="Nenhum plano encontrado com os filtros atuais."
              onRowClick={(plan) => router.push(`/diario/planos/${plan.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Filtrar por ID do diário…' }}
              filters={
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LessonPlanApprovalStatus | 'all')}>
                  <SelectTrigger size="sm" className="w-48">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="draft">{lessonPlanApprovalLabel('draft')}</SelectItem>
                    <SelectItem value="submitted">{lessonPlanApprovalLabel('submitted')}</SelectItem>
                    <SelectItem value="approved">{lessonPlanApprovalLabel('approved')}</SelectItem>
                    <SelectItem value="rejected">{lessonPlanApprovalLabel('rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', plans: selected });
                    clear();
                  }}
                >
                  <Trash2 /> Excluir selecionados
                </Button>
              )}
              pager={
                <CursorPager
                  count={rows.length}
                  perPage={perPage}
                  onPerPageChange={setPerPage}
                  loading={query.isFetching}
                  hasPrev={cursorStack.length > 0}
                  hasNext={Boolean(nextCursor)}
                  onPrev={() => {
                    setCursorStack((stack) => {
                      const next = [...stack];
                      const previous = next.pop() ?? null;
                      setCursor(previous);
                      return next;
                    });
                  }}
                  onNext={() => {
                    setCursorStack((stack) => [...stack, cursor]);
                    setCursor(nextCursor);
                  }}
                />
              }
            />
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        destructive
        loading={deleting}
        title={confirm?.mode === 'bulk' ? 'Excluir planos selecionados?' : 'Excluir plano?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.plans.length} planos serão excluídos.`
            : `O plano ${confirm?.plans[0]?.id} será excluído.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
