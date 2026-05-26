'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteEvaluationPeriod, useEvaluationPeriod } from './hooks';

export function EvaluationPeriodDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: period, isLoading, isError } = useEvaluationPeriod(id);
  const deletePeriod = useDeleteEvaluationPeriod();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await deletePeriod.mutateAsync(id);
      toastSuccess('Período avaliativo excluído.');
      router.push('/diario/periodos');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Períodos avaliativos', href: '/diario/periodos' },
          { label: period ? `${period.code} · ${period.name}` : 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !period ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Período avaliativo não encontrado ou indisponível. <Link href="/diario/periodos" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/diario/periodos" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {period.code} · {period.name}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {period.academic_year} · Ordem {period.order} · {period.is_closed ? 'Fechado' : 'Aberto'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/diario/periodos/${id}/editar`}>
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
                      <CardTitle className="text-base">Informações do período</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Escola" value={period.school_id ?? '—'} />
                        <DetailField label="Ano letivo" value={period.academic_year} />
                        <DetailField label="Código" value={period.code} />
                        <DetailField label="Nome" value={period.name} />
                        <DetailField label="Ordem" value={String(period.order)} />
                        <DetailField label="Data inicial" value={formatDate(period.starts_at)} />
                        <DetailField label="Data final" value={formatDate(period.ends_at)} />
                        <DetailField label="Data de fechamento" value={formatDate(period.closing_date)} />
                        <DetailField label="Estado" value={period.is_closed ? 'Fechado' : 'Aberto'} />
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
                        <DetailField label="Criado em" value={formatDateTime(period.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(period.updated_at)} />
                        <DetailField label="Encerrado por" value={period.closed_by_user_id ?? '—'} />
                        <DetailField label="Encerrado em" value={formatDate(period.closed_at)} />
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
        loading={deletePeriod.isPending}
        title="Excluir período avaliativo?"
        description={period ? `O período ${period.code} será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}

