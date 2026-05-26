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
import { buildCourseAnnouncementColumns } from './columns';
import { useCourseAnnouncements, useDeleteCourseAnnouncement, useDeleteCourseAnnouncements } from './hooks';
import type { CourseAnnouncement } from './types';

type ConfirmState = { mode: 'single'; row: CourseAnnouncement } | { mode: 'bulk'; rows: CourseAnnouncement[] } | null;

export function CourseAnnouncementsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  React.useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 350); return () => clearTimeout(t); }, [searchInput]);
  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [search, perPage]);
  const query = useCourseAnnouncements({ search: { title: search || undefined }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteCourseAnnouncement();
  const deleteMany = useDeleteCourseAnnouncements();
  const columns = React.useMemo(() => buildCourseAnnouncementColumns({ onView: (a) => router.push(`/ava/avisos/${a.id}`), onEdit: (a) => router.push(`/ava/avisos/${a.id}/editar`), onDelete: (a) => setConfirm({ mode: 'single', row: a }) }), [router]);
  const stats: Stat[] = [
    { label: 'Avisos (página)', value: rows.length, icon: 'Megaphone', accent: 'primary' },
    { label: 'Fixados', value: rows.filter((a) => a.is_pinned).length, icon: 'Pin', accent: 'warning' },
    { label: 'Publicados', value: rows.filter((a) => Boolean(a.published_at)).length, icon: 'CircleCheck', accent: 'success' },
  ];
  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') { await deleteOne.mutateAsync(confirm.row.id); toastSuccess('Aviso excluído.'); }
      else { await deleteMany.mutateAsync(confirm.rows.map((r) => r.id)); toastSuccess(`${confirm.rows.length} avisos excluídos.`); }
      setConfirm(null);
    } catch (err) { toastError(err); }
  };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Avisos' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        <PageHeader title="Avisos" description="Comunicados e destaques publicados nos cursos." actions={<Button asChild><Link href="/ava/avisos/nova"><Plus /> Novo aviso</Link></Button>} />
        <StatCards stats={stats} loading={query.isLoading} />
        {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os avisos.</div> : (
          <DataTable columns={columns} rows={rows} getRowId={(a) => a.id} loading={query.isLoading} exportFilename="avisos-ava" emptyMessage="Nenhum aviso encontrado." onRowClick={(a) => router.push(`/ava/avisos/${a.id}`)} search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', rows: selected }); clear(); }}><Trash2 /> Excluir selecionados</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
        )}
      </div></main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleteOne.isPending || deleteMany.isPending} title={confirm?.mode === 'bulk' ? 'Excluir avisos selecionados?' : 'Excluir aviso?'} description={confirm?.mode === 'bulk' ? `${confirm.rows.length} avisos serão excluídos.` : confirm?.mode === 'single' ? `O aviso "${confirm.row.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
