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
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { TicketPriorityBadge, TicketStatusBadge } from './columns';
import { useDeleteTicket, useTicket } from './hooks';
import { TicketCommentsTab } from './comments-tab';

export function TicketDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: ticket, isLoading, isError } = useTicket(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteTicket();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Chamado excluído.');
      router.push('/helpdesk');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'HelpDesk' },
          { label: 'Chamados', href: '/helpdesk' },
          { label: ticket?.subject ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !ticket ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Chamado não encontrado ou indisponível.{' '}
              <Link href="/helpdesk" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/helpdesk" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
                      <TicketPriorityBadge priority={ticket.priority} />
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ticket.requester?.name ?? 'Solicitante desconhecido'}
                      {ticket.opened_at ? ` · Aberto em ${formatDateTime(ticket.opened_at)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/helpdesk/${id}/editar`}>
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
                  <TabsTrigger value="descricao">Descrição</TabsTrigger>
                  <TabsTrigger value="comentarios">Comentários</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações do chamado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Prioridade"
                          value={<TicketPriorityBadge priority={ticket.priority} />}
                        />
                        <DetailField
                          label="Situação"
                          value={<TicketStatusBadge status={ticket.status} />}
                        />
                        <DetailField
                          label="Categoria"
                          value={ticket.category?.name ?? null}
                        />
                        <DetailField
                          label="Solicitante"
                          value={
                            ticket.requester
                              ? `${ticket.requester.name} (${ticket.requester.email})`
                              : null
                          }
                        />
                        <DetailField
                          label="Responsável"
                          value={
                            ticket.assignee
                              ? `${ticket.assignee.name} (${ticket.assignee.email})`
                              : null
                          }
                        />
                        <DetailField
                          label="Escola"
                          value={ticket.school?.name ?? null}
                        />
                        <DetailField
                          label="Aberto em"
                          value={ticket.opened_at ? formatDateTime(ticket.opened_at) : null}
                        />
                        <DetailField
                          label="Resolvido em"
                          value={ticket.resolved_at ? formatDateTime(ticket.resolved_at) : null}
                        />
                        <DetailField
                          label="Fechado em"
                          value={ticket.closed_at ? formatDateTime(ticket.closed_at) : null}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="descricao">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Descrição do chamado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comentarios">
                  <TicketCommentsTab ticketId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(ticket.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(ticket.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={
                            ticket.deleted_at ? formatDateTime(ticket.deleted_at) : null
                          }
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
        title="Excluir chamado?"
        description={ticket ? `O chamado "${ticket.subject}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
