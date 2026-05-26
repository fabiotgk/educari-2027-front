'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { PageHeader } from '@/components/crud/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildTeachingRecordColumns } from './columns';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteTeachingRecord, useDeleteTeachingRecords, useTeachingRecords } from './hooks';
import { type TeachingRecord } from './types';

interface ConfirmState {
  mode: 'single' | 'bulk';
  records: TeachingRecord[];
}

export function TeachingRecordsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [substitutionFilter, setSubstitutionFilter] = React.useState<'all' | 'true' | 'false'>('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  const query = useTeachingRecords({
    filter: {
      ...(searchInput.trim() ? { class_diary_id: searchInput.trim() } : {}),
      ...(substitutionFilter !== 'all' ? { is_substituted: substitutionFilter === 'true' } : {}),
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const deleteOne = useDeleteTeachingRecord();
  const deleteMany = useDeleteTeachingRecords();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildTeachingRecordColumns({
        onView: (record) => router.push(`/diario/registros/${record.id}`),
        onEdit: (record) => router.push(`/diario/registros/${record.id}/editar`),
        onDelete: (record) => setConfirm({ mode: 'single', records: [record] }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;

    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.records[0]!.id);
        toastSuccess('Registro excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.records.map((record) => record.id));
        toastSuccess(`${confirm.records.length} registros excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Registros (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    {
      label: 'Substituições',
      value: rows.filter((record) => record.is_substituted).length,
      icon: 'CirclePause',
      accent: 'warning',
    },
    {
      label: 'Aulas do dia 1',
      value: rows.filter((record) => record.lesson_number_in_day === 1).length,
      icon: 'CircleCheck',
      accent: 'success',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Diário Online', href: '/diario' }, { label: 'Registros de aula' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Registros de aula"
            description="Registro do que foi ministrado em cada aula, com controle de substituições."
            actions={<Button asChild><Link href="/diario/registros/nova"><Plus /> Novo registro</Link></Button>}
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
              exportFilename="registros-de-aula"
              emptyMessage="Nenhum registro encontrado com os filtros atuais."
              onRowClick={(record) => router.push(`/diario/registros/${record.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Filtrar por ID do diário…' }}
              filters={
                <Select value={substitutionFilter} onValueChange={(value) => setSubstitutionFilter(value as 'all' | 'true' | 'false')}>
                  <SelectTrigger size="sm" className="w-48">
                    <SelectValue placeholder="Substituição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="true">Somente substituídas</SelectItem>
                    <SelectItem value="false">Sem substituição</SelectItem>
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', records: selected });
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
                    setCursorStack((stack) => {
                      const next = [...stack];
                      const previous = next.pop() ?? null;
                      setCursor(previous);
                      return next;
                    });
                  }}
                  onNext={() => {
                    setCursorStack((stack) => [...stack, cursor]);
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
        onOpenChange={(open) => !open && setConfirm(null)}
        destructive
        loading={deleting}
        title={confirm?.mode === 'bulk' ? 'Excluir registros selecionados?' : 'Excluir registro?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.records.length} registros serão excluídos.`
            : `O registro da data ${confirm?.records[0]?.lesson_date} será excluído.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
