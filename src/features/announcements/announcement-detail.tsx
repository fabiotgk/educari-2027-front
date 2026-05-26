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
import { AnnouncementPriorityBadge } from './columns';
import {
  ANNOUNCEMENT_KIND_LABELS,
  ANNOUNCEMENT_TARGET_TYPE_LABELS,
} from './types';
import { useDeleteAnnouncement, useAnnouncement } from './hooks';

export function AnnouncementDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: announcement, isLoading, isError } = useAnnouncement(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteAnnouncement();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Comunicado excluído.');
      router.push('/comunicacao');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Comunicação' },
          { label: 'Comunicados', href: '/comunicacao' },
          { label: announcement?.title ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !announcement ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Comunicado não encontrado ou indisponível.{' '}
              <Link href="/comunicacao" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/comunicacao" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {announcement.title}
                      </h1>
                      <AnnouncementPriorityBadge priority={announcement.priority} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ANNOUNCEMENT_KIND_LABELS[announcement.kind]}
                      {announcement.published_at
                        ? ` · Publicado em ${formatDateTime(announcement.published_at)}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/comunicacao/${id}/editar`}>
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
                  <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                  <TabsTrigger value="publico">Público-alvo</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações gerais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Tipo"
                          value={
                            <Badge variant="secondary">
                              {ANNOUNCEMENT_KIND_LABELS[announcement.kind]}
                            </Badge>
                          }
                        />
                        <DetailField
                          label="Prioridade"
                          value={<AnnouncementPriorityBadge priority={announcement.priority} />}
                        />
                        <DetailField
                          label="Conf. leitura"
                          value={announcement.requires_read_confirmation ? 'Sim' : 'Não'}
                        />
                        <DetailField
                          label="Requer autorização"
                          value={announcement.requires_authorization ? 'Sim' : 'Não'}
                        />
                        <DetailField
                          label="Publicação"
                          value={
                            announcement.published_at
                              ? formatDateTime(announcement.published_at)
                              : null
                          }
                        />
                        <DetailField
                          label="Expiração"
                          value={
                            announcement.expires_at
                              ? formatDateTime(announcement.expires_at)
                              : null
                          }
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {announcement.summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Resumo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{announcement.summary}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="conteudo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Conteúdo do comunicado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                        {announcement.body}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="publico">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Público-alvo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {announcement.targets?.length ? (
                        <div className="space-y-2">
                          {announcement.targets.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center gap-3 rounded-lg border p-3"
                            >
                              <Badge variant="secondary">
                                {ANNOUNCEMENT_TARGET_TYPE_LABELS[t.target_type]}
                              </Badge>
                              {t.target_value && (
                                <span className="text-sm">{t.target_value}</span>
                              )}
                              {t.target_id && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {t.target_id}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum público-alvo definido.
                        </p>
                      )}
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
                        <DetailField
                          label="Criado em"
                          value={formatDateTime(announcement.created_at)}
                        />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(announcement.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={
                            announcement.deleted_at
                              ? formatDateTime(announcement.deleted_at)
                              : null
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
        title="Excluir comunicado?"
        description={
          announcement ? `O comunicado "${announcement.title}" será excluído.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
