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
import { formatDate } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteEvasionOccurrence, useEvasionOccurrence } from './hooks';
import { EVASION_OCCURRENCE_ASSIGNED_TO_LABELS, EVASION_OCCURRENCE_KIND_LABELS, EVASION_OCCURRENCE_STATUS_LABELS, EvasionOccurrenceKind, EvasionOccurrenceStatus, EvasionOccurrenceAssignedTo } from './types';
import {
  EvasionOccurrenceAssignedToBadge,
  EvasionOccurrenceKindBadge,
  EvasionOccurrenceStatusBadge,
} from './columns';

export function EvasionOccurrenceDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: occurrence, isLoading, isError } = useEvasionOccurrence(id);
  const del = useDeleteEvasionOccurrence();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Ocorrência excluída.');
      router.push('/evasao');
    } catch (err) {
      toastError(err);
    }
  };

  const summaryFields = [
    { label: 'ID', value: occurrence?.id },
    { label: 'Tenant', value: occurrence?.tenant_id },
    { label: 'Matrícula', value: occurrence?.enrollment_id },
    { label: 'Aluno', value: occurrence?.student_id },
    { label: 'Tipo', value: occurrence?.kind ? <EvasionOccurrenceKindBadge kind={occurrence.kind} /> : undefined },
    { label: 'Responsável', value: occurrence?.assigned_to ? <EvasionOccurrenceAssignedToBadge assignedTo={occurrence.assigned_to} /> : undefined },
    { label: 'Status', value: occurrence?.status ? <EvasionOccurrenceStatusBadge status={occurrence.status} /> : undefined },
    {
      label: 'Frequência na detecção',
      value:
        occurrence?.attendance_pct_at_detection == null
          ? '—'
          : String(occurrence.attendance_pct_at_detection),
    },
    {
      label: 'Faltas consecutivas',
      value: occurrence?.consecutive_absences_at_detection == null ? '—' : occurrence.consecutive_absences_at_detection,
    },
    { label: 'Detectada em', value: formatDate(occurrence?.detected_at) },
    { label: 'Resolvida em', value: formatDate(occurrence?.resolved_at) },
    { label: 'Motivo', value: occurrence?.reason ?? '—' },
    { label: 'Observações', value: occurrence?.notes ?? '—' },
  ];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Monitor de Evasão', href: '/evasao' }, { label: 'Ocorrência' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !occurrence ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Ocorrência não encontrada ou indisponível. <Link href="/evasao" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/evasao" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Ocorrência de evasão</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {EVASION_OCCURRENCE_KIND_LABELS[(occurrence.kind as EvasionOccurrenceKind)]} · {EVASION_OCCURRENCE_ASSIGNED_TO_LABELS[(occurrence.assigned_to as EvasionOccurrenceAssignedTo)]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Matrícula {occurrence.enrollment_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/evasao/${id}/editar`}><Pencil /> Editar</Link>
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
                      <CardTitle className="text-base">Resumo da ocorrência</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        {summaryFields.map((field) => (
                          <DetailField key={field.label} label={field.label} value={field.value} />
                        ))}
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
                        <DetailField label="Criada em" value={formatDate(occurrence.created_at)} />
                        <DetailField label="Atualizada em" value={formatDate(occurrence.updated_at)} />
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
        title="Excluir ocorrência?"
        description={occurrence ? `A ocorrência da matrícula ${occurrence.enrollment_id} será excluída.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
