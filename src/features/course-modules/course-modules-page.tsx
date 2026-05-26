'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { CursorPager } from '@/components/crud/cursor-pager';
import { DataTable } from '@/components/crud/data-table';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildCourseModuleColumns } from './columns';
import { useCourseModules, useDeleteCourseModule, useDeleteCourseModules } from './hooks';
import type { CourseModule } from './types';

type ConfirmState = { mode: 'single'; row: CourseModule } | { mode: 'bulk'; rows: CourseModule[] } | null;

export function CourseModulesPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  React.useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 350); return () => clearTimeout(t); }, [searchInput]);
  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [search, perPage]);
  const query = useCourseModules({ search: { title: search || undefined }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteCourseModule();
  const deleteMany = useDeleteCourseModules();
  const columns = React.useMemo(() => buildCourseModuleColumns({ onView: (m) => router.push(`/ava/modulos/${m.id}`), onEdit: (m) => router.push(`/ava/modulos/${m.id}/editar`), onDelete: (m) => setConfirm({ mode: 'single', row: m }) }), [router]);
  const stats: Stat[] = [
    { label: 'Módulos (página)', value: rows.length, icon: 'BookOpen', accent: 'primary' },
    { label: 'Publicados', value: rows.filter((m) => m.is_published).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Rascunhos', value: rows.filter((m) => !m.is_published).length, icon: 'CirclePause', accent: 'warning' },
  ];
  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') { await deleteOne.mutateAsync(confirm.row.id); toastSuccess('Módulo excluído.'); }
      else { await deleteMany.mutateAsync(confirm.rows.map((r) => r.id)); toastSuccess(`${confirm.rows.length} módulos excluídos.`); }
      setConfirm(null);
    } catch (err) { toastError(err); }
  };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Módulos' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        <PageHeader title="Módulos" description="Seções de cursos que organizam a trilha de aulas." actions={<Button asChild><Link href="/ava/modulos/nova"><Plus /> Novo módulo</Link></Button>} />
        <StatCards stats={stats} loading={query.isLoading} />
        {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os módulos.</div> : (
          <DataTable columns={columns} rows={rows} getRowId={(m) => m.id} loading={query.isLoading} exportFilename="modulos-ava" emptyMessage="Nenhum módulo encontrado." onRowClick={(m) => router.push(`/ava/modulos/${m.id}`)} search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', rows: selected }); clear(); }}><Trash2 /> Excluir selecionados</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
        )}
      </div></main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleteOne.isPending || deleteMany.isPending} title={confirm?.mode === 'bulk' ? 'Excluir módulos selecionados?' : 'Excluir módulo?'} description={confirm?.mode === 'bulk' ? `${confirm.rows.length} módulos serão excluídos.` : confirm?.mode === 'single' ? `O módulo "${confirm.row.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
