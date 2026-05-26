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
import { formatDate, formatDateTime, formatCurrency } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { AssetStatusBadge } from './columns';
import { ASSET_CONDITION_LABELS } from './types';
import { useDeleteAsset, useAsset } from './hooks';
import { AssetMovementsTab } from './movements-tab';

export function AssetDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: asset, isLoading, isError } = useAsset(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteAsset();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Bem excluído.');
      router.push('/patrimonio');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Patrimônio' },
          { label: 'Bens', href: '/patrimonio' },
          { label: asset?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !asset ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Bem não encontrado ou indisponível.{' '}
              <Link href="/patrimonio" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/patrimonio" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-semibold tracking-tight">{asset.name}</h1>
                      {asset.status && <AssetStatusBadge status={asset.status} />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tombamento: {asset.patrimony_number}
                      {asset.category ? ` · ${asset.category.name}` : ''}
                      {asset.location ? ` · ${asset.location}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/patrimonio/${id}/editar`}>
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
                  <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do bem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Número de tombamento"
                          value={
                            <span className="font-mono text-sm">{asset.patrimony_number}</span>
                          }
                        />
                        <DetailField
                          label="Categoria"
                          value={
                            asset.category ? (
                              <Badge variant="secondary">{asset.category.name}</Badge>
                            ) : null
                          }
                        />
                        <DetailField label="Localização" value={asset.location} />
                        {asset.condition && (
                          <DetailField
                            label="Estado de conservação"
                            value={ASSET_CONDITION_LABELS[asset.condition]}
                          />
                        )}
                        {asset.status && (
                          <DetailField
                            label="Status"
                            value={<AssetStatusBadge status={asset.status} />}
                          />
                        )}
                        {asset.school_id && (
                          <DetailField
                            label="Escola"
                            value={
                              <span className="font-mono text-xs">{asset.school_id}</span>
                            }
                          />
                        )}
                      </DetailGrid>
                    </CardContent>
                  </Card>

                  {asset.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{asset.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados financeiros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Data de aquisição"
                          value={asset.acquisition_date ? formatDate(asset.acquisition_date) : null}
                        />
                        <DetailField
                          label="Valor de aquisição"
                          value={
                            asset.acquisition_value
                              ? formatCurrency(Number(asset.acquisition_value))
                              : null
                          }
                        />
                        <DetailField
                          label="Valor atual"
                          value={
                            asset.current_value
                              ? formatCurrency(Number(asset.current_value))
                              : null
                          }
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="movimentacoes">
                  <AssetMovementsTab assetId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(asset.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(asset.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={asset.deleted_at ? formatDateTime(asset.deleted_at) : null}
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
        title="Excluir bem?"
        description={asset ? `O bem "${asset.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
