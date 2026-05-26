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
import { buildTransferEventColumns } from './columns';
import { TRANSFER_EVENT_STATUS_LABELS, type TransferEvent } from './types';
import {
  useDeleteTransferEvent,
  useDeleteTransferEvents,
  useTransferEvents,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; event: TransferEvent }
  | { mode: 'bulk'; events: TransferEvent[] }
  | null;

export function TransferEventsPage() {
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

  const query = useTransferEvents({
    search: { title: search || undefined },
    filter: {
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteTransferEvent();
  const deleteMany = useDeleteTransferEvents();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildTransferEventColumns({
        onView: (e) => router.push(`/remocao/${e.id}`),
        onEdit: (e) => router.push(`/remocao/${e.id}/editar`),
        onDelete: (e) => setConfirm({ mode: 'single', event: e }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.event.id);
        toastSuccess('Evento excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.events.map((e) => e.id));
        toastSuccess(`${confirm.events.length} eventos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Eventos (página)', value: rows.length, icon: 'ArrowLeftRight', accent: 'primary' },
    {
      label: 'Abertos',
      value: rows.filter((e) => e.status === 'open').length,
      icon: 'FolderOpen',
      accent: 'success',
    },
    {
      label: 'Em execução',
      value: rows.filter((e) => e.status === 'executed').length,
      icon: 'Play',
      accent: 'warning',
    },
    {
      label: 'Publicados',
      value: rows.filter((e) => e.status === 'published').length,
      icon: 'Globe',
      accent: 'secondary',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Concurso de Remoção' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Concurso de Remoção"
            description="Eventos e quadro de vagas do concurso de remoção"
            actions={
              <Button asChild>
                <Link href="/remocao/novo">
                  <Plus /> Novo evento
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(e) => e.id}
              loading={query.isLoading}
              exportFilename="eventos-remocao"
              emptyMessage="Nenhum evento encontrado com os filtros atuais."
              onRowClick={(e) => router.push(`/remocao/${e.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por título…',
              }}
              filters={
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger size="sm" className="w-44">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as situações</SelectItem>
                    {Object.entries(TRANSFER_EVENT_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', events: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir eventos selecionados?' : 'Excluir evento?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.events.length} eventos serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O evento "${confirm.event.title}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
