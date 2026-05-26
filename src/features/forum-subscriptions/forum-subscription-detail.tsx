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
import { NotifyBadge } from './columns';
import { useDeleteForumSubscription, useForumSubscription } from './hooks';

export function ForumSubscriptionDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: subscription, isLoading, isError } = useForumSubscription(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteForumSubscription();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Inscrição excluída.');
      router.push('/ava/inscricoes-forum');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Inscrições do fórum', href: '/ava/inscricoes-forum' }, { label: 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !subscription ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Inscrição não encontrada. <Link href="/ava/inscricoes-forum" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/inscricoes-forum" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">Inscrição do fórum</h1>
                      <NotifyBadge notify={subscription.notify} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{subscription.user?.name ?? subscription.user_id ?? 'Usuário atual'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/inscricoes-forum/${id}/editar`}><Pencil /> Editar</Link></Button>
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
                    <DetailField label="Tópico" value={subscription.thread?.title ?? subscription.forum_thread_id} />
                    <DetailField label="Usuário" value={subscription.user?.name ?? subscription.user_id} />
                    <DetailField label="E-mail" value={subscription.user?.email} />
                    <DetailField label="Notificação" value={<NotifyBadge notify={subscription.notify} />} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criada em" value={formatDateTime(subscription.created_at)} />
                    <DetailField label="Atualizada em" value={formatDateTime(subscription.updated_at)} />
                    <DetailField label="Tenant" value={subscription.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir inscrição?" description="A inscrição selecionada será excluída." confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
