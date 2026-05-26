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
import { buildLibraryItemColumns } from './columns';
import { LIBRARY_ITEM_KIND_LABELS, type LibraryItem } from './types';
import { useDeleteLibraryItem, useDeleteLibraryItems, useLibraryItems } from './hooks';

type ConfirmState =
  | { mode: 'single'; item: LibraryItem }
  | { mode: 'bulk'; items: LibraryItem[] }
  | null;

export function LibraryItemsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [kind, setKind] = React.useState('all');
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
  }, [search, kind, perPage]);

  const query = useLibraryItems({
    search: { title: search || undefined },
    filter: {
      kind: kind !== 'all' ? kind : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteLibraryItem();
  const deleteMany = useDeleteLibraryItems();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildLibraryItemColumns({
        onView: (item) => router.push(`/biblioteca/${item.id}`),
        onEdit: (item) => router.push(`/biblioteca/${item.id}/editar`),
        onDelete: (item) => setConfirm({ mode: 'single', item }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.item.id);
        toastSuccess('Item excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.items.map((i) => i.id));
        toastSuccess(`${confirm.items.length} itens excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const totalCopies = rows.reduce((acc, i) => acc + i.copies_total, 0);
  const availableCopies = rows.reduce((acc, i) => acc + i.copies_available, 0);

  const stats: Stat[] = [
    { label: 'Itens no acervo', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    { label: 'Total de cópias', value: totalCopies, icon: 'Library', accent: 'muted' },
    { label: 'Disponíveis', value: availableCopies, icon: 'CircleCheck', accent: 'success' },
    { label: 'Emprestadas', value: totalCopies - availableCopies, icon: 'BookMarked', accent: 'warning' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Biblioteca' }, { label: 'Acervo' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Acervo da Biblioteca"
            description="Livros, revistas, DVDs e outros itens do acervo"
            actions={
              <Button asChild>
                <Link href="/biblioteca/nova">
                  <Plus /> Novo item
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar o acervo. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(item) => item.id}
              loading={query.isLoading}
              exportFilename="acervo-biblioteca"
              emptyMessage="Nenhum item encontrado com os filtros atuais."
              onRowClick={(item) => router.push(`/biblioteca/${item.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por título…',
              }}
              filters={
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(LIBRARY_ITEM_KIND_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', items: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir itens selecionados?' : 'Excluir item?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.items.length} itens serão excluídos.`
            : confirm?.mode === 'single'
              ? `O item "${confirm.item.title}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
