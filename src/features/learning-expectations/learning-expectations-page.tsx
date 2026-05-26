'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { PageHeader } from '@/components/crud/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildLearningExpectationColumns } from './columns';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteLearningExpectation, useDeleteLearningExpectations, useLearningExpectations } from './hooks';
import { type LearningExpectation } from './types';

interface ConfirmState {
  mode: 'single' | 'bulk';
  expectations: LearningExpectation[];
}

export function LearningExpectationsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'true' | 'false'>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [searchInput, statusFilter, perPage]);

  const query = useLearningExpectations({
    search: { bncc_code: searchInput || undefined },
        filter: {
          is_active: statusFilter !== 'all' ? statusFilter === 'true' : undefined,
        },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const deleteOne = useDeleteLearningExpectation();
  const deleteMany = useDeleteLearningExpectations();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildLearningExpectationColumns({
        onView: (expectation) => router.push(`/diario/habilidades/${expectation.id}`),
        onEdit: (expectation) => router.push(`/diario/habilidades/${expectation.id}/editar`),
        onDelete: (expectation) => setConfirm({ mode: 'single', expectations: [expectation] }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;

    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.expectations[0]!.id);
        toastSuccess('Habilidade excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.expectations.map((expectation) => expectation.id));
        toastSuccess(`${confirm.expectations.length} habilidades excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Habilidades (página)', value: rows.length, icon: 'Brain', accent: 'primary' },
    { label: 'Ativas', value: rows.filter((expectation) => expectation.is_active).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Inativas', value: rows.filter((expectation) => !expectation.is_active).length, icon: 'CirclePause', accent: 'muted' },
    { label: 'Total', value: rows.length, icon: 'BookOpen', accent: 'warning' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Diário Online', href: '/diario' }, { label: 'Habilidades BNCC' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Habilidades BNCC"
            description="Catálogo de habilidades de aprendizagem por série e componente curricular."
            actions={<Button asChild><Link href="/diario/habilidades/nova"><Plus /> Nova habilidade</Link></Button>}
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as habilidades.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(expectation) => expectation.id}
              loading={query.isLoading}
              exportFilename="habilidades-bncc"
              emptyMessage="Nenhuma habilidade encontrada com os filtros atuais."
              onRowClick={(expectation) => router.push(`/diario/habilidades/${expectation.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por código BNCC…' }}
              filters={
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'true' | 'false')}>
                  <SelectTrigger size="sm" className="w-44">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="true">Ativas</SelectItem>
                    <SelectItem value="false">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', expectations: selected });
                    clear();
                  }}
                >
                  <Trash2 /> Excluir selecionadas
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
        title={confirm?.mode === 'bulk' ? 'Excluir habilidades selecionadas?' : 'Excluir habilidade?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.expectations.length} habilidades serão excluídas.`
            : `A habilidade ${confirm?.expectations[0]?.bncc_code} será excluída.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
