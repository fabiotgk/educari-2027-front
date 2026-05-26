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
import { TutorsTab } from './tutors-tab';
import { useDeleteDistanceCenter, useDistanceCenter } from './hooks';

export function DistanceCenterDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: center, isLoading, isError } = useDistanceCenter(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteDistanceCenter();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Polo excluído.');
      router.push('/polos');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Polos EAD', href: '/polos' },
          { label: center?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !center ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Polo não encontrado ou indisponível.{' '}
              <Link href="/polos" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              {/* Cabeçalho */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/polos" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{center.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {center.location ?? 'Polo de Educação a Distância'}
                      {center.capacity != null ? ` · Capacidade: ${center.capacity}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/polos/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              {/* Abas */}
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="tutores">Tutores</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do polo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Nome" value={center.name} />
                        <DetailField
                          label="Localização"
                          value={center.location}
                          full
                        />
                        <DetailField
                          label="Capacidade"
                          value={
                            center.capacity != null
                              ? center.capacity.toLocaleString('pt-BR') + ' vagas'
                              : null
                          }
                        />
                        <DetailField
                          label="Coordenador (ID)"
                          value={center.coordinator_user_id}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tutores">
                  <TutorsTab distanceCenterId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(center.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(center.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={center.deleted_at ? formatDateTime(center.deleted_at) : null}
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
        title="Excluir polo?"
        description={
          center ? `O polo "${center.name}" será excluído.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
