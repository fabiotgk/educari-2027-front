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
import { buildStateMealProgramColumns } from './columns';
import { STATE_MEAL_PROGRAM_STATUS_LABELS, type StateMealProgram } from './types';
import {
  useDeleteStateMealProgram,
  useDeleteStateMealPrograms,
  useStateMealPrograms,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; program: StateMealProgram }
  | { mode: 'bulk'; programs: StateMealProgram[] }
  | null;

export function StateMealProgramsPage() {
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

  const query = useStateMealPrograms({
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
  const deleteOne = useDeleteStateMealProgram();
  const deleteMany = useDeleteStateMealPrograms();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildStateMealProgramColumns({
        onView: (s) => router.push(`/pnae-estadual/${s.id}`),
        onEdit: (s) => router.push(`/pnae-estadual/${s.id}/editar`),
        onDelete: (s) => setConfirm({ mode: 'single', program: s }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.program.id);
        toastSuccess('Programa excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.programs.map((s) => s.id));
        toastSuccess(`${confirm.programs.length} programas excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Programas (página)', value: rows.length, icon: 'FileText', accent: 'primary' },
    { label: 'Ativos', value: rows.filter((s) => s.status === 'active').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Encerrados', value: rows.filter((s) => s.status === 'closed').length, icon: 'CircleX', accent: 'muted' },
    {
      label: 'Valor total (página)',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        rows.reduce((sum, s) => sum + (s.total_value ?? 0), 0),
      ),
      icon: 'Banknote',
      accent: 'secondary',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'PNAE Estadual' }, { label: 'Programas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Programas estaduais de alimentação escolar"
            description="Gestão dos programas estaduais vinculados ao PNAE"
            actions={
              <Button asChild>
                <Link href="/pnae-estadual/nova">
                  <Plus /> Novo programa
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os programas. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(s) => s.id}
              loading={query.isLoading}
              exportFilename="programas-pnae-estadual"
              emptyMessage="Nenhum programa encontrado com os filtros atuais."
              onRowClick={(s) => router.push(`/pnae-estadual/${s.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por nome…' }}
              filters={
                <>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(STATE_MEAL_PROGRAM_STATUS_LABELS).map(([v, label]) => (
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
        title={confirm?.mode === 'bulk' ? 'Excluir programas selecionados?' : 'Excluir programa?'}
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
