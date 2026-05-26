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
import { buildEducacensoExportColumns } from './columns';
import {
  EDUCACENSO_STAGE_LABELS,
  EDUCACENSO_STATUS_LABELS,
  type EducacensoExport,
} from './types';
import {
  useDeleteEducacensoExport,
  useDeleteEducacensoExports,
  useEducacensoExports,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; export: EducacensoExport }
  | { mode: 'bulk'; exports: EducacensoExport[] }
  | null;

export function EducacensoExportsPage() {
  const router = useRouter();

  const [stage, setStage] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [stage, status, perPage]);

  const query = useEducacensoExports({
    filter: {
      stage: stage !== 'all' ? stage : undefined,
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteEducacensoExport();
  const deleteMany = useDeleteEducacensoExports();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildEducacensoExportColumns({
        onView: (e) => router.push(`/educacenso/${e.id}`),
        onEdit: (e) => router.push(`/educacenso/${e.id}/editar`),
        onDelete: (e) => setConfirm({ mode: 'single', export: e }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.export.id);
        toastSuccess('Exportação excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.exports.map((e) => e.id));
        toastSuccess(`${confirm.exports.length} exportações excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    {
      label: 'Exportações (página)',
      value: rows.length,
      icon: 'FileDown',
      accent: 'primary',
    },
    {
      label: 'Prontas',
      value: rows.filter((e) => e.status === 'ready').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Exportadas',
      value: rows.filter((e) => e.status === 'exported').length,
      icon: 'Upload',
      accent: 'secondary',
    },
    {
      label: 'Com falhas',
      value: rows.filter((e) => e.status === 'failed').length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'EDUCACENSO' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="EDUCACENSO"
            description="Exportações de dados ao Educacenso / INEP"
            actions={
              <Button asChild>
                <Link href="/educacenso/novo">
                  <Plus /> Nova exportação
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as exportações. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(e) => e.id}
              loading={query.isLoading}
              exportFilename="educacenso-exportacoes"
              emptyMessage="Nenhuma exportação encontrada com os filtros atuais."
              onRowClick={(e) => router.push(`/educacenso/${e.id}`)}
              filters={
                <>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger size="sm" className="w-48">
                      <SelectValue placeholder="Etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as etapas</SelectItem>
                      {Object.entries(EDUCACENSO_STAGE_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as situações</SelectItem>
                      {Object.entries(EDUCACENSO_STATUS_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', exports: selected });
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
          confirm?.mode === 'bulk' ? 'Excluir exportações selecionadas?' : 'Excluir exportação?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.exports.length} exportações serão excluídas. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `A exportação do Educacenso (${EDUCACENSO_STAGE_LABELS[confirm.export.stage]} ${confirm.export.reference_year}) será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
