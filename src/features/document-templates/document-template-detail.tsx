'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { DocumentActiveBadge } from './columns';
import { DOCUMENT_KIND_LABELS } from './types';
import { useDeleteDocumentTemplate, useDocumentTemplate } from './hooks';

export function DocumentTemplateDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: template, isLoading, isError } = useDocumentTemplate(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteDocumentTemplate();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Template excluído.');
      router.push('/documentos');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Documentação', href: '/documentos' },
          { label: template?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !template ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Template não encontrado ou indisponível.{' '}
              <Link href="/documentos" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              {/* Cabeçalho */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/documentos" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
                      <DocumentActiveBadge active={template.is_active} />
                      {template.is_default && (
                        <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700">
                          Padrão
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {DOCUMENT_KIND_LABELS[template.kind]} · v{template.version}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/documentos/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              {/* Abas */}
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Tipo"
                          value={
                            <Badge variant="secondary">
                              {DOCUMENT_KIND_LABELS[template.kind]}
                            </Badge>
                          }
                        />
                        <DetailField label="Situação" value={<DocumentActiveBadge active={template.is_active} />} />
                        <DetailField label="Versão" value={`v${template.version}`} />
                        <DetailField label="Template padrão" value={template.is_default ? 'Sim' : 'Não'} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="conteudo" className="space-y-6">
                  {template.header_html && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cabeçalho</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                          {template.header_html}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Corpo do template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                        {template.body_template}
                      </pre>
                    </CardContent>
                  </Card>
                  {template.footer_html && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Rodapé</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                          {template.footer_html}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(template.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(template.updated_at)} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        destructive
        loading={del.isPending}
        title="Excluir template?"
        description={template ? `O template "${template.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
