'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildDistanceCenterColumns } from './columns';
import type { DistanceCenter } from './types';
import { useDeleteDistanceCenter, useDeleteDistanceCenters, useDistanceCenters } from './hooks';

type ConfirmState =
  | { mode: 'single'; center: DistanceCenter }
  | { mode: 'bulk'; centers: DistanceCenter[] }
  | null;

export function DistanceCentersPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
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
  }, [search, perPage]);

  const query = useDistanceCenters({
    search: { name: search || undefined },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteDistanceCenter();
  const deleteMany = useDeleteDistanceCenters();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildDistanceCenterColumns({
        onView: (c) => router.push(`/polos/${c.id}`),
        onEdit: (c) => router.push(`/polos/${c.id}/editar`),
        onDelete: (c) => setConfirm({ mode: 'single', center: c }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.center.id);
        toastSuccess('Polo excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.centers.map((c) => c.id));
        toastSuccess(`${confirm.centers.length} polos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const totalCapacity = rows.reduce((acc, c) => acc + (c.capacity ?? 0), 0);

  const stats: Stat[] = [
    { label: 'Polos (página)', value: rows.length, icon: 'MapPin', accent: 'primary' },
    {
      label: 'Com coordenador',
      value: rows.filter((c) => c.coordinator_user_id).length,
      icon: 'UserCheck',
      accent: 'success',
    },
    {
      label: 'Capacidade total',
      value: totalCapacity,
      icon: 'Users',
      accent: 'warning',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Polos EAD' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Polos EAD"
            description="Polos de atendimento de educação a distância"
            actions={
              <Button asChild>
                <Link href="/polos/nova">
                  <Plus /> Novo polo
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os polos EAD. Verifique sua conexão.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(c) => c.id}
              loading={query.isLoading}
              exportFilename="polos-ead"
              emptyMessage="Nenhum polo encontrado."
              onRowClick={(c) => router.push(`/polos/${c.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', centers: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir polos selecionados?' : 'Excluir polo?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.centers.length} polos serão excluídos.`
            : confirm?.mode === 'single'
              ? `O polo "${confirm.center.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
