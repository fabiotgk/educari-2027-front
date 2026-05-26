'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { toastError, toastSuccess } from '@/lib/toast';
import { formatDate, formatDateTime } from '@/lib/format';
import { lessonPlanApprovalLabel, lessonPlanApprovalVariant } from './types';
import { useDeleteLessonPlan, useLessonPlan } from './hooks';

export function LessonPlanDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: plan, isLoading, isError } = useLessonPlan(id);
  const del = useDeleteLessonPlan();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Plano de aula excluído.');
      router.push('/diario/planos');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Planos de aula', href: '/diario/planos' },
          { label: plan ? `Plano ${formatDate(plan.created_at)}` : 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !plan ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Plano de aula não encontrado ou indisponível. <Link href="/diario/planos" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/diario/planos" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Plano de aula {plan.evaluation_period_id}
                      </h1>
                      <Badge variant={lessonPlanApprovalVariant(plan.approval_status)}>
                        {lessonPlanApprovalLabel(plan.approval_status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Diário {plan.class_diary_id} · Período {plan.evaluation_period_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/diario/planos/${id}/editar`}>
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

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações do plano</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={plan.id} />
                        <DetailField label="Diário" value={plan.class_diary_id} />
                        <DetailField label="Período" value={plan.evaluation_period_id} />
                        <DetailField label="Aulas planejadas" value={String(plan.planned_lessons)} />
                        <DetailField label="Aulas ministradas" value={plan.taught_lessons != null ? String(plan.taught_lessons) : '—'} />
                        <DetailField label="Objetivos" value={plan.goals ?? '—'} full />
                        <DetailField
                          label="Conteúdo"
                          value={plan.content && plan.content.length > 0 ? plan.content.join('\n') : '—'}
                          full
                        />
                        <DetailField
                          label="Competências"
                          value={
                            plan.expected_competencies && plan.expected_competencies.length > 0
                              ? plan.expected_competencies.join('\n')
                              : '—'
                          }
                          full
                        />
                        <DetailField label="Status" value={lessonPlanApprovalLabel(plan.approval_status)} />
                        <DetailField label="Aprovado em" value={formatDate(plan.approved_at)} />
                        <DetailField label="Aprovado por" value={plan.approved_by_user_id ?? '—'} />
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
                        <DetailField label="Criado em" value={formatDateTime(plan.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(plan.updated_at)} />
                        <DetailField label="Tenant" value={plan.tenant_id} />
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
        title="Excluir plano de aula?"
        description={plan ? `O plano ${plan.id} será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}

