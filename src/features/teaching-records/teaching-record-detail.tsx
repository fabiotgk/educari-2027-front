'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteTeachingRecord, useTeachingRecord } from './hooks';

export function TeachingRecordDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: record, isLoading, isError } = useTeachingRecord(id);
  const del = useDeleteTeachingRecord();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Registro de aula excluído.');
      router.push('/diario/registros');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Registros de aula', href: '/diario/registros' },
          { label: record ? `Registro ${formatDate(record.lesson_date)}` : 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !record ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Registro não encontrado ou indisponível. <Link href="/diario/registros" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/diario/registros" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Registro {formatDate(record.lesson_date)} · Aula {record.lesson_number_in_day}
                      </h1>
                      {record.is_substituted ? <Badge variant="secondary">Substituição</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Diário {record.class_diary_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/diario/registros/${id}/editar`}>
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
                      <CardTitle className="text-base">Informações do registro</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={record.id} />
                        <DetailField label="Diário" value={record.class_diary_id} />
                        <DetailField label="Data da aula" value={formatDate(record.lesson_date)} />
                        <DetailField label="Aula do dia" value={String(record.lesson_number_in_day)} />
                        <DetailField label="Substituído" value={record.is_substituted ? 'Sim' : 'Não'} />
                        <DetailField
                          label="Registro substituído"
                          value={record.substituted_for_record_id ?? '—'}
                        />
                        <DetailField label="Registrado por" value={record.recorded_by_user_id} />
                        <DetailField label="Conteúdo ministrado" value={record.content_taught} full />
                        <DetailField label="Metodologia" value={record.methodology ?? '—'} full />
                        <DetailField
                          label="Observações"
                          value={record.observations ?? '—'}
                          full
                        />
                        <DetailField
                          label="Habilidades"
                          value={record.learning_expectations?.length ? record.learning_expectations.join('\n') : '—'}
                          full
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(record.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(record.updated_at)} />
                        <DetailField label="Tenant" value={record.tenant_id} />
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
        title="Excluir registro de aula?"
        description={record ? `O registro da data ${record.lesson_date} será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}

