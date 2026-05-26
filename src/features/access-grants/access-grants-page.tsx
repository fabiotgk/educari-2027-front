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
import { buildAccessGrantColumns, deriveStatus } from './columns';
import { SCOPE_TYPE_LABELS, STATUS_LABELS, type AccessGrant, type AccessGrantStatus } from './types';
import { useDeleteAccessGrant, useDeleteAccessGrants, useAccessGrants } from './hooks';

type ConfirmState =
  | { mode: 'single'; grant: AccessGrant }
  | { mode: 'bulk'; grants: AccessGrant[] }
  | null;

export function AccessGrantsPage() {
  const router = useRouter();

  // Filtros / busca / paginação
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [scopeType, setScopeType] = React.useState('all');
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
  }, [search, scopeType, status, perPage]);

  const query = useAccessGrants({
    search: { role: search || undefined },
    filter: {
      scope_type: scopeType !== 'all' ? scopeType : undefined,
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteAccessGrant();
  const deleteMany = useDeleteAccessGrants();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildAccessGrantColumns({
        onView: (ag) => router.push(`/auditoria/${ag.id}`),
        onEdit: (ag) => router.push(`/auditoria/${ag.id}/editar`),
        onDelete: (ag) => setConfirm({ mode: 'single', grant: ag }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.grant.id);
        toastSuccess('Concessão de acesso excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.grants.map((g) => g.id));
        toastSuccess(`${confirm.grants.length} concessões de acesso excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Total de concessões', value: rows.length, icon: 'ShieldAlert', accent: 'primary' },
    {
      label: 'Ativas',
      value: rows.filter((g) => deriveStatus(g) === 'active').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Revogadas',
      value: rows.filter((g) => deriveStatus(g) === 'revoked').length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Acesso e Auditoria' }, { label: 'Concessões' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Concessões de acesso"
            description="Gerencie os acessos e permissões dos usuários do sistema"
            actions={
              <Button asChild>
                <Link href="/auditoria/nova">
                  <Plus /> Nova concessão
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as concessões de acesso. Verifique sua conexão e tente
              novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(g) => g.id}
              loading={query.isLoading}
              exportFilename="concessoes-acesso"
              emptyMessage="Nenhuma concessão de acesso encontrada com os filtros atuais."
              onRowClick={(g) => router.push(`/auditoria/${g.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por papel…',
              }}
              filters={
                <>
                  <Select value={scopeType} onValueChange={setScopeType}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Escopo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os escopos</SelectItem>
                      {Object.entries(SCOPE_TYPE_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="revoked">Revogadas</SelectItem>
                      <SelectItem value="expired">Expiradas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', grants: selected });
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
          confirm?.mode === 'bulk' ? 'Excluir concessões selecionadas?' : 'Excluir concessão de acesso?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.grants.length} concessões de acesso serão excluídas. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `A concessão de acesso para o papel "${confirm.grant.role}" será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
