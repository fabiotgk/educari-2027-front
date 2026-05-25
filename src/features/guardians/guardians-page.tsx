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
import { buildGuardianColumns } from './columns';
import type { Guardian } from './types';
import { useDeleteGuardian, useDeleteGuardians, useGuardians } from './hooks';

type ConfirmState =
  | { mode: 'single'; guardian: Guardian }
  | { mode: 'bulk'; guardians: Guardian[] }
  | null;

export function GuardiansPage() {
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

  const query = useGuardians({
    search: { full_name: search || undefined },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteGuardian();
  const deleteMany = useDeleteGuardians();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildGuardianColumns({
        onView: (g) => router.push(`/responsaveis/${g.id}`),
        onEdit: (g) => router.push(`/responsaveis/${g.id}/editar`),
        onDelete: (g) => setConfirm({ mode: 'single', guardian: g }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.guardian.id);
        toastSuccess('Responsável excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.guardians.map((g) => g.id));
        toastSuccess(`${confirm.guardians.length} responsáveis excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Responsáveis (página)', value: rows.length, icon: 'Users', accent: 'primary' },
    { label: 'Com e-mail', value: rows.filter((g) => Boolean(g.email)).length, icon: 'Mail', accent: 'success' },
    { label: 'Com WhatsApp', value: rows.filter((g) => Boolean(g.whatsapp)).length, icon: 'MessageSquare', accent: 'warning' },
    { label: 'Dados protegidos', value: rows.filter((g) => g.has_pii).length, icon: 'ShieldCheck', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Responsáveis' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Responsáveis"
            description="Responsáveis e familiares cadastrados na rede"
            actions={
              <Button asChild>
                <Link href="/responsaveis/novo">
                  <Plus /> Novo responsável
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os responsáveis. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(g) => g.id}
              loading={query.isLoading}
              exportFilename="responsaveis"
              emptyMessage="Nenhum responsável encontrado com os filtros atuais."
              onRowClick={(g) => router.push(`/responsaveis/${g.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por nome…' }}
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', guardians: selected });
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
          confirm?.mode === 'bulk' ? 'Excluir responsáveis selecionados?' : 'Excluir responsável?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.guardians.length} responsáveis serão excluídos.`
            : confirm?.mode === 'single'
              ? `O responsável "${confirm.guardian.full_name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
