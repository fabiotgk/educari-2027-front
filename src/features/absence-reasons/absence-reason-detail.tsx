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
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { useAbsenceReason, useDeleteAbsenceReason } from './hooks';

export function AbsenceReasonDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: reason, isLoading, isError } = useAbsenceReason(id);
  const del = useDeleteAbsenceReason();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Motivo de falta excluído.');
      router.push('/frequencia/motivos');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Frequência', href: '/frequencia' }, { label: 'Motivos de Falta' }, { label: reason?.name ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-80 w-full rounded-xl" />
          ) : isError || !reason ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Motivo de falta não encontrado. <Link href="/frequencia/motivos" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button type="button" variant="ghost" size="icon-sm" asChild>
                    <Link href="/frequencia/motivos" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{reason.name}</h1>
                      <Badge variant={reason.is_active ? 'default' : 'secondary'}>{reason.is_active ? 'Ativo' : 'Inativo'}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{reason.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/frequencia/motivos/${id}/editar`}>
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
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={reason.id} />
                        <DetailField label="Código" value={reason.code} />
                        <DetailField label="Nome" value={reason.name} />
                        <DetailField
                          label="Justificada"
                          value={reason.is_justified ? 'Sim' : 'Não'}
                        />
                        <DetailField
                          label="Exige documento"
                          value={reason.requires_document ? 'Sim' : 'Não'}
                        />
                        <DetailField
                          label="Situação"
                          value={reason.is_active ? 'Ativa' : 'Inativa'}
                        />
                        <DetailField label="Tenant" value={reason.tenant_id} full />
                      </DetailGrid>
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
                        <DetailField label="Criado em" value={formatDateTime(reason.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(reason.updated_at)} />
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
        title="Excluir motivo de falta?"
        description={reason ? `O motivo "${reason.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
