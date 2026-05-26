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
import { buildEssayEvaluationColumns } from './columns';
import { ESSAY_EVALUATION_STATUS_LABELS, type EssayEvaluation } from './types';
import {
  useDeleteEssayEvaluation,
  useDeleteEssayEvaluations,
  useEssayEvaluations,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; item: EssayEvaluation }
  | { mode: 'bulk'; items: EssayEvaluation[] }
  | null;

export function EssayEvaluationsPage() {
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

  const query = useEssayEvaluations({
    search: search ? { prompt_text: search } : undefined,
    filter: {
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteEssayEvaluation();
  const deleteMany = useDeleteEssayEvaluations();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildEssayEvaluationColumns({
        onView: (e) => router.push(`/ia-redacao/${e.id}`),
        onEdit: (e) => router.push(`/ia-redacao/${e.id}/editar`),
        onDelete: (e) => setConfirm({ mode: 'single', item: e }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.item.id);
        toastSuccess('Avaliação de redação excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.items.map((e) => e.id));
        toastSuccess(`${confirm.items.length} avaliações excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const completedCount = rows.filter((e) => e.status === 'completed').length;
  const averageScore =
    rows.length > 0
      ? rows.reduce((sum, e) => sum + (e.score ?? 0), 0) / rows.filter((e) => e.score != null).length || 0
      : 0;

  const stats: Stat[] = [
    { label: 'Total de avaliações', value: rows.length, icon: 'FileText', accent: 'primary' },
    { label: 'Concluídas', value: completedCount, icon: 'CircleCheck', accent: 'success' },
    {
      label: 'Nota média',
      value: averageScore > 0 ? averageScore.toFixed(2).replace('.', ',') : '—',
      icon: 'Star',
      accent: 'warning',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'IA Redação' }, { label: 'Avaliações' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Avaliações de redação"
            description="Correções e avaliações de redações gerenciadas pela IA"
            actions={
              <Button asChild>
                <Link href="/ia-redacao/nova">
                  <Plus /> Nova avaliação
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as avaliações de redação. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(e) => e.id}
              loading={query.isLoading}
              exportFilename="avaliacoes-redacao"
              emptyMessage="Nenhuma avaliação de redação encontrada com os filtros atuais."
              onRowClick={(e) => router.push(`/ia-redacao/${e.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por tema/prompt…',
              }}
              filters={
                <>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as situações</SelectItem>
                      {Object.entries(ESSAY_EVALUATION_STATUS_LABELS).map(([v, label]) => (
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
        title={
          confirm?.mode === 'bulk'
            ? 'Excluir avaliações selecionadas?'
            : 'Excluir avaliação de redação?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.items.length} avaliações serão excluídas. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `A avaliação de redação de "${confirm.item.student?.full_name ?? 'sem aluno'}" será excluída.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
