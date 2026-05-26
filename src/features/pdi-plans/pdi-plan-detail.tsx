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
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { PdiPlanStatusBadge } from './columns';
import { PdiGoalsTab } from './pdi-goals-tab';
import { useDeletePdiPlan, usePdiPlan } from './hooks';

export function PdiPlanDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: plan, isLoading, isError } = usePdiPlan(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeletePdiPlan();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('PDI excluído.');
      router.push('/aee');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Educação Especial' },
          { label: 'Planos PDI', href: '/aee' },
          { label: plan ? `PDI ${plan.reference_year}` : 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !plan ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              PDI não encontrado ou indisponível.{' '}
              <Link href="/aee" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/aee" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        PDI — Ano {plan.reference_year}
                      </h1>
                      <PdiPlanStatusBadge status={plan.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Início: {formatDate(plan.started_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/aee/${id}/editar`}>
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
                  <TabsTrigger value="metas">Metas</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do PDI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Situação" value={<PdiPlanStatusBadge status={plan.status} />} />
                        <DetailField label="Ano de referência" value={plan.reference_year} />
                        <DetailField label="Início" value={formatDate(plan.started_at)} />
                        <DetailField
                          label="ID do aluno"
                          value={<span className="font-mono text-xs">{plan.student_id}</span>}
                        />
                        <DetailField
                          label="ID da escola"
                          value={
                            plan.school_id ? (
                              <span className="font-mono text-xs">{plan.school_id}</span>
                            ) : null
                          }
                        />
                        <DetailField
                          label="Responsável (UUID)"
                          value={
                            plan.responsible_user_id ? (
                              <span className="font-mono text-xs">{plan.responsible_user_id}</span>
                            ) : null
                          }
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metas">
                  <PdiGoalsTab pdiPlanId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(plan.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(plan.updated_at)} />
                        <DetailField
                          label="Excluído em"
                          value={plan.deleted_at ? formatDateTime(plan.deleted_at) : null}
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
        title="Excluir PDI?"
        description={plan ? `O PDI do ano "${plan.reference_year}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
