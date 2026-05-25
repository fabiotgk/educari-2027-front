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
import { buildSchoolCalendarColumns } from './columns';
import type { SchoolCalendar } from './types';
import { useDeleteSchoolCalendar, useDeleteSchoolCalendars, useSchoolCalendars } from './hooks';

type ConfirmState =
  | { mode: 'single'; calendar: SchoolCalendar }
  | { mode: 'bulk'; calendars: SchoolCalendar[] }
  | null;

export function SchoolCalendarsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [yearFilter, setYearFilter] = React.useState('all');
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
  }, [search, yearFilter, perPage]);

  // Anos letivos para o filtro (últimos 5 anos + próximo)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentYear - 3 + i));

  const query = useSchoolCalendars({
    search: { name: search || undefined },
    filter: {
      academic_year: yearFilter !== 'all' ? yearFilter : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteSchoolCalendar();
  const deleteMany = useDeleteSchoolCalendars();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildSchoolCalendarColumns({
        onView: (c) => router.push(`/calendario/${c.id}`),
        onEdit: (c) => router.push(`/calendario/${c.id}/editar`),
        onDelete: (c) => setConfirm({ mode: 'single', calendar: c }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.calendar.id);
        toastSuccess('Calendário excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.calendars.map((c) => c.id));
        toastSuccess(`${confirm.calendars.length} calendários excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Calendários (página)', value: rows.length, icon: 'Calendar', accent: 'primary' },
    { label: 'Publicados', value: rows.filter((c) => c.is_published).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Rascunhos', value: rows.filter((c) => !c.is_published).length, icon: 'CirclePause', accent: 'warning' },
    { label: 'Ano atual', value: rows.filter((c) => c.academic_year === String(currentYear)).length, icon: 'CalendarCheck', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Calendário Letivo' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Calendário Letivo"
            description="Calendários letivos da rede de ensino"
            actions={
              <Button asChild>
                <Link href="/calendario/novo">
                  <Plus /> Novo calendário
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os calendários. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(c) => c.id}
              loading={query.isLoading}
              exportFilename="calendarios"
              emptyMessage="Nenhum calendário encontrado com os filtros atuais."
              onRowClick={(c) => router.push(`/calendario/${c.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por nome…' }}
              filters={
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Ano letivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
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
                    setConfirm({ mode: 'bulk', calendars: selected });
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
          confirm?.mode === 'bulk' ? 'Excluir calendários selecionados?' : 'Excluir calendário?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.calendars.length} calendários serão excluídos.`
            : confirm?.mode === 'single'
              ? `O calendário "${confirm.calendar.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
