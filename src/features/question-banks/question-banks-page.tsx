'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DataTable } from '@/components/crud/data-table';
import { CursorPager } from '@/components/crud/cursor-pager';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildQuestionBankColumns } from './columns';
import type { QuestionBank } from './types';
import { useDeleteQuestionBank, useDeleteQuestionBanks, useQuestionBanks } from './hooks';

type ConfirmState =
  | { mode: 'single'; bank: QuestionBank }
  | { mode: 'bulk'; banks: QuestionBank[] }
  | null;

export function QuestionBanksPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
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
  }, [search, perPage]);

  const query = useQuestionBanks({
    search: { name: search || undefined },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteQuestionBank();
  const deleteMany = useDeleteQuestionBanks();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildQuestionBankColumns({
        onView: (b) => router.push(`/banco-questoes/${b.id}`),
        onEdit: (b) => router.push(`/banco-questoes/${b.id}/editar`),
        onDelete: (b) => setConfirm({ mode: 'single', bank: b }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.bank.id);
        toastSuccess('Banco excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.banks.map((b) => b.id));
        toastSuccess(`${confirm.banks.length} bancos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Bancos (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    {
      label: 'Com disciplina',
      value: rows.filter((b) => b.subject_id).length,
      icon: 'GraduationCap',
      accent: 'success',
    },
    {
      label: 'Sem disciplina',
      value: rows.filter((b) => !b.subject_id).length,
      icon: 'HelpCircle',
      accent: 'muted',
    },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Banco de Questões' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Banco de Questões"
            description="Repositórios de questões para avaliações em larga escala"
            actions={
              <Button asChild>
                <Link href="/banco-questoes/nova">
                  <Plus /> Novo banco
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os bancos de questões. Verifique sua conexão.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(b) => b.id}
              loading={query.isLoading}
              exportFilename="bancos-questoes"
              emptyMessage="Nenhum banco de questões encontrado."
              onRowClick={(b) => router.push(`/banco-questoes/${b.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por nome…',
              }}
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', banks: selected });
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
          confirm?.mode === 'bulk'
            ? 'Excluir bancos selecionados?'
            : 'Excluir banco de questões?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.banks.length} bancos serão excluídos.`
            : confirm?.mode === 'single'
              ? `O banco "${confirm.bank.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
