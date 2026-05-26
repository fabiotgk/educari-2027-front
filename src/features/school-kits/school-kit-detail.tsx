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
import { SchoolKitStatusBadge } from './columns';
import { KitComponentsTab } from './kit-components-tab';
import { SCHOOL_KIT_STATUS_LABELS } from './types';
import { useDeleteSchoolKit, useSchoolKit } from './hooks';

export function SchoolKitDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: kit, isLoading, isError } = useSchoolKit(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteSchoolKit();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Kit excluído.');
      router.push('/material');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Material Escolar' },
          { label: 'Kits', href: '/material' },
          { label: kit?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !kit ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Kit não encontrado ou indisponível.{' '}
              <Link href="/material" className="underline">
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
                    <Link href="/material" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{kit.name}</h1>
                      <SchoolKitStatusBadge status={kit.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ano letivo {kit.academic_year}
                      {kit.target_stage ? ` · ${kit.target_stage}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/material/${id}/editar`}>
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
                  <TabsTrigger value="componentes">Componentes</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do kit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Ano letivo" value={kit.academic_year} />
                        <DetailField label="Etapa de ensino" value={kit.target_stage} />
                        <DetailField
                          label="Situação"
                          value={<SchoolKitStatusBadge status={kit.status} />}
                        />
                        {kit.description && (
                          <DetailField
                            label="Descrição"
                            full
                            value={kit.description}
                          />
                        )}
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="componentes">
                  <KitComponentsTab schoolKitId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(kit.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(kit.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={kit.deleted_at ? formatDateTime(kit.deleted_at) : null}
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
        title="Excluir kit?"
        description={kit ? `O kit "${kit.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
