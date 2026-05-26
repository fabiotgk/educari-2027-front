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
import { buildSupplierColumns } from './columns';
import type { Supplier } from './types';
import { useDeleteSupplier, useDeleteSuppliers, useSuppliers } from './hooks';

type ConfirmState =
  | { mode: 'single'; supplier: Supplier }
  | { mode: 'bulk'; suppliers: Supplier[] }
  | null;

export function SuppliersPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [regional, setRegional] = React.useState('all');
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
  }, [search, regional, status, perPage]);

  const query = useSuppliers({
    search: { name: search || undefined },
    filter: {
      is_regional: regional !== 'all' ? regional === 'true' : undefined,
      is_active: status !== 'all' ? status === 'true' : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteSupplier();
  const deleteMany = useDeleteSuppliers();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildSupplierColumns({
        onView: (s) => router.push(`/alimentacao/${s.id}`),
        onEdit: (s) => router.push(`/alimentacao/${s.id}/editar`),
        onDelete: (s) => setConfirm({ mode: 'single', supplier: s }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.supplier.id);
        toastSuccess('Fornecedor excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.suppliers.map((s) => s.id));
        toastSuccess(`${confirm.suppliers.length} fornecedores excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Fornecedores (página)', value: rows.length, icon: 'Truck', accent: 'primary' },
    {
      label: 'Ativos',
      value: rows.filter((s) => s.is_active).length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Regionais',
      value: rows.filter((s) => s.is_regional).length,
      icon: 'MapPin',
      accent: 'warning',
    },
    {
      label: 'Inativos',
      value: rows.filter((s) => !s.is_active).length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Alimentação PNAE' }, { label: 'Fornecedores' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Fornecedores PNAE"
            description="Fornecedores de alimentação escolar da rede"
            actions={
              <Button asChild>
                <Link href="/alimentacao/nova">
                  <Plus /> Novo fornecedor
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os fornecedores. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(s) => s.id}
              loading={query.isLoading}
              exportFilename="fornecedores-pnae"
              emptyMessage="Nenhum fornecedor encontrado com os filtros atuais."
              onRowClick={(s) => router.push(`/alimentacao/${s.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              filters={
                <>
                  <Select value={regional} onValueChange={setRegional}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Regional</SelectItem>
                      <SelectItem value="false">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="true">Ativos</SelectItem>
                      <SelectItem value="false">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', suppliers: selected });
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
            ? 'Excluir fornecedores selecionados?'
            : 'Excluir fornecedor?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.suppliers.length} fornecedores serão excluídos.`
            : confirm?.mode === 'single'
              ? `O fornecedor "${confirm.supplier.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
