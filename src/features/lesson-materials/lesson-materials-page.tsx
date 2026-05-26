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
import { buildLessonMaterialColumns } from './columns';
import { useDeleteLessonMaterial, useDeleteLessonMaterials, useLessonMaterials } from './hooks';
import type { LessonMaterial } from './types';

type ConfirmState = { mode: 'single'; row: LessonMaterial } | { mode: 'bulk'; rows: LessonMaterial[] } | null;

export function LessonMaterialsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);
  React.useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 350); return () => clearTimeout(t); }, [searchInput]);
  React.useEffect(() => { setCursor(null); setCursorStack([]); }, [search, perPage]);
  const query = useLessonMaterials({ search: { title: search || undefined }, limit: perPage, cursor });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteLessonMaterial();
  const deleteMany = useDeleteLessonMaterials();
  const columns = React.useMemo(() => buildLessonMaterialColumns({ onView: (m) => router.push(`/ava/materiais/${m.id}`), onEdit: (m) => router.push(`/ava/materiais/${m.id}/editar`), onDelete: (m) => setConfirm({ mode: 'single', row: m }) }), [router]);
  const stats: Stat[] = [
    { label: 'Materiais (página)', value: rows.length, icon: 'Paperclip', accent: 'primary' },
    { label: 'Com tipo', value: rows.filter((m) => Boolean(m.file_type)).length, icon: 'FileText', accent: 'success' },
  ];
  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') { await deleteOne.mutateAsync(confirm.row.id); toastSuccess('Material excluído.'); }
      else { await deleteMany.mutateAsync(confirm.rows.map((r) => r.id)); toastSuccess(`${confirm.rows.length} materiais excluídos.`); }
      setConfirm(null);
    } catch (err) { toastError(err); }
  };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Materiais' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        <PageHeader title="Materiais" description="Arquivos, links e anexos complementares das aulas." actions={<Button asChild><Link href="/ava/materiais/nova"><Plus /> Novo material</Link></Button>} />
        <StatCards stats={stats} loading={query.isLoading} />
        {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os materiais.</div> : (
          <DataTable columns={columns} rows={rows} getRowId={(m) => m.id} loading={query.isLoading} exportFilename="materiais-ava" emptyMessage="Nenhum material encontrado." onRowClick={(m) => router.push(`/ava/materiais/${m.id}`)} search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por título…' }} bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', rows: selected }); clear(); }}><Trash2 /> Excluir selecionados</Button>} pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((s) => { const next = [...s]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((s) => [...s, cursor]); setCursor(nextCursor); }} />} />
        )}
      </div></main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} destructive loading={deleteOne.isPending || deleteMany.isPending} title={confirm?.mode === 'bulk' ? 'Excluir materiais selecionados?' : 'Excluir material?'} description={confirm?.mode === 'bulk' ? `${confirm.rows.length} materiais serão excluídos.` : confirm?.mode === 'single' ? `O material "${confirm.row.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
