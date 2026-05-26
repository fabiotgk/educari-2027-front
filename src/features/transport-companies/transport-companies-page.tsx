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
import { buildTransportCompanyColumns } from './columns';
import type { TransportCompany } from './types';
import {
  useDeleteTransportCompanies,
  useDeleteTransportCompany,
  useTransportCompanies,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; company: TransportCompany }
  | { mode: 'bulk'; companies: TransportCompany[] }
  | null;

export function TransportCompaniesPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('all');
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
  }, [search, activeFilter, perPage]);

  const query = useTransportCompanies({
    search: { name: search || undefined },
    filter: {
      is_active:
        activeFilter !== 'all' ? (activeFilter === 'active' ? 'true' : 'false') : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteTransportCompany();
  const deleteMany = useDeleteTransportCompanies();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildTransportCompanyColumns({
        onView: (c) => router.push(`/transporte/${c.id}`),
        onEdit: (c) => router.push(`/transporte/${c.id}/editar`),
        onDelete: (c) => setConfirm({ mode: 'single', company: c }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.company.id);
        toastSuccess('Empresa excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.companies.map((c) => c.id));
        toastSuccess(`${confirm.companies.length} empresas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Empresas (página)', value: rows.length, icon: 'Bus', accent: 'primary' },
    {
      label: 'Ativas',
      value: rows.filter((c) => c.is_active).length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Inativas',
      value: rows.filter((c) => !c.is_active).length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar
        breadcrumbs={[{ label: 'Transporte Escolar' }, { label: 'Empresas' }]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Empresas de Transporte"
            description="Empresas prestadoras do serviço de transporte escolar"
            actions={
              <Button asChild>
                <Link href="/transporte/nova">
                  <Plus /> Nova empresa
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as empresas. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(c) => c.id}
              loading={query.isLoading}
              exportFilename="empresas-transporte"
              emptyMessage="Nenhuma empresa encontrada com os filtros atuais."
              onRowClick={(c) => router.push(`/transporte/${c.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              filters={
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', companies: selected });
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
            ? 'Excluir empresas selecionadas?'
            : 'Excluir empresa de transporte?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.companies.length} empresas serão excluídas. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `A empresa "${confirm.company.name}" será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
