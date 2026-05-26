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
import { formatDateTime, formatPercent } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { LessonProgressStatusBadge } from './columns';
import { toNumber } from './types';
import { useDeleteLessonProgress, useLessonProgress } from './hooks';

export function LessonProgressDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: progress, isLoading, isError } = useLessonProgress(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLessonProgress();
  const percent = toNumber(progress?.progress_percent);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Progresso excluído.');
      router.push('/ava/progresso');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Progresso', href: '/ava/progresso' }, { label: 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !progress ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Progresso não encontrado. <Link href="/ava/progresso" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/progresso" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">Progresso da aula</h1>
                      <LessonProgressStatusBadge status={progress.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{progress.lesson_id} · {percent == null ? 'Sem progresso' : formatPercent(percent, 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/progresso/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
                <TabsContent value="resumo">
                  <Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Matrícula" value={<Link href={`/ava/matriculas/${progress.course_enrollment_id}`} className="underline-offset-4 hover:underline">{progress.course_enrollment_id}</Link>} />
                    <DetailField label="Aula" value={progress.lesson_id} />
                    <DetailField label="Situação" value={<LessonProgressStatusBadge status={progress.status} />} />
                    <DetailField label="Progresso" value={percent == null ? null : formatPercent(percent, 0)} />
                    <DetailField label="Tempo gasto" value={`${toNumber(progress.time_spent_seconds) ?? 0} segundos`} />
                    <DetailField label="Concluído em" value={formatDateTime(progress.completed_at)} />
                    <DetailField label="Último acesso" value={formatDateTime(progress.last_accessed_at)} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(progress.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(progress.updated_at)} />
                    <DetailField label="Excluído em" value={progress.deleted_at ? formatDateTime(progress.deleted_at) : null} />
                    <DetailField label="Tenant" value={progress.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir progresso?" description="O registro de progresso da aula será excluído." confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
