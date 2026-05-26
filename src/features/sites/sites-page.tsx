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
import { buildSiteColumns } from './columns';
import { SITE_OWNER_TYPE_LABELS, type Site } from './types';
import { useDeleteSite, useDeleteSites, useSites } from './hooks';

type ConfirmState =
  | { mode: 'single'; site: Site }
  | { mode: 'bulk'; sites: Site[] }
  | null;

export function SitesPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [ownerType, setOwnerType] = React.useState('all');
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
  }, [search, ownerType, perPage]);

  const query = useSites({
    search: { name: search || undefined },
    filter: {
      owner_type: ownerType !== 'all' ? ownerType : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteSite();
  const deleteMany = useDeleteSites();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildSiteColumns({
        onView: (s) => router.push(`/portal/${s.id}`),
        onEdit: (s) => router.push(`/portal/${s.id}/editar`),
        onDelete: (s) => setConfirm({ mode: 'single', site: s }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.site.id);
        toastSuccess('Site excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.sites.map((s) => s.id));
        toastSuccess(`${confirm.sites.length} sites excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Sites (página)', value: rows.length, icon: 'Globe', accent: 'primary' },
    {
      label: 'Publicados',
      value: rows.filter((s) => s.is_published).length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Rascunhos',
      value: rows.filter((s) => !s.is_published).length,
      icon: 'FileEdit',
      accent: 'muted',
    },
    {
      label: 'Com domínio próprio',
      value: rows.filter((s) => s.custom_domain).length,
      icon: 'Link',
      accent: 'secondary',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Portal Educacional' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Portal Educacional"
            description="Sites e portais da rede educacional"
            actions={
              <Button asChild>
                <Link href="/portal/novo">
                  <Plus /> Novo site
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os sites. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(s) => s.id}
              loading={query.isLoading}
              exportFilename="portal-sites"
              emptyMessage="Nenhum site encontrado com os filtros atuais."
              onRowClick={(s) => router.push(`/portal/${s.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              filters={
                <Select value={ownerType} onValueChange={setOwnerType}>
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(SITE_OWNER_TYPE_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', sites: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir sites selecionados?' : 'Excluir site?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.sites.length} sites serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O site "${confirm.site.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
