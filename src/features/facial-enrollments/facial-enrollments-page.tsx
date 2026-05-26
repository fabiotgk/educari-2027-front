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
import { buildFacialEnrollmentColumns } from './columns';
import {
  FACIAL_ENROLLMENT_STATUS_LABELS,
  type FacialEnrollment,
} from './types';
import {
  useDeleteFacialEnrollment,
  useDeleteFacialEnrollments,
  useFacialEnrollments,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; item: FacialEnrollment }
  | { mode: 'bulk'; items: FacialEnrollment[] }
  | null;

export function FacialEnrollmentsPage() {
  const router = useRouter();

  // Filtros / busca / paginação
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

  const query = useFacialEnrollments({
    search: search ? { 'student.full_name': search } : undefined,
    filter: {
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteFacialEnrollment();
  const deleteMany = useDeleteFacialEnrollments();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildFacialEnrollmentColumns({
        onView: (f) => router.push(`/facial/${f.id}`),
        onEdit: (f) => router.push(`/facial/${f.id}/editar`),
        onDelete: (f) => setConfirm({ mode: 'single', item: f }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.item.id);
        toastSuccess('Cadastro facial excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.items.map((f) => f.id));
        toastSuccess(`${confirm.items.length} cadastros faciais excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    {
      label: 'Total de cadastros',
      value: rows.length,
      icon: 'Fingerprint',
      accent: 'primary',
    },
    {
      label: 'Ativos',
      value: rows.filter((f) => f.status === 'active').length,
      icon: 'CircleCheck',
      accent: 'success',
    },
    {
      label: 'Com consentimento',
      value: rows.filter((f) => f.consent_given).length,
      icon: 'ShieldCheck',
      accent: 'secondary',
    },
    {
      label: 'Pendentes',
      value: rows.filter((f) => f.status === 'pending').length,
      icon: 'Clock',
      accent: 'warning',
    },
  ];

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Reconhecimento Facial' },
          { label: 'Cadastros' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Cadastros Faciais"
            description="Gerenciamento de matrículas no reconhecimento facial"
            actions={
              <Button asChild>
                <Link href="/facial/nova">
                  <Plus /> Novo cadastro
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os cadastros faciais. Verifique sua
              conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(f) => f.id}
              loading={query.isLoading}
              exportFilename="cadastros-faciais"
              emptyMessage="Nenhum cadastro facial encontrado com os filtros atuais."
              onRowClick={(f) => router.push(`/facial/${f.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por aluno…',
              }}
              filters={
                <>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(FACIAL_ENROLLMENT_STATUS_LABELS).map(
                        ([v, label]) => (
                          <SelectItem key={v} value={v}>
                            {label}
                          </SelectItem>
                        ),
                      )}
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
            ? 'Excluir cadastros selecionados?'
            : 'Excluir cadastro facial?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.items.length} cadastros serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O cadastro facial de "${
                  confirm.item.student?.full_name ?? confirm.item.student_id
                }" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
