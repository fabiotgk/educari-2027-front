'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DataTable } from '@/components/crud/data-table';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { toastError, toastSuccess } from '@/lib/toast';
import { ATTENDANCE_STATUS_LABELS, type AttendanceStatus } from './types';
import { buildAttendanceRecordColumns } from './columns';
import { useAttendanceRecords, useDeleteAttendanceRecord, useDeleteAttendanceRecords } from './hooks';

type ConfirmState =
  | { mode: 'single'; recordId: string; recordLabel: string }
  | { mode: 'bulk'; records: string[]; count: number }
  | null;

function buildStats(records: Array<{ status: AttendanceStatus; lesson_date: string | null }>): Stat[] {
  const total = records.length;
  const validTotal = records.filter((record) => record.status !== 'not_required').length;
  const presentCount = records.filter((record) => record.status === 'present' || record.status === 'late').length;
  const absenceCount = records.filter((record) => record.status === 'absent' || record.status === 'justified').length;
  const presenceRate =
    validTotal > 0 ? Math.round(((presentCount / validTotal) * 100 + Number.EPSILON) * 10) / 10 : 0;

  return [
    { label: 'Registros (página)', value: total, icon: 'CalendarCheck', accent: 'primary' },
    {
      label: 'Presença geral',
      value: `${presenceRate}%`,
      icon: 'CircleCheck',
      accent: 'success',
    },
    { label: 'Ausências', value: absenceCount, icon: 'CircleX', accent: 'warning' },
    {
      label: 'Status mais usado',
      value:
        records.length > 0
          ? ATTENDANCE_STATUS_LABELS[records.reduce((best, record) => {
              const top = records.find((candidate) => candidate.status === best);
              return top ? best : record.status;
            }, records[0].status)]
          : 'Sem dados',
      icon: 'BadgeAlert',
      accent: 'secondary',
    },
  ];
}

export function AttendanceRecordsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<AttendanceStatus | 'all'>('all');
  const [lessonDate, setLessonDate] = React.useState('');
  const [enrollmentFilter, setEnrollmentFilter] = React.useState('');
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
  }, [search, status, lessonDate, enrollmentFilter, perPage]);

  const query = useAttendanceRecords({
    search: { notes: search || undefined },
    filter: {
      status: status !== 'all' ? status : undefined,
      lesson_date: lessonDate || undefined,
      enrollment_id: enrollmentFilter || undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteAttendanceRecord();
  const deleteMany = useDeleteAttendanceRecords();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildAttendanceRecordColumns({
        onView: (record) => router.push(`/frequencia/${record.id}`),
        onEdit: (record) => router.push(`/frequencia/${record.id}/editar`),
        onDelete: (record) =>
          setConfirm({
            mode: 'single',
            recordId: record.id,
            recordLabel: `${record.enrollment_id} · ${record.status}`,
          }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.recordId);
        toastSuccess('Registro de frequência excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.records);
        toastSuccess(`${confirm.count} registros de frequência excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats = buildStats(rows);

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Frequência' }, { label: 'Registros' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Registros de frequência"
            description="Lançamentos de frequência por aluno e aula. Consulte por data, matrícula e situação."
            actions={
              <Button asChild>
                <Link href="/frequencia/nova">
                  <Plus /> Novo registro
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os registros.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(record) => record.id}
              loading={query.isLoading}
              exportFilename="registros-frequencia"
              emptyMessage="Nenhum registro encontrado com os filtros atuais."
              onRowClick={(record) => router.push(`/frequencia/${record.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por observação…',
              }}
              filters={
                <div className="flex flex-wrap gap-2">
                  <Select value={status} onValueChange={(value) => setStatus(value as AttendanceStatus | 'all')}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="date"
                    value={lessonDate}
                    onChange={(event) => setLessonDate(event.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filtrar por data da aula"
                  />
                  <input
                    type="text"
                    value={enrollmentFilter}
                    onChange={(event) => setEnrollmentFilter(event.target.value)}
                    placeholder="Filtrar por matrícula (UUID)"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filtrar por matrícula"
                  />
                </div>
              }
              bulkActions={(selected, clear) => (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', records: selected.map((record) => record.id), count: selected.length });
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
                  onPerPageChange={setPerPage}
                />
              }
            />
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        destructive
        loading={deleting}
        title={confirm?.mode === 'bulk' ? 'Excluir registros selecionados?' : 'Excluir registro?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.count} registros serão excluídos.`
            : `O registro "${confirm?.recordLabel}" será excluído.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
