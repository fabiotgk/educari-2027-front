'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DataTable } from '@/components/crud/data-table';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildAbsenceReasonColumns } from './columns';
import { useAbsenceReasons, useDeleteAbsenceReason, useDeleteAbsenceReasons } from './hooks';

type ConfirmState =
  | { mode: 'single'; reasonId: string; reasonLabel: string }
  | { mode: 'bulk'; reasons: string[]; count: number }
  | null;

export function AbsenceReasonsPage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = React.useState<'all' | 'active_only'>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  const query = useAbsenceReasons({
    filter: { active_only: activeFilter === 'active_only' ? true : undefined },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const total = rows.length;

  const activeRows = rows.filter((r) => r.is_active).length;
  const justified = rows.filter((r) => r.is_justified).length;
  const needDocument = rows.filter((r) => r.requires_document).length;
  const stats: Stat[] = [
    { label: 'Motivos (página)', value: total, icon: 'AlertTriangle', accent: 'primary' },
    { label: 'Ativos', value: activeRows, icon: 'CircleCheck', accent: 'success' },
    { label: 'Justificados', value: justified, icon: 'BadgeCheck', accent: 'secondary' },
    { label: 'Exigem documento', value: needDocument, icon: 'FileText', accent: 'warning' },
  ];

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteAbsenceReason();
  const deleteMany = useDeleteAbsenceReasons();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildAbsenceReasonColumns({
        onView: (reason) => router.push(`/frequencia/motivos/${reason.id}`),
        onEdit: (reason) => router.push(`/frequencia/motivos/${reason.id}/editar`),
        onDelete: (reason) =>
          setConfirm({
            mode: 'single',
            reasonId: reason.id,
            reasonLabel: `${reason.code} - ${reason.name}`,
          }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;

    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.reasonId);
        toastSuccess('Motivo de falta excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.reasons);
        toastSuccess(`${confirm.count} motivos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Frequência', href: '/frequencia' }, { label: 'Motivos de Falta' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Motivos de Falta"
            description="Catálogo de motivos com efeito em justificativas e relatórios de frequência."
            actions={
              <Button asChild>
                <Link href="/frequencia/motivos/nova">
                  <Plus /> Novo motivo
                </Link>
              </Button>
            }
          />
          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os motivos de falta.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(reason) => reason.id}
              loading={query.isLoading}
              exportFilename="motivos-falta"
              emptyMessage="Nenhum motivo de falta encontrado com os filtros atuais."
              onRowClick={(reason) => router.push(`/frequencia/motivos/${reason.id}`)}
              filters={
                <Select
                  value={activeFilter}
                  onValueChange={(value) => setActiveFilter(value as 'all' | 'active_only')}
                >
                  <SelectTrigger size="sm" className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active_only">Somente ativos</SelectItem>
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', reasons: selected.map((reason) => reason.id), count: selected.length });
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
                  loading={query.isFetching}
                  hasPrev={cursorStack.length > 0}
                  hasNext={Boolean(nextCursor)}
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
                  onPerPageChange={setPerPage}
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
        title={confirm?.mode === 'bulk' ? 'Excluir motivos selecionados?' : 'Excluir motivo de falta?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.count} motivos serão excluídos.`
            : `O motivo "${confirm?.reasonLabel}" será excluído.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
