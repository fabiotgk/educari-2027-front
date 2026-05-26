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
import { buildCertificateColumns } from './columns';
import type { Certificate } from './types';
import { useCertificates, useDeleteCertificate, useDeleteCertificates } from './hooks';

type ConfirmState =
  | { mode: 'single'; certificate: Certificate }
  | { mode: 'bulk'; certificates: Certificate[] }
  | null;

export function CertificatesPage() {
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

  const query = useCertificates({
    filter: { certificate_code: search || undefined },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteCertificate();
  const deleteMany = useDeleteCertificates();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildCertificateColumns({
        onView: (c) => router.push(`/ava/certificados/${c.id}`),
        onEdit: (c) => router.push(`/ava/certificados/${c.id}/editar`),
        onDelete: (c) => setConfirm({ mode: 'single', certificate: c }),
      }),
    [router],
  );

  const stats: Stat[] = [
    { label: 'Certificados', value: rows.length, icon: 'Award', accent: 'primary' },
    { label: 'Com verificação', value: rows.filter((c) => Boolean(c.verification_url)).length, icon: 'ShieldCheck', accent: 'success' },
    { label: 'Com PDF', value: rows.filter((c) => Boolean(c.pdf_url)).length, icon: 'FileText', accent: 'secondary' },
    { label: 'Sem emissão', value: rows.filter((c) => !c.issued_at).length, icon: 'Clock', accent: 'warning' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.certificate.id);
        toastSuccess('Certificado excluído.');
      } else {
        await deleteMany.mutateAsync(confirm.certificates.map((c) => c.id));
        toastSuccess(`${confirm.certificates.length} certificados excluídos.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Certificados' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Certificados" description="Certificados emitidos para matrículas concluídas no AVA." actions={<Button asChild><Link href="/ava/certificados/novo"><Plus /> Novo certificado</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar os certificados.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(c) => c.id}
              loading={query.isLoading}
              exportFilename="certificados-ava"
              emptyMessage="Nenhum certificado encontrado com os filtros atuais."
              onRowClick={(c) => router.push(`/ava/certificados/${c.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Buscar por código exato…' }}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', certificates: selected }); clear(); }}><Trash2 /> Excluir selecionados</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((stack) => { const next = [...stack]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((stack) => [...stack, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir certificados selecionados?' : 'Excluir certificado?'} description={confirm?.mode === 'bulk' ? `${confirm.certificates.length} certificados serão excluídos.` : confirm?.mode === 'single' ? `O certificado "${confirm.certificate.certificate_code}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
