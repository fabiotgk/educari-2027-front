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
import { CursorPager } from '@/components/crud/cursor-pager';
import { DataTable } from '@/components/crud/data-table';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  EVASION_OCCURRENCE_ASSIGNED_TO_LABELS,
  EVASION_OCCURRENCE_STATUS_LABELS,
  type EvasionOccurrence,
  type EvasionOccurrenceAssignedTo,
  type EvasionOccurrenceStatus,
} from './types';
import { buildEvasionOccurrenceColumns } from './columns';
import {
  useDeleteEvasionOccurrence,
  useDeleteEvasionOccurrences,
  useEvasionOccurrences,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; occurrence: EvasionOccurrence }
  | { mode: 'bulk'; occurrences: EvasionOccurrence[] }
  | null;

export function EvasionOccurrencesPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('all');
  const [assignedTo, setAssignedTo] = React.useState<string>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [search, status, assignedTo, perPage]);

  const query = useEvasionOccurrences({
    filter: {
      enrollment_id: search || undefined,
      status: status !== 'all' ? status : undefined,
      assigned_to: assignedTo !== 'all' ? assignedTo : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteEvasionOccurrence();
  const deleteMany = useDeleteEvasionOccurrences();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildEvasionOccurrenceColumns({
        onView: (row) => router.push(`/evasao/${row.id}`),
        onEdit: (row) => router.push(`/evasao/${row.id}/editar`),
        onDelete: (row) => setConfirm({ mode: 'single', occurrence: row }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.occurrence.id);
        toastSuccess('Ocorrência excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.occurrences.map((row) => row.id));
        toastSuccess(`${confirm.occurrences.length} ocorrências excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const statusCounts = React.useMemo(() => {
    const total = rows.length;
    const open = rows.filter((r) => r.status === 'open').length;
    const inProgress = rows.filter((r) => r.status === 'in_progress').length;
    const escalated = rows.filter((r) => r.status === 'escalated').length;
    const resolved = rows.filter((r) => r.status === 'resolved').length;
    const closed = rows.filter((r) => r.status === 'closed').length;

    return { total, open, inProgress, escalated, resolved, closed };
  }, [rows]);

  const stats: Stat[] = [
    { label: 'Ocorrências (página)', value: statusCounts.total, icon: 'ShieldAlert', accent: 'primary' },
    { label: `Abertas (${EVASION_OCCURRENCE_STATUS_LABELS.open})`, value: statusCounts.open, icon: 'CircleAlert', accent: 'warning' },
    {
      label: `Em atendimento (${EVASION_OCCURRENCE_STATUS_LABELS.in_progress})`,
      value: statusCounts.inProgress,
      icon: 'CirclePlay',
      accent: 'secondary',
    },
    {
      label: `Escalonadas (${EVASION_OCCURRENCE_STATUS_LABELS.escalated})`,
      value: statusCounts.escalated,
      icon: 'TrendingUp',
      accent: 'secondary',
    },
    { label: `Resolvidas (${EVASION_OCCURRENCE_STATUS_LABELS.resolved})`, value: statusCounts.resolved, icon: 'CircleCheck', accent: 'success' },
    { label: `Fechadas (${EVASION_OCCURRENCE_STATUS_LABELS.closed})`, value: statusCounts.closed, icon: 'CircleX', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Monitor de Evasão' }, { label: 'Ocorrências' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Ocorrências de evasão"
            description="Hub de ocorrências detectadas por matrícula com filtros por status e responsável."
            actions={<Button asChild><Link href="/evasao/nova"><Plus /> Nova ocorrência</Link></Button>}
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as ocorrências.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(row) => row.id}
              loading={query.isLoading}
              exportFilename="ocorrencias-evasao"
              emptyMessage="Nenhuma ocorrência encontrada com os filtros atuais."
              onRowClick={(row) => router.push(`/evasao/${row.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Filtrar por matrícula (UUID)' }}
              filters={
                <>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(EVASION_OCCURRENCE_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger size="sm" className="w-48">
                      <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os responsáveis</SelectItem>
                      {(
                        Object.entries(EVASION_OCCURRENCE_ASSIGNED_TO_LABELS) as Array<
                          [EvasionOccurrenceAssignedTo, string]
                        >
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
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
                    setConfirm({ mode: 'bulk', occurrences: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir ocorrências selecionadas?' : 'Excluir ocorrência?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.occurrences.length} ocorrências serão excluídas.`
            : `A ocorrência da matrícula ${confirm?.occurrence?.enrollment_id} será excluída.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
