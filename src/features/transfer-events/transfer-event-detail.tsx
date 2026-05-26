'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { TransferEventStatusBadge } from './columns';
import { TransferPositionsTab } from './transfer-positions-tab';
import { TRANSFER_EVENT_STATUS_LABELS } from './types';
import { useDeleteTransferEvent, useTransferEvent } from './hooks';

export function TransferEventDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: event, isLoading, isError } = useTransferEvent(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteTransferEvent();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Evento excluído.');
      router.push('/remocao');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Concurso de Remoção', href: '/remocao' },
          { label: event?.title ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !event ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Evento não encontrado ou indisponível.{' '}
              <Link href="/remocao" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/remocao" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
                      <TransferEventStatusBadge status={event.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {TRANSFER_EVENT_STATUS_LABELS[event.status]}
                      {event.academic_year ? ` · Ano letivo ${event.academic_year}` : ''}
                      {event.event_date ? ` · ${formatDate(event.event_date)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/remocao/${id}/editar`}>
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
                  <TabsTrigger value="vagas">Vagas</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do evento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Ano letivo" value={event.academic_year} />
                        <DetailField
                          label="Situação"
                          value={<TransferEventStatusBadge status={event.status} />}
                        />
                        <DetailField label="Data do evento" value={formatDate(event.event_date)} />
                        <DetailField label="Referência do ato" value={event.act_reference} />
                        <DetailField label="Motivo" value={event.reason} />
                        <DetailField label="Responsável (ID)" value={event.created_by_user_id} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {event.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{event.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="vagas">
                  <TransferPositionsTab eventId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(event.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(event.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={event.deleted_at ? formatDateTime(event.deleted_at) : null}
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
        title="Excluir evento?"
        description={event ? `O evento "${event.title}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
