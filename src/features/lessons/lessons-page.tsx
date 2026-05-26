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
import { buildLessonColumns } from './columns';
import { useDeleteLesson, useDeleteLessons, useLessons } from './hooks';
import type { Lesson } from './types';

type ConfirmState = { mode: 'single'; row: Lesson } | { mode: 'bulk'; rows: Lesson[] } | null;

export function LessonsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  React.useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 350); return () => clearTimeout(t); }, [searchInput]);
  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [search, perPage]);
  const query = useLessons({ search: { title: search || undefined }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteLesson();
  const deleteMany = useDeleteLessons();
  const columns = React.useMemo(() => buildLessonColumns({ onView: (l) => router.push(`/ava/aulas/${l.id}`), onEdit: (l) => router.push(`/ava/aulas/${l.id}/editar`), onDelete: (l) => setConfirm({ mode: 'single', row: l }) }), [router]);
  const stats: Stat[] = [
    { label: 'Aulas (página)', value: rows.length, icon: 'BookOpenCheck', accent: 'primary' },
    { label: 'Publicadas', value: rows.filter((l) => l.is_published).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Prévia', value: rows.filter((l) => l.is_preview).length, icon: 'Eye', accent: 'warning' },
  ];
  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') { await deleteOne.mutateAsync(confirm.row.id); toastSuccess('Aula excluída.'); }
      else { await deleteMany.mutateAsync(confirm.rows.map((r) => r.id)); toastSuccess(`${confirm.rows.length} aulas excluídas.`); }
      setConfirm(null);
    } catch (err) { toastError(err); }
  };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Aulas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        <PageHeader title="Aulas" description="Conteúdos, videoaulas, textos, PDFs, SCORM, links e questionários." actions={<Button asChild><Link href="/ava/aulas/nova"><Plus /> Nova aula</Link></Button>} />
        <StatCards stats={stats} loading={query.isLoading} />
        {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as aulas.</div> : (
          <DataTable columns={columns} rows={rows} getRowId={(l) => l.id} loading={query.isLoading} exportFilename="aulas-ava" emptyMessage="Nenhuma aula encontrada." onRowClick={(l) => router.push(`/ava/aulas/${l.id}`)} search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', rows: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
        )}
      </div></main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleteOne.isPending || deleteMany.isPending} title={confirm?.mode === 'bulk' ? 'Excluir aulas selecionadas?' : 'Excluir aula?'} description={confirm?.mode === 'bulk' ? `${confirm.rows.length} aulas serão excluídas.` : confirm?.mode === 'single' ? `A aula "${confirm.row.title}" será excluída.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
