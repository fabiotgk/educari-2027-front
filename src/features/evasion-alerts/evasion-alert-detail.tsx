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
import { formatDate, formatNumber } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { EVASION_ALERT_SCOPE_LABELS } from './types';
import { useDeleteEvasionAlert, useEvasionAlert } from './hooks';
import { EvasionAlertStatusBadge } from './columns';

export function EvasionAlertDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: alert, isLoading, isError } = useEvasionAlert(id);
  const del = useDeleteEvasionAlert();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Alerta excluído.');
      router.push('/evasao/alertas');
    } catch (err) {
      toastError(err);
    }
  };

  const minAttendance = alert?.min_attendance_pct == null ? '—' : `${formatNumber(Number(alert.min_attendance_pct), 2)}%`;
  const maxAbsences = alert?.max_consecutive_absences ?? '—';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Monitor de Evasão', href: '/evasao' },
          { label: 'Alertas', href: '/evasao/alertas' },
          { label: 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !alert ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Alerta não encontrado ou indisponível. <Link href="/evasao/alertas" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/evasao/alertas" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{alert.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Escopo {EVASION_ALERT_SCOPE_LABELS[alert.scope]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/evasao/alertas/${id}/editar`}><Pencil /> Editar</Link>
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
                      <CardTitle className="text-base">Resumo do alerta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={alert.id} />
                        <DetailField label="Tenant" value={alert.tenant_id} />
                        <DetailField label="Escola" value={alert.school_id ?? '—'} />
                        <DetailField label="Nome" value={alert.name} />
                        <DetailField
                          label="Situação"
                          value={<EvasionAlertStatusBadge isActive={alert.is_active} />}
                        />
                        <DetailField label="Escopo" value={EVASION_ALERT_SCOPE_LABELS[alert.scope]} />
                        <DetailField label="Frequência mínima" value={minAttendance} />
                        <DetailField label="Máximo de faltas consecutivas" value={maxAbsences} />
                        <DetailField
                          label="Criado em"
                          value={formatDate(alert.created_at)}
                        />
                        <DetailField
                          label="Atualizado em"
                          value={formatDate(alert.updated_at)}
                        />
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
                        <DetailField label="Criado em" value={formatDate(alert.created_at)} />
                        <DetailField label="Atualizado em" value={formatDate(alert.updated_at)} />
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
        title="Excluir alerta?"
        description={alert ? `O alerta "${alert.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
