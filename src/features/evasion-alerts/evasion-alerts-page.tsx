'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { EVASION_ALERT_SCOPE_LABELS, EvasionAlert } from './types';
import { buildEvasionAlertColumns } from './columns';
import {
  useDeleteEvasionAlert,
  useDeleteEvasionAlerts,
  useEvasionAlerts,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; alert: EvasionAlert }
  | { mode: 'bulk'; alerts: EvasionAlert[] }
  | null;

export function EvasionAlertsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'active'>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [activeFilter, perPage]);

  const query = useEvasionAlerts({
    filter: activeFilter === 'active' ? { active_only: true } : {},
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteEvasionAlert();
  const deleteMany = useDeleteEvasionAlerts();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildEvasionAlertColumns({
        onView: (alert) => router.push(`/evasao/alertas/${alert.id}`),
        onEdit: (alert) => router.push(`/evasao/alertas/${alert.id}/editar`),
        onDelete: (alert) => setConfirm({ mode: 'single', alert }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.alert.id);
        toastSuccess('Alerta excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.alerts.map((alert) => alert.id));
        toastSuccess(`${confirm.alerts.length} alertas excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const totalActive = rows.filter((alert) => alert.is_active).length;
  const totalInactive = rows.length - totalActive;
  const byScope = {
    monthly: rows.filter((alert) => alert.scope === 'monthly').length,
    period: rows.filter((alert) => alert.scope === 'period').length,
    custom: rows.filter((alert) => alert.scope === 'custom').length,
  };

  const stats: Stat[] = [
    { label: 'Alertas (página)', value: rows.length, icon: 'BellRing', accent: 'primary' },
    { label: 'Ativos', value: totalActive, icon: 'CircleCheck', accent: 'success' },
    { label: 'Inativos', value: totalInactive, icon: 'CircleX', accent: 'muted' },
    { label: EVASION_ALERT_SCOPE_LABELS.monthly, value: byScope.monthly, icon: 'CalendarDays', accent: 'secondary' },
    {
      label: EVASION_ALERT_SCOPE_LABELS.period,
      value: byScope.period,
      icon: 'CalendarCog',
      accent: 'warning',
    },
    {
      label: EVASION_ALERT_SCOPE_LABELS.custom,
      value: byScope.custom,
      icon: 'SlidersHorizontal',
      accent: 'secondary',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Monitor de Evasão', href: '/evasao' }, { label: 'Alertas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Alertas de evasão"
            description="Gerencie as regras que disparam alertas de risco de evasão."
            actions={<Button asChild><Link href="/evasao/alertas/nova"><Plus /> Novo alerta</Link></Button>}
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os alertas.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(alert) => alert.id}
              loading={query.isLoading}
              exportFilename="alertas-evasao"
              emptyMessage="Nenhum alerta encontrado."
              onRowClick={(alert) => router.push(`/evasao/alertas/${alert.id}`)}
              filters={
                <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as 'all' | 'active')}>
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as regras</SelectItem>
                    <SelectItem value="active">Somente ativas</SelectItem>
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', alerts: selected });
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
                  hasPrev={cursorStack.length > 0}
                  hasNext={Boolean(nextCursor)}
                  loading={query.isFetching}
                  onPrev={() => {
                    setCursorStack((stack) => {
                      const next = [...stack];
                      const prev = next.pop() ?? null;
                      setCursor(prev);
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
        title={confirm?.mode === 'bulk' ? 'Excluir alertas selecionados?' : 'Excluir alerta?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.alerts.length} alertas serão excluídos.`
            : confirm?.mode === 'single'
              ? `O alerta "${confirm.alert.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
