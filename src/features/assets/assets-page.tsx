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
import { buildAssetColumns } from './columns';
import { ASSET_CONDITION_LABELS, ASSET_STATUS_LABELS, type Asset } from './types';
import { useDeleteAsset, useDeleteAssets, useAssets } from './hooks';

type ConfirmState =
  | { mode: 'single'; asset: Asset }
  | { mode: 'bulk'; assets: Asset[] }
  | null;

export function AssetsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [condition, setCondition] = React.useState('all');
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
  }, [search, status, condition, perPage]);

  const query = useAssets({
    search: { name: search || undefined },
    filter: {
      status: status !== 'all' ? status : undefined,
      condition: condition !== 'all' ? condition : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteAsset();
  const deleteMany = useDeleteAssets();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildAssetColumns({
        onView: (a) => router.push(`/patrimonio/${a.id}`),
        onEdit: (a) => router.push(`/patrimonio/${a.id}/editar`),
        onDelete: (a) => setConfirm({ mode: 'single', asset: a }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.asset.id);
        toastSuccess('Bem excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.assets.map((a) => a.id));
        toastSuccess(`${confirm.assets.length} bens excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Bens (página)', value: rows.length, icon: 'Package', accent: 'primary' },
    { label: 'Ativos', value: rows.filter((a) => a.status === 'active').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Em manutenção', value: rows.filter((a) => a.status === 'maintenance').length, icon: 'Wrench', accent: 'warning' },
    { label: 'Baixados/Perdidos', value: rows.filter((a) => a.status === 'disposed' || a.status === 'lost').length, icon: 'CircleX', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Patrimônio' }, { label: 'Bens' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Patrimônio"
            description="Bens patrimoniais da rede escolar"
            actions={
              <Button asChild>
                <Link href="/patrimonio/nova">
                  <Plus /> Novo bem
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os bens patrimoniais. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(a) => a.id}
              loading={query.isLoading}
              exportFilename="patrimonio"
              emptyMessage="Nenhum bem encontrado com os filtros atuais."
              onRowClick={(a) => router.push(`/patrimonio/${a.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              filters={
                <>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(ASSET_STATUS_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(ASSET_CONDITION_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', assets: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir bens selecionados?' : 'Excluir bem?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.assets.length} bens serão excluídos.`
            : confirm?.mode === 'single'
              ? `O bem "${confirm.asset.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
