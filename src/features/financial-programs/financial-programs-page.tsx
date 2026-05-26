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
import { buildFinancialProgramColumns } from './columns';
import { FINANCIAL_PROGRAM_STATUS_LABELS, type FinancialProgram } from './types';
import {
  useDeleteFinancialProgram,
  useDeleteFinancialPrograms,
  useFinancialPrograms,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; program: FinancialProgram }
  | { mode: 'bulk'; programs: FinancialProgram[] }
  | null;

export function FinancialProgramsPage() {
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

  const query = useFinancialPrograms({
    search: { name: search || undefined },
    filter: {
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteFinancialProgram();
  const deleteMany = useDeleteFinancialPrograms();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildFinancialProgramColumns({
        onView: (p) => router.push(`/financeiro/${p.id}`),
        onEdit: (p) => router.push(`/financeiro/${p.id}/editar`),
        onDelete: (p) => setConfirm({ mode: 'single', program: p }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.program.id);
        toastSuccess('Programa financeiro excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.programs.map((p) => p.id));
        toastSuccess(`${confirm.programs.length} programas excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Programas (página)', value: rows.length, icon: 'Landmark', accent: 'primary' },
    {
      label: 'Abertos',
      value: rows.filter((p) => p.status === 'open').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Encerrados',
      value: rows.filter((p) => p.status === 'closed').length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Financeiro' }, { label: 'Programas FNDE' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Programas FNDE"
            description="Programas financeiros federais gerenciados pela rede"
            actions={
              <Button asChild>
                <Link href="/financeiro/novo">
                  <Plus /> Novo programa
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os programas financeiros. Verifique sua conexão e tente
              novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(p) => p.id}
              loading={query.isLoading}
              exportFilename="programas-fnde"
              emptyMessage="Nenhum programa financeiro encontrado com os filtros atuais."
              onRowClick={(p) => router.push(`/financeiro/${p.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              filters={
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(FINANCIAL_PROGRAM_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', programs: selected });
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
        title={
          confirm?.mode === 'bulk'
            ? 'Excluir programas selecionados?'
            : 'Excluir programa financeiro?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.programs.length} programas serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O programa "${confirm.program.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
