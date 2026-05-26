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
import { CourseEnrollmentStatusBadge, resolveStudentName } from './columns';
import { CourseEnrollmentCertificatesTab } from './certificates-tab';
import { CourseEnrollmentLessonProgressTab } from './lesson-progress-tab';
import { ProgressBar } from './progress-bar';
import { toNumber } from './types';
import { useCourseEnrollment, useDeleteCourseEnrollment } from './hooks';

export function CourseEnrollmentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: enrollment, isLoading, isError } = useCourseEnrollment(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteCourseEnrollment();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Matrícula excluída.');
      router.push('/ava/matriculas');
    } catch (err) {
      toastError(err);
    }
  };

  const progress = toNumber(enrollment?.progress_percent);

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Matrículas', href: '/ava/matriculas' }, { label: 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !enrollment ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Matrícula não encontrada. <Link href="/ava/matriculas" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/matriculas" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{resolveStudentName(enrollment, new Map())}</h1>
                      <CourseEnrollmentStatusBadge status={enrollment.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Curso {enrollment.course_id} · {progress == null ? 'Sem progresso' : formatPercent(progress, 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/matriculas/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="progresso">Progresso</TabsTrigger>
                  <TabsTrigger value="certificado">Certificado</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Resumo da matrícula</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      <ProgressBar value={progress} />
                      <DetailGrid cols={3}>
                        <DetailField label="Aluno" value={resolveStudentName(enrollment, new Map())} />
                        <DetailField label="Curso" value={enrollment.course_id} />
                        <DetailField label="Situação" value={<CourseEnrollmentStatusBadge status={enrollment.status} />} />
                        <DetailField label="Usuário" value={enrollment.user?.name ?? enrollment.user_id} />
                        <DetailField label="Nota final" value={enrollment.final_grade} />
                        <DetailField label="Matriculado em" value={formatDateTime(enrollment.enrolled_at)} />
                        <DetailField label="Concluído em" value={formatDateTime(enrollment.completed_at)} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="progresso"><CourseEnrollmentLessonProgressTab courseEnrollmentId={id} /></TabsContent>
                <TabsContent value="certificado"><CourseEnrollmentCertificatesTab courseEnrollmentId={id} /></TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criada em" value={formatDateTime(enrollment.created_at)} />
                    <DetailField label="Atualizada em" value={formatDateTime(enrollment.updated_at)} />
                    <DetailField label="Excluída em" value={enrollment.deleted_at ? formatDateTime(enrollment.deleted_at) : null} />
                    <DetailField label="Tenant" value={enrollment.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir matrícula?" description="A matrícula no AVA será excluída." confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
