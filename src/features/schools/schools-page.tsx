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
import { buildSchoolColumns } from './columns';
import { SCHOOL_STATUS_LABELS, SCHOOL_TYPE_LABELS, type School } from './types';
import { useDeleteSchool, useDeleteSchools, useSchools } from './hooks';

type ConfirmState = { mode: 'single'; school: School } | { mode: 'bulk'; schools: School[] } | null;

export function SchoolsPage() {
  const router = useRouter();

  // Filtros / busca / paginação
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
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
  }, [search, type, status, perPage]);

  const query = useSchools({
    search: { name: search || undefined },
    filter: {
      type: type !== 'all' ? type : undefined,
      operation_status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteSchool();
  const deleteMany = useDeleteSchools();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildSchoolColumns({
        onView: (s) => router.push(`/cadastros/${s.id}`),
        onEdit: (s) => router.push(`/cadastros/${s.id}/editar`),
        onDelete: (s) => setConfirm({ mode: 'single', school: s }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.school.id);
        toastSuccess('Escola excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.schools.map((s) => s.id));
        toastSuccess(`${confirm.schools.length} escolas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Escolas (página)', value: rows.length, icon: 'Building2', accent: 'primary' },
    { label: 'Ativas', value: rows.filter((s) => s.operation_status === 'active').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Suspensas', value: rows.filter((s) => s.operation_status === 'suspended').length, icon: 'CirclePause', accent: 'warning' },
    { label: 'Fechadas', value: rows.filter((s) => s.operation_status === 'closed').length, icon: 'CircleX', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Cadastros' }, { label: 'Escolas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Escolas"
            description="Unidades escolares da rede municipal"
            actions={
              <Button asChild>
                <Link href="/cadastros/nova">
                  <Plus /> Nova escola
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as escolas. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(s) => s.id}
              loading={query.isLoading}
              exportFilename="escolas"
              emptyMessage="Nenhuma escola encontrada com os filtros atuais."
              onRowClick={(s) => router.push(`/cadastros/${s.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por nome…' }}
              filters={
                <>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {Object.entries(SCHOOL_TYPE_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(SCHOOL_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', schools: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir escolas selecionadas?' : 'Excluir escola?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.schools.length} escolas serão excluídas. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `A escola "${confirm.school.name}" será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
