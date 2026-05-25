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
import { buildDocumentTemplateColumns } from './columns';
import { DOCUMENT_KIND_LABELS, type DocumentTemplate } from './types';
import {
  useDeleteDocumentTemplate,
  useDeleteDocumentTemplates,
  useDocumentTemplates,
} from './hooks';

type ConfirmState =
  | { mode: 'single'; template: DocumentTemplate }
  | { mode: 'bulk'; templates: DocumentTemplate[] }
  | null;

export function DocumentTemplatesPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState('all');
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
  }, [search, kindFilter, perPage]);

  const query = useDocumentTemplates({
    search: { name: search || undefined },
    filter: {
      kind: kindFilter !== 'all' ? kindFilter : undefined,
    },
    limit: perPage,
    cursor,
  });

  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteDocumentTemplate();
  const deleteMany = useDeleteDocumentTemplates();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildDocumentTemplateColumns({
        onView: (t) => router.push(`/documentos/${t.id}`),
        onEdit: (t) => router.push(`/documentos/${t.id}/editar`),
        onDelete: (t) => setConfirm({ mode: 'single', template: t }),
      }),
    [router],
  );

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.template.id);
        toastSuccess('Template excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.templates.map((t) => t.id));
        toastSuccess(`${confirm.templates.length} templates excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const stats: Stat[] = [
    { label: 'Templates (página)', value: rows.length, icon: 'FileText', accent: 'primary' },
    { label: 'Ativos', value: rows.filter((t) => t.is_active).length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Inativos', value: rows.filter((t) => !t.is_active).length, icon: 'CircleX', accent: 'muted' },
    { label: 'Padrões', value: rows.filter((t) => t.is_default).length, icon: 'Star', accent: 'warning' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Documentação' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Templates de Documentos"
            description="Modelos configuráveis de documentos escolares"
            actions={
              <Button asChild>
                <Link href="/documentos/novo">
                  <Plus /> Novo template
                </Link>
              </Button>
            }
          />

          <StatCards stats={stats} loading={query.isLoading} />

          {query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os templates. Verifique sua conexão e tente novamente.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(t) => t.id}
              loading={query.isLoading}
              exportFilename="templates-documentos"
              emptyMessage="Nenhum template encontrado com os filtros atuais."
              onRowClick={(t) => router.push(`/documentos/${t.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por nome…' }}
              filters={
                <Select value={kindFilter} onValueChange={setKindFilter}>
                  <SelectTrigger size="sm" className="w-52">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(DOCUMENT_KIND_LABELS).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
              bulkActions={(selected, clear) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirm({ mode: 'bulk', templates: selected });
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
          confirm?.mode === 'bulk' ? 'Excluir templates selecionados?' : 'Excluir template?'
        }
        description={
          confirm?.mode === 'bulk'
            ? `${confirm.templates.length} templates serão excluídos.`
            : confirm?.mode === 'single'
              ? `O template "${confirm.template.name}" será excluído.`
              : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
