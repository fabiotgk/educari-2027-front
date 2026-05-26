'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildGradeColumns } from './columns';
import { GRADE_KIND_LABELS, type Grade, type GradeKind } from './types';
import { useDeleteGrade, useDeleteGrades, useGrades } from './hooks';

const ALL_KIND: GradeKind | 'all' = 'all';

interface ConfirmState {
  mode: 'single' | 'bulk';
  grades: Grade[];
}

export function GradesPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState<'all' | GradeKind>(ALL_KIND);
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [search, kindFilter, perPage]);

  const query = useGrades({
    search: search ? { score_numeric: search } : undefined,
    filter: {
      kind: kindFilter !== 'all' ? kindFilter : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const deleteOne = useDeleteGrade();
  const deleteMany = useDeleteGrades();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildGradeColumns({
        onView: (grade) => router.push(`/notas/${grade.id}`),
        onEdit: (grade) => router.push(`/notas/${grade.id}/editar`),
        onDelete: (grade) => setConfirm({ mode: 'single', grades: [grade] }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.grades[0]!.id);
        toastSuccess('Nota excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.grades.map((grade) => grade.id));
        toastSuccess(`${confirm.grades.length} notas excluídas.`);
      }
      setConfirm(null);
    } catch (error) {
      toastError(error);
    }
  };

  const totalNotas = rows.length;
  const notasNumericas = rows
    .map((row) => (typeof row.score_numeric === 'number' ? row.score_numeric : Number(row.score_numeric)))
    .filter((value): value is number => Number.isFinite(value));

  const media = notasNumericas.length > 0 ? notasNumericas.reduce((sum, value) => sum + value, 0) / notasNumericas.length : 0;
  const recuperacoes = rows.filter((row) => row.kind === 'recovery').length;
  const taxaRecuperacao = rows.length > 0 ? (recuperacoes / rows.length) * 100 : 0;

  const stats: Stat[] = [
    { label: 'Notas lançadas', value: totalNotas, icon: 'BookOpen', accent: 'primary' },
    {
      label: 'Nota média',
      value: notasNumericas.length > 0 ? formatNumber(media, 2) : '—',
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: '% de recuperação',
      value: rows.length > 0 ? `${formatNumber(taxaRecuperacao, 1)}%` : '—',
      icon: 'TrendingUp',
      accent: 'warning',
    },
    {
      label: 'Registros desta página',
      value: rows.length,
      icon: 'ListTree',
      accent: 'secondary',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Notas e Boletim' }, { label: 'Notas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Notas"
            description="Lançamento, consulta e edição de notas por matrícula e período."
            actions={
              <Button asChild>
                <Link href="/notas/nova">
                  <Plus /> Nova nota
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as notas.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(row) => row.id}
              loading={query.isLoading}
              exportFilename="notas"
              emptyMessage="Nenhuma nota encontrada com os filtros atuais."
              onRowClick={(row) => router.push(`/notas/${row.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Filtrar por aluno (uuid)...',
              }}
              filters={
                <>
                  <Select value={kindFilter} onValueChange={(value) => setKindFilter(value as GradeKind | 'all')}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {(Object.entries(GRADE_KIND_LABELS) as [GradeKind, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
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
                    setConfirm({ mode: 'bulk', grades: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir notas selecionadas?' : 'Excluir nota?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.grades.length} notas serão excluídas.`
            : `A nota de "${confirm?.grades[0]?.subject?.name ?? confirm?.grades[0]?.subject_id ?? 'selecionada'}" será excluída.`
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
