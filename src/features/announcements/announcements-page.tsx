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
import { buildAnnouncementColumns } from './columns';
import {
  ANNOUNCEMENT_KIND_LABELS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  type Announcement,
} from './types';
import { useDeleteAnnouncement, useDeleteAnnouncements, useAnnouncements } from './hooks';

type ConfirmState =
  | { mode: 'single'; announcement: Announcement }
  | { mode: 'bulk'; announcements: Announcement[] }
  | null;

export function AnnouncementsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [kind, setKind] = React.useState('all');
  const [priority, setPriority] = React.useState('all');
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
  }, [search, kind, priority, perPage]);

  const query = useAnnouncements({
    search: { title: search || undefined },
    filter: {
      kind: kind !== 'all' ? kind : undefined,
      priority: priority !== 'all' ? priority : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteAnnouncement();
  const deleteMany = useDeleteAnnouncements();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildAnnouncementColumns({
        onView: (a) => router.push(`/comunicacao/${a.id}`),
        onEdit: (a) => router.push(`/comunicacao/${a.id}/editar`),
        onDelete: (a) => setConfirm({ mode: 'single', announcement: a }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.announcement.id);
        toastSuccess('Comunicado excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.announcements.map((a) => a.id));
        toastSuccess(`${confirm.announcements.length} comunicados excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Comunicados (página)', value: rows.length, icon: 'Megaphone', accent: 'primary' },
    { label: 'Urgentes', value: rows.filter((a) => a.priority === 'urgent').length, icon: 'AlertCircle', accent: 'warning' },
    { label: 'Alta prioridade', value: rows.filter((a) => a.priority === 'high').length, icon: 'TrendingUp', accent: 'warning' },
    { label: 'Normais', value: rows.filter((a) => a.priority === 'normal' || a.priority === 'low').length, icon: 'Bell', accent: 'muted' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Comunicação' }, { label: 'Comunicados' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Comunicados"
            description="Comunicados e circulares institucionais"
            actions={
              <Button asChild>
                <Link href="/comunicacao/nova">
                  <Plus /> Novo comunicado
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os comunicados. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(a) => a.id}
              loading={query.isLoading}
              exportFilename="comunicados"
              emptyMessage="Nenhum comunicado encontrado com os filtros atuais."
              onRowClick={(a) => router.push(`/comunicacao/${a.id}`)}
              search={{
                value: searchInput,
                onChange: setSearchInput,
                placeholder: 'Buscar por título…',
              }}
              filters={
                <>
                  <Select value={kind} onValueChange={setKind}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {Object.entries(ANNOUNCEMENT_KIND_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(ANNOUNCEMENT_PRIORITY_LABELS).map(([v, label]) => (
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
                    setConfirm({ mode: 'bulk', announcements: selected });
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
            ? 'Excluir comunicados selecionados?'
            : 'Excluir comunicado?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.announcements.length} comunicados serão excluídos.`
            : confirm?.mode === 'single'
              ? `O comunicado "${confirm.announcement.title}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
