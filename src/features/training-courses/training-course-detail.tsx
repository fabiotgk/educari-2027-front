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
import { TrainingCourseStatusBadge } from './columns';
import { TrainingEnrollmentsTab } from './training-enrollments-tab';
import { TRAINING_COURSE_STATUS_LABELS } from './types';
import { useDeleteTrainingCourse, useTrainingCourse } from './hooks';

export function TrainingCourseDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: course, isLoading, isError } = useTrainingCourse(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteTrainingCourse();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Curso excluído.');
      router.push('/capacitacao');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Capacitação', href: '/capacitacao' },
          { label: course?.title ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !course ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Curso não encontrado ou indisponível.{' '}
              <Link href="/capacitacao" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/capacitacao" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
                      <TrainingCourseStatusBadge status={course.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {TRAINING_COURSE_STATUS_LABELS[course.status]}
                      {course.academic_year ? ` · Ano letivo ${course.academic_year}` : ''}
                      {course.workload_hours != null ? ` · ${course.workload_hours}h` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/capacitacao/${id}/editar`}>
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
                  <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados gerais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Ano letivo" value={course.academic_year} />
                        <DetailField
                          label="Situação"
                          value={<TrainingCourseStatusBadge status={course.status} />}
                        />
                        <DetailField
                          label="Carga horária"
                          value={course.workload_hours != null ? `${course.workload_hours}h` : null}
                        />
                        <DetailField label="Início" value={formatDate(course.starts_on)} />
                        <DetailField label="Término" value={formatDate(course.ends_on)} />
                        <DetailField label="ID do período" value={course.period_id} />
                        <DetailField label="ID da disciplina" value={course.subject_id} />
                        <DetailField
                          label="Séries-alvo"
                          value={course.target_grades?.join(', ') ?? null}
                        />
                        <DetailField
                          label="Responsável (ID)"
                          value={course.created_by_user_id}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {course.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{course.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="inscricoes">
                  <TrainingEnrollmentsTab courseId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(course.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(course.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={course.deleted_at ? formatDateTime(course.deleted_at) : null}
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
        title="Excluir curso?"
        description={course ? `O curso "${course.title}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
