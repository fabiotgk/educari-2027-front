'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { ForumThreadFlags } from './columns';
import { ForumThreadRepliesTab } from './replies-tab';
import { ForumThreadSubscriptionsTab } from './subscriptions-tab';
import { useDeleteForumThread, useForumThread } from './hooks';

export function ForumThreadDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: thread, isLoading, isError } = useForumThread(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteForumThread();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Tópico excluído.');
      router.push('/ava/foruns');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Fóruns', href: '/ava/foruns' }, { label: thread?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !thread ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Tópico não encontrado. <Link href="/ava/foruns" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/foruns" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{thread.title}</h1>
                      <ForumThreadFlags thread={thread} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {thread.author?.name ?? thread.author_id ?? 'Autor não informado'} · {thread.replies_count ?? 0} respostas · {thread.views_count ?? 0} visualizações
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/foruns/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="respostas">Respostas</TabsTrigger>
                  <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Status" value={<ForumThreadFlags thread={thread} />} />
                        <DetailField label="Curso" value={thread.course_id} />
                        <DetailField label="Autor" value={thread.author?.name ?? thread.author_id} />
                        <DetailField label="Respostas" value={thread.replies_count ?? 0} />
                        <DetailField label="Visualizações" value={thread.views_count ?? 0} />
                        <DetailField label="Última resposta" value={formatDateTime(thread.last_reply_at)} />
                        <DetailField label="Conteúdo" value={thread.body} full />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="respostas"><ForumThreadRepliesTab threadId={id} /></TabsContent>
                <TabsContent value="inscricoes"><ForumThreadSubscriptionsTab threadId={id} /></TabsContent>
                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(thread.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(thread.updated_at)} />
                        <DetailField label="Excluído em" value={thread.deleted_at ? formatDateTime(thread.deleted_at) : null} />
                        <DetailField label="Tenant" value={thread.tenant_id} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir tópico?" description={thread ? `O tópico "${thread.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
