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
import { EducacensoStatusBadge } from './columns';
import {
  EDUCACENSO_STAGE_LABELS,
  EDUCACENSO_STATUS_LABELS,
} from './types';
import { useDeleteEducacensoExport, useEducacensoExport } from './hooks';

export function EducacensoExportDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: exp, isLoading, isError } = useEducacensoExport(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteEducacensoExport();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Exportação excluída.');
      router.push('/educacenso');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Educacenso', href: '/educacenso' },
          {
            label: exp
              ? `${EDUCACENSO_STAGE_LABELS[exp.stage]} ${exp.reference_year}`
              : 'Detalhe',
          },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !exp ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Exportação não encontrada ou indisponível.{' '}
              <Link href="/educacenso" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/educacenso" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {EDUCACENSO_STAGE_LABELS[exp.stage]} · {exp.reference_year}
                      </h1>
                      <EducacensoStatusBadge status={exp.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {EDUCACENSO_STATUS_LABELS[exp.status]}
                      {exp.record_count != null ? ` · ${exp.record_count} registros` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/educacenso/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados da exportação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Ano de referência" value={String(exp.reference_year)} />
                        <DetailField
                          label="Etapa"
                          value={
                            <Badge variant="secondary">
                              {EDUCACENSO_STAGE_LABELS[exp.stage]}
                            </Badge>
                          }
                        />
                        <DetailField
                          label="Situação"
                          value={<EducacensoStatusBadge status={exp.status} />}
                        />
                        <DetailField
                          label="Registros"
                          value={exp.record_count != null ? String(exp.record_count) : null}
                        />
                        <DetailField
                          label="Gerado em"
                          value={formatDateTime(exp.generated_at)}
                        />
                        <DetailField label="Responsável (ID)" value={exp.created_by_user_id} />
                        <DetailField
                          label="Arquivo"
                          value={exp.file_path}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {exp.school_ids && exp.school_ids.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Escolas incluídas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                          {exp.school_ids.map((sid) => (
                            <Badge key={sid} variant="outline" className="font-mono text-xs">
                              {sid}
                            </Badge>
                          ))}
                        </div>
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
                        <DetailField label="Criado em" value={formatDateTime(exp.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(exp.updated_at)}
                        />
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
        title="Excluir exportação?"
        description={
          exp
            ? `A exportação do Educacenso (${EDUCACENSO_STAGE_LABELS[exp.stage]} ${exp.reference_year}) será excluída.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
