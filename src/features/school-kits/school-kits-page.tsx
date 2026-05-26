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
import { buildSchoolKitColumns } from './columns';
import { SCHOOL_KIT_STATUS_LABELS, type SchoolKit } from './types';
import { useDeleteSchoolKit, useDeleteSchoolKits, useSchoolKits } from './hooks';

type ConfirmState =
  | { mode: 'single'; kit: SchoolKit }
  | { mode: 'bulk'; kits: SchoolKit[] }
  | null;

export function SchoolKitsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [year, setYear] = React.useState('all');
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
  }, [search, status, year, perPage]);

  const query = useSchoolKits({
    search: { name: search || undefined },
    filter: {
      status: status !== 'all' ? status : undefined,
      academic_year: year !== 'all' ? year : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteSchoolKit();
  const deleteMany = useDeleteSchoolKits();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildSchoolKitColumns({
        onView: (k) => router.push(`/material/${k.id}`),
        onEdit: (k) => router.push(`/material/${k.id}/editar`),
        onDelete: (k) => setConfirm({ mode: 'single', kit: k }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.kit.id);
        toastSuccess('Kit excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.kits.map((k) => k.id));
        toastSuccess(`${confirm.kits.length} kits excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const currentYear = String(new Date().getFullYear());
  const years = Array.from({ length: 5 }, (_, i) => String(Number(currentYear) - 2 + i));

  const stats: Stat[] = [
    { label: 'Kits (página)', value: rows.length, icon: 'Package', accent: 'primary' },
    {
      label: 'Ativos',
      value: rows.filter((k) => k.status === 'active').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Planejados',
      value: rows.filter((k) => k.status === 'planned').length,
      icon: 'Clock',
      accent: 'warning',
    },
    {
      label: 'Encerrados',
      value: rows.filter((k) => k.status === 'closed').length,
      icon: 'CircleX',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Material Escolar' }, { label: 'Kits Escolares' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Kits Escolares"
            description="Conjuntos de material escolar e uniformes"
            actions={
              <Button asChild>
                <Link href="/material/nova">
                  <Plus /> Novo kit
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os kits. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(k) => k.id}
              loading={query.isLoading}
              exportFilename="kits-escolares"
              emptyMessage="Nenhum kit encontrado com os filtros atuais."
              onRowClick={(k) => router.push(`/material/${k.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              filters={
                <>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger size="sm" className="w-32">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
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
                      {Object.entries(SCHOOL_KIT_STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', kits: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir kits selecionados?' : 'Excluir kit?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.kits.length} kits serão excluídos.`
            : confirm?.mode === 'single'
              ? `O kit "${confirm.kit.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
