'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { PageHeader } from '@/components/crud/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildEvaluationPeriodColumns } from './columns';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteEvaluationPeriod, useDeleteEvaluationPeriods, useEvaluationPeriods } from './hooks';
import { type EvaluationPeriod } from './types';

interface ConfirmState {
  mode: 'single' | 'bulk';
  periods: EvaluationPeriod[];
}

export function EvaluationPeriodsPage() {
  const router = useRouter();
  const currentYear = String(new Date().getFullYear());
  const years = Array.from({ length: 8 }, (_, i) => String(Number(currentYear) - 3 + i));
  const [searchInput, setSearchInput] = React.useState('');
  const [yearFilter, setYearFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'true' | 'false'>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [searchInput, yearFilter, statusFilter, perPage]);

  const query = useEvaluationPeriods({
    search: { name: searchInput || undefined },
    filter: {
      academic_year: yearFilter !== 'all' ? yearFilter : undefined,
      is_closed: statusFilter !== 'all' ? statusFilter === 'true' : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const deleteOne = useDeleteEvaluationPeriod();
  const deleteMany = useDeleteEvaluationPeriods();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildEvaluationPeriodColumns({
        onView: (period) => router.push(`/diario/periodos/${period.id}`),
        onEdit: (period) => router.push(`/diario/periodos/${period.id}/editar`),
        onDelete: (period) => setConfirm({ mode: 'single', periods: [period] }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.periods[0]!.id);
        toastSuccess('Período excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.periods.map((period) => period.id));
        toastSuccess(`${confirm.periods.length} períodos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Períodos (página)', value: rows.length, icon: 'Calendar', accent: 'primary' },
    {
      label: 'Períodos fechados',
      value: rows.filter((period) => period.is_closed).length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Períodos abertos',
      value: rows.filter((period) => !period.is_closed).length,
      icon: 'CirclePause',
      accent: 'warning',
    },
    {
      label: 'Ano atual',
      value: rows.filter((period) => period.academic_year === currentYear).length,
      icon: 'BookOpen',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Diário Online', href: '/diario' }, { label: 'Períodos avaliativos' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Períodos avaliativos"
            description="Catálogo de períodos letivos da escola por série e ano letivo."
            actions={<Button asChild><Link href="/diario/periodos/nova"><Plus /> Novo período</Link></Button>}
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os períodos.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(period) => period.id}
              loading={query.isLoading}
              exportFilename="periodos-avaliativos"
              emptyMessage="Nenhum período encontrado com os filtros atuais."
              onRowClick={(period) => router.push(`/diario/periodos/${period.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por nome…' }}
              filters={
                <div className="flex gap-2">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Ano letivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'true' | 'false')}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="false">Abertos</SelectItem>
                      <SelectItem value="true">Fechados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', periods: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir períodos selecionados?' : 'Excluir período?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.periods.length} períodos serão excluídos.`
            : `O período ${confirm?.periods[0]?.code} será excluído.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
