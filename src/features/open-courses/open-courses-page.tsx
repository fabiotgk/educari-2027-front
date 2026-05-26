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
import { buildOpenCourseColumns } from './columns';
import { MODALITY_LABELS, STATUS_LABELS, type OpenCourse } from './types';
import { useDeleteOpenCourse, useDeleteOpenCourses, useOpenCourses } from './hooks';

type ConfirmState = { mode: 'single'; course: OpenCourse } | { mode: 'bulk'; courses: OpenCourse[] } | null;

export function OpenCoursesPage() {
  const router = useRouter();

  // Filtros / busca / paginação
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [modality, setModality] = React.useState('all');
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
  }, [search, modality, status, perPage]);

  const query = useOpenCourses({
    search: { title: search || undefined },
    filter: {
      modality: modality !== 'all' ? modality : undefined,
      status: status !== 'all' ? status : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteOpenCourse();
  const deleteMany = useDeleteOpenCourses();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildOpenCourseColumns({
        onView: (c) => router.push(`/cursos-livres/${c.id}`),
        onEdit: (c) => router.push(`/cursos-livres/${c.id}/editar`),
        onDelete: (c) => setConfirm({ mode: 'single', course: c }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.course.id);
        toastSuccess('Curso excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.courses.map((c) => c.id));
        toastSuccess(`${confirm.courses.length} cursos excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const totalVacancies = rows.reduce((sum, c) => sum + (c.vacancies ?? 0), 0);

  const stats: Stat[] = [
    { label: 'Cursos (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    { label: 'Inscrições abertas', value: rows.filter((c) => c.status === 'open').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Vagas disponíveis', value: totalVacancies, icon: 'Users', accent: 'warning' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Cursos Livres' }, { label: 'Lista' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Cursos Livres"
            description="Gestão de cursos livres da plataforma"
            actions={
              <Button asChild>
                <Link href="/cursos-livres/nova">
                  <Plus /> Novo curso
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os cursos. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(c) => c.id}
              loading={query.isLoading}
              exportFilename="cursos-livres"
              emptyMessage="Nenhum curso encontrado com os filtros atuais."
              onRowClick={(c) => router.push(`/cursos-livres/${c.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }}
              filters={
                <>
                  <Select value={modality} onValueChange={setModality}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue placeholder="Modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as modalidades</SelectItem>
                      {Object.entries(MODALITY_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', courses: selected });
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
        title={confirm?.mode === 'bulk' ? 'Excluir cursos selecionados?' : 'Excluir curso?'}
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.courses.length} cursos serão excluídos. Esta ação pode ser revertida pela equipe técnica.`
            : confirm?.mode === 'single'
              ? `O curso "${confirm.course.title}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
