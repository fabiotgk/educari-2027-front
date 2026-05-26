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
import { buildStaffMemberColumns } from './columns';
import { STAFF_STATUS_LABELS, type StaffMember } from './types';
import {
  useDeleteStaffMember,
  useDeleteStaffMembers,
  useStaffMembers,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; member: StaffMember }
  | { mode: 'bulk'; members: StaffMember[] }
  | null;

export function StaffMembersPage() {
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

  const query = useStaffMembers({
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
  const deleteOne = useDeleteStaffMember();
  const deleteMany = useDeleteStaffMembers();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildStaffMemberColumns({
        onView: (s) => router.push(`/rh/${s.id}`),
        onEdit: (s) => router.push(`/rh/${s.id}/editar`),
        onDelete: (s) => setConfirm({ mode: 'single', member: s }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.member.id);
        toastSuccess('Servidor excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.members.map((s) => s.id));
        toastSuccess(`${confirm.members.length} servidores excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Servidores (página)', value: rows.length, icon: 'Users', accent: 'primary' },
    {
      label: 'Ativos',
      value: rows.filter((s) => s.status === 'active').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Afastados',
      value: rows.filter((s) => s.status === 'leave').length,
      icon: 'CirclePause',
      accent: 'warning',
    },
    {
      label: 'Inativos',
      value: rows.filter((s) => s.status !== 'active' && s.status !== 'leave').length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'RH Magistério' }, { label: 'Servidores' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Servidores"
            description="Quadro de servidores do magistério municipal"
            actions={
              <Button asChild>
                <Link href="/rh/novo">
                  <Plus /> Novo servidor
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os servidores. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(s) => s.id}
              loading={query.isLoading}
              exportFilename="servidores"
              emptyMessage="Nenhum servidor encontrado com os filtros atuais."
              onRowClick={(s) => router.push(`/rh/${s.id}`)}
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
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(STAFF_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', members: selected });
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
          confirm?.mode === 'bulk' ? 'Excluir servidores selecionados?' : 'Excluir servidor?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.members.length} servidores serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O servidor "${confirm.member.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
