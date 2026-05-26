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
import { ForumReplySolutionBadge } from './columns';
import { useDeleteForumReply, useForumReply } from './hooks';

export function ForumReplyDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: reply, isLoading, isError } = useForumReply(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteForumReply();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Resposta excluída.');
      router.push('/ava/respostas-forum');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Respostas do fórum', href: '/ava/respostas-forum' }, { label: 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !reply ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Resposta não encontrada. <Link href="/ava/respostas-forum" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/respostas-forum" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">Resposta do fórum</h1>
                      <ForumReplySolutionBadge isSolution={reply.is_solution} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{reply.author?.name ?? reply.author_id ?? 'Autor não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/respostas-forum/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>
                <TabsContent value="resumo">
                  <Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Tópico" value={reply.thread?.title ?? reply.forum_thread_id} />
                    <DetailField label="Autor" value={reply.author?.name ?? reply.author_id} />
                    <DetailField label="Solução" value={<ForumReplySolutionBadge isSolution={reply.is_solution} />} />
                    <DetailField label="Resposta pai" value={reply.parent_reply_id} />
                    <DetailField label="Conteúdo" value={reply.body} full />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criada em" value={formatDateTime(reply.created_at)} />
                    <DetailField label="Atualizada em" value={formatDateTime(reply.updated_at)} />
                    <DetailField label="Excluída em" value={reply.deleted_at ? formatDateTime(reply.deleted_at) : null} />
                    <DetailField label="Tenant" value={reply.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir resposta?" description="A resposta selecionada será excluída." confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
