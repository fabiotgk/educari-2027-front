'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildPdiPlanColumns } from './columns';
import { PDI_PLAN_STATUS_LABELS, type PdiPlan } from './types';
import { useDeletePdiPlan, useDeletePdiPlans, usePdiPlans } from './hooks';

type ConfirmState =
  | { mode: 'single'; plan: PdiPlan }
  | { mode: 'bulk'; plans: PdiPlan[] }
  | null;

export function PdiPlansPage() {
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

  const query = usePdiPlans({
    filter: {
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeletePdiPlan();
  const deleteMany = useDeletePdiPlans();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildPdiPlanColumns({
        onView: (p) => router.push(`/aee/${p.id}`),
        onEdit: (p) => router.push(`/aee/${p.id}/editar`),
        onDelete: (p) => setConfirm({ mode: 'single', plan: p }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.plan.id);
        toastSuccess('PDI excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.plans.map((p) => p.id));
        toastSuccess(`${confirm.plans.length} PDIs excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'PDIs (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    {
      label: 'Ativos',
      value: rows.filter((p) => p.status === 'active').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Concluídos',
      value: rows.filter((p) => p.status === 'completed').length,
      icon: 'CheckCheck',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Educação Especial' }, { label: 'Planos PDI' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Planos de Desenvolvimento Individual (PDI)"
            description="PDIs dos estudantes público-alvo da educação especial"
            actions={
              <Button asChild>
                <Link href="/aee/novo">
                  <Plus /> Novo PDI
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os PDIs. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(p) => p.id}
              loading={query.isLoading}
              exportFilename="pdis"
              emptyMessage="Nenhum PDI encontrado com os filtros atuais."
              onRowClick={(p) => router.push(`/aee/${p.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar…',
              }}
              filters={
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(PDI_PLAN_STATUS_LABELS).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
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
                    setCursorStack((s) => {
                      const next = [...s];
                      const prev = next.pop() ?? null;
                      setCursor(prev);
                      return next;
                    });
                  }}
                  onNext={() => {
                    setCursorStack((s) => [...s, cursor]);
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
        onOpenChange={(o) => !o && setConfirm(null)}
        destructive
        loading={deleting}
        title={confirm?.mode === 'bulk' ? 'Excluir PDIs selecionados?' : 'Excluir PDI?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.plans.length} PDIs serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O PDI do ano "${confirm.plan.reference_year}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
