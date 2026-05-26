'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { useCertificate, useDeleteCertificate } from './hooks';

export function CertificateDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: certificate, isLoading, isError } = useCertificate(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteCertificate();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Certificado excluído.');
      router.push('/ava/certificados');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Certificados', href: '/ava/certificados' }, { label: certificate?.certificate_code ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !certificate ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Certificado não encontrado. <Link href="/ava/certificados" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/certificados" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Certificado</h1>
                    <p className="mt-1 font-mono text-sm text-primary">{certificate.certificate_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/certificados/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Código do certificado</CardTitle></CardHeader>
                    <CardContent>
                      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-lg font-semibold text-primary">{certificate.certificate_code}</div>
                    </CardContent>
                  </Card>
                  <Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Matrícula" value={<Link href={`/ava/matriculas/${certificate.course_enrollment_id}`} className="underline-offset-4 hover:underline">{certificate.course_enrollment_id}</Link>} />
                    <DetailField label="Emitido em" value={formatDateTime(certificate.issued_at)} />
                    <DetailField label="Carga horária" value={certificate.workload_hours != null ? `${certificate.workload_hours} h` : null} />
                    <DetailField label="Verificação" value={certificate.verification_url ? <a href={certificate.verification_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">Abrir verificação <ExternalLink className="size-3.5" /></a> : null} full />
                    <DetailField label="PDF" value={certificate.pdf_url ? <a href={certificate.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">Abrir PDF <FileText className="size-3.5" /></a> : null} full />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(certificate.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(certificate.updated_at)} />
                    <DetailField label="Excluído em" value={certificate.deleted_at ? formatDateTime(certificate.deleted_at) : null} />
                    <DetailField label="Tenant" value={certificate.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir certificado?" description={certificate ? `O certificado "${certificate.certificate_code}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
