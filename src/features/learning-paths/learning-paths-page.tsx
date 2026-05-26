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
import { buildLearningPathColumns } from './columns';
import { DIFFICULTY_LABELS, STATUS_LABELS, type LearningPath } from './types';
import { useDeleteLearningPath, useDeleteLearningPaths, useLearningPaths } from './hooks';

type ConfirmState = { mode: 'single'; item: LearningPath } | { mode: 'bulk'; items: LearningPath[] } | null;

export function LearningPathsPage() {
  const router = useRouter();

  // Filtros / busca / paginação
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('all');
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
  }, [search, difficulty, status, perPage]);

  const query = useLearningPaths({
    search: { title: search || undefined },
    filter: {
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteLearningPath();
  const deleteMany = useDeleteLearningPaths();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildLearningPathColumns({
        onView: (lp) => router.push(`/ia-adaptativo/${lp.id}`),
        onEdit: (lp) => router.push(`/ia-adaptativo/${lp.id}/editar`),
        onDelete: (lp) => setConfirm({ mode: 'single', item: lp }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.item.id);
        toastSuccess('Trilha excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.items.map((lp) => lp.id));
        toastSuccess(`${confirm.items.length} trilhas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const avgProgress = rows.length
    ? rows.reduce((sum, lp) => sum + (lp.progress_pct ?? 0), 0) / rows.length
    : 0;

  const stats: Stat[] = [
    { label: 'Trilhas (página)', value: rows.length, icon: 'Route', accent: 'primary' },
    { label: 'Ativas', value: rows.filter((lp) => lp.status === 'active').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Pausadas', value: rows.filter((lp) => lp.status === 'paused').length, icon: 'CirclePause', accent: 'warning' },
    { label: 'Progresso médio', value: `${avgProgress.toFixed(0)}%`, icon: 'TrendingUp', accent: 'secondary' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Ensino Adaptativo IA' }, { label: 'Trilhas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Trilhas de aprendizagem"
            description="Trilhas adaptativas de ensino personalizado"
            actions={
              <Button asChild>
                <Link href="/ia-adaptativo/nova">
                  <Plus /> Nova trilha
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as trilhas. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(lp) => lp.id}
              loading={query.isLoading}
              exportFilename="trilhas-de-aprendizagem"
              emptyMessage="Nenhuma trilha encontrada com os filtros atuais."
              onRowClick={(lp) => router.push(`/ia-adaptativo/${lp.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }}
              filters={
                <>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as dificuldades</SelectItem>
                      {Object.entries(DIFFICULTY_LABELS).map(([v, label]) => (
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
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', items: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir trilhas selecionadas?' : 'Excluir trilha?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.items.length} trilhas serão excluídas. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `A trilha "${confirm.item.title}" será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
