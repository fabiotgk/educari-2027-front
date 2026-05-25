'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

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
import { buildPreEnrollmentColumns } from './columns';
import { PRE_ENROLLMENT_STATUS_LABELS, type PreEnrollmentApplication } from './types';
import {
  useDeletePreEnrollmentApplication,
  useDeletePreEnrollmentApplications,
  usePreEnrollmentApplications,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; application: PreEnrollmentApplication }
  | { mode: 'bulk'; applications: PreEnrollmentApplication[] }
  | null;

export function PreEnrollmentsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
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
  }, [search, statusFilter, perPage]);

  const query = usePreEnrollmentApplications({
    search: { protocol_number: search || undefined },
    filter: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeletePreEnrollmentApplication();
  const deleteMany = useDeletePreEnrollmentApplications();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildPreEnrollmentColumns({
        onView: (a) => router.push(`/pre-matricula/${a.id}`),
        onEdit: (a) => router.push(`/pre-matricula/${a.id}/editar`),
        onDelete: (a) => setConfirm({ mode: 'single', application: a }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.application.id);
        toastSuccess('Inscrição excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.applications.map((a) => a.id));
        toastSuccess(`${confirm.applications.length} inscrições excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Inscrições (página)', value: rows.length, icon: 'ClipboardList', accent: 'primary' },
    { label: 'Enviadas', value: rows.filter((a) => a.status === 'submitted').length, icon: 'Send', accent: 'warning' },
    { label: 'Aprovadas', value: rows.filter((a) => a.status === 'approved').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Matriculadas', value: rows.filter((a) => a.status === 'placed').length, icon: 'UserPlus', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Pré-Matrícula' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Pré-Matrícula"
            description="Inscrições de pré-matrícula recebidas pelo portal"
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as inscrições. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(a) => a.id}
              loading={query.isLoading}
              exportFilename="pre-matriculas"
              emptyMessage="Nenhuma inscrição encontrada com os filtros atuais."
              onRowClick={(a) => router.push(`/pre-matricula/${a.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por protocolo…',
              }}
              filters={
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger size="sm" className="w-44">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(PRE_ENROLLMENT_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', applications: selected });
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
        title={
          confirm?.mode === 'bulk'
            ? 'Excluir inscrições selecionadas?'
            : 'Excluir inscrição?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.applications.length} inscrições serão excluídas.`
            : confirm?.mode === 'single'
              ? `A inscrição "${confirm.application.protocol_number}" será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
