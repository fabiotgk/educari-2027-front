'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { PageHeader } from '@/components/crud/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildClassDiaryColumns } from './columns';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useClassDiaries, useDeleteClassDiary, useDeleteClassDiaries } from './hooks';
import { type ClassDiary } from './types';
import { classLabel } from './types';

interface ConfirmState {
  mode: 'single' | 'bulk';
  diarys: ClassDiary[];
}

export function ClassDiariesPage() {
  const router = useRouter();
  const currentYear = String(new Date().getFullYear());
  const years = Array.from({ length: 8 }, (_, i) => String(Number(currentYear) - 3 + i));

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [yearFilter, setYearFilter] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput), 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [search, yearFilter, perPage]);

  const query = useClassDiaries({
    search: { academic_year: search || undefined },
    filter: { academic_year: yearFilter !== 'all' ? yearFilter : undefined },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const deleteOne = useDeleteClassDiary();
  const deleteMany = useDeleteClassDiaries();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildClassDiaryColumns({
        onView: (d) => router.push(`/diario/${d.id}`),
        onEdit: (d) => router.push(`/diario/${d.id}/editar`),
        onDelete: (d) => setConfirm({ mode: 'single', diarys: [d] }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.diarys[0]!.id);
        toastSuccess('Diário excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.diarys.map((d) => d.id));
        toastSuccess(`${confirm.diarys.length} diários excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Diários (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    { label: 'Ativos', value: rows.filter((d) => d.is_active).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Inativos', value: rows.filter((d) => !d.is_active).length, icon: 'CirclePause', accent: 'muted' },
    { label: 'Ano atual', value: rows.filter((d) => d.academic_year === currentYear).length, icon: 'CalendarCheck', accent: 'warning' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Diário Online' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Diários de Classe"
            description="Hub de diários e relacionamento com planos, registros e aba de auditoria."
            actions={<Button asChild><Link href="/diario/nova"><Plus /> Novo diário</Link></Button>}
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os diários.</div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(d) => d.id}
              loading={query.isLoading}
              exportFilename="diarios-classe"
              emptyMessage="Nenhum diário encontrado com os filtros atuais."
              onRowClick={(d) => router.push(`/diario/${d.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por ano letivo…' }}
              filters={<Select value={yearFilter} onValueChange={setYearFilter}><SelectTrigger size="sm" className="w-36"><SelectValue placeholder="Ano letivo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{years.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent></Select>}
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', diarys: selected });
                    clear();
                  }}
                >
                  <Trash2 /> Excluir selecionados
                </Button>
              )}
              pager={<CursorPager
                count={rows.length}
                perPage={perPage}
                onPerPageChange={setPerPage}
                loading={query.isFetching}
                hasPrev={cursorStack.length > 0}
                hasNext={Boolean(nextCursor)}
                onPrev={() => {
                  setCursorStack((stack) => {
                    const next = [...stack];
                    const prev = next.pop() ?? null;
                    setCursor(prev);
                    return next;
                  });
                }}
                onNext={() => {
                  setCursorStack((stack) => [...stack, cursor]);
                  setCursor(nextCursor);
                }}
              />}
            />
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        destructive
        loading={deleting}
        title={confirm?.mode === 'bulk' ? 'Excluir diários selecionados?' : 'Excluir diário?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.diarys.length} diários serão excluídos.`
            : `O diário "${classLabel(confirm?.diarys[0]?.class)}" será excluído.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
