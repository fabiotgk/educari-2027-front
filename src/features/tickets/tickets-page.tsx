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
import { buildTicketColumns } from './columns';
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type Ticket,
} from './types';
import { useDeleteTicket, useDeleteTickets, useTickets } from './hooks';

type ConfirmState =
  | { mode: 'single'; ticket: Ticket }
  | { mode: 'bulk'; tickets: Ticket[] }
  | null;

export function TicketsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [priority, setPriority] = React.useState('all');
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
  }, [search, priority, status, perPage]);

  const query = useTickets({
    search: { subject: search || undefined },
    filter: {
      priority: priority !== 'all' ? priority : undefined,
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteTicket();
  const deleteMany = useDeleteTickets();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildTicketColumns({
        onView: (t) => router.push(`/helpdesk/${t.id}`),
        onEdit: (t) => router.push(`/helpdesk/${t.id}/editar`),
        onDelete: (t) => setConfirm({ mode: 'single', ticket: t }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.ticket.id);
        toastSuccess('Chamado excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.tickets.map((t) => t.id));
        toastSuccess(`${confirm.tickets.length} chamados excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Chamados (página)', value: rows.length, icon: 'LifeBuoy', accent: 'primary' },
    { label: 'Abertos', value: rows.filter((t) => t.status === 'open').length, icon: 'FolderOpen', accent: 'warning' },
    { label: 'Em andamento', value: rows.filter((t) => t.status === 'in_progress').length, icon: 'Clock', accent: 'muted' },
    { label: 'Críticos', value: rows.filter((t) => t.priority === 'critical').length, icon: 'AlertTriangle', accent: 'warning' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'HelpDesk' }, { label: 'Chamados' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Chamados"
            description="Suporte e atendimento aos usuários da plataforma"
            actions={
              <Button asChild>
                <Link href="/helpdesk/nova">
                  <Plus /> Novo chamado
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os chamados. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(t) => t.id}
              loading={query.isLoading}
              exportFilename="chamados"
              emptyMessage="Nenhum chamado encontrado com os filtros atuais."
              onRowClick={(t) => router.push(`/helpdesk/${t.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por assunto…',
              }}
              filters={
                <>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(TICKET_PRIORITY_LABELS).map(([v, label]) => (
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
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(TICKET_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', tickets: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir chamados selecionados?' : 'Excluir chamado?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.tickets.length} chamados serão excluídos.`
            : confirm?.mode === 'single'
              ? `O chamado "${confirm.ticket.subject}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
