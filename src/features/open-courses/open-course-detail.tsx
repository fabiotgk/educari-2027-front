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
import { OpenCourseModalityBadge, OpenCourseStatusBadge } from './columns';
import { MODALITY_LABELS, STATUS_LABELS } from './types';
import { useDeleteOpenCourse, useOpenCourse } from './hooks';

export function OpenCourseDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: course, isLoading, isError } = useOpenCourse(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteOpenCourse();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Curso excluído.');
      router.push('/cursos-livres');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Cursos Livres' },
          { label: 'Lista', href: '/cursos-livres' },
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
              <Link href="/cursos-livres" className="underline">
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
                    <Link href="/cursos-livres" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
                      <OpenCourseStatusBadge status={course.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {MODALITY_LABELS[course.modality]}
                      {course.workload_hours ? ` · ${course.workload_hours}h` : ''}
                      {course.vacancies != null ? ` · ${course.vacancies} vagas` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/cursos-livres/${id}/editar`}>
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
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações do curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Título" value={course.title} />
                        <DetailField label="Modalidade" value={<OpenCourseModalityBadge modality={course.modality} />} />
                        <DetailField label="Status" value={<OpenCourseStatusBadge status={course.status} />} />
                        <DetailField label="Carga horária" value={`${course.workload_hours}h`} />
                        <DetailField label="Vagas" value={course.vacancies ?? null} />
                        <DetailField label="Emite certificado" value={course.certificate_enabled ? 'Sim' : 'Não'} />
                        <DetailField label="Início" value={formatDate(course.starts_at)} />
                        <DetailField label="Término" value={formatDate(course.ends_at)} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {course.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap text-sm">{course.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(course.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(course.updated_at)} />
                        <DetailField label="Excluído em" value={course.deleted_at ? formatDateTime(course.deleted_at) : null} />
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
