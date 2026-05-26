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
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { PostsTab } from './posts-tab';
import { SITE_OWNER_TYPE_LABELS } from './types';
import { useDeleteSite, useSite } from './hooks';

export function SiteDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: site, isLoading, isError } = useSite(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteSite();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Site excluído.');
      router.push('/portal');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Portal Educacional', href: '/portal' },
          { label: site?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !site ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Site não encontrado ou indisponível.{' '}
              <Link href="/portal" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/portal" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
                      <Badge
                        variant="outline"
                        className={
                          site.is_published
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                            : 'border-slate-500/30 bg-slate-500/10 text-slate-700'
                        }
                      >
                        {site.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {site.slug}
                      {site.subdomain ? ` · ${site.subdomain}.educari.com.br` : ''}
                      {site.owner_type ? ` · ${SITE_OWNER_TYPE_LABELS[site.owner_type]}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/portal/${id}/editar`}>
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
                  <TabsTrigger value="posts">Publicações</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do site</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Slug" value={site.slug} />
                        <DetailField
                          label="Tipo de proprietário"
                          value={
                            site.owner_type
                              ? SITE_OWNER_TYPE_LABELS[site.owner_type]
                              : null
                          }
                        />
                        <DetailField label="ID do proprietário" value={site.owner_id} />
                        <DetailField label="Subdomínio" value={site.subdomain} />
                        <DetailField label="Domínio personalizado" value={site.custom_domain} />
                        <DetailField label="Publicado" value={formatDate(site.published_at)} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {site.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{site.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="posts">
                  <PostsTab siteId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(site.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(site.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={site.deleted_at ? formatDateTime(site.deleted_at) : null}
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
        title="Excluir site?"
        description={site ? `O site "${site.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
