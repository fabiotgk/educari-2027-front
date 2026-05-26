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
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { CourseLevelBadge, CourseStatusBadge } from './columns';
import { CourseAnnouncementsTab } from './announcements-tab';
import { CourseEnrollmentsTab } from './enrollments-tab';
import { CourseForumsTab } from './forums-tab';
import { CourseModulesTab } from './modules-tab';
import { useCourse, useDeleteCourse } from './hooks';

export function CourseDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: course, isLoading, isError } = useCourse(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteCourse();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Curso excluído.');
      router.push('/ava');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Cursos', href: '/ava' }, { label: course?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !course ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Curso não encontrado. <Link href="/ava" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
                      <CourseStatusBadge status={course.status} />
                      <CourseLevelBadge level={course.level} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{course.category ?? 'Sem categoria'} · {course.workload_hours != null ? `${course.workload_hours} horas` : 'Carga horária não informada'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="modulos">Módulos</TabsTrigger>
                  <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
                  <TabsTrigger value="avisos">Avisos</TabsTrigger>
                  <TabsTrigger value="foruns">Fóruns</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card><CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Título" value={course.title} />
                    <DetailField label="Slug" value={course.slug} />
                    <DetailField label="Categoria" value={course.category} />
                    <DetailField label="Status" value={<CourseStatusBadge status={course.status} />} />
                    <DetailField label="Nível" value={<CourseLevelBadge level={course.level} />} />
                    <DetailField label="Carga horária" value={course.workload_hours != null ? `${course.workload_hours} h` : null} />
                    <DetailField label="Autoestudo" value={course.is_self_paced ? 'Sim' : 'Não'} />
                    <DetailField label="Início" value={formatDate(course.starts_at)} />
                    <DetailField label="Término" value={formatDate(course.ends_at)} />
                    <DetailField label="Instrutor" value={course.instructor?.name ?? course.instructor_id} />
                    <DetailField label="Publicado em" value={formatDateTime(course.published_at)} />
                    <DetailField label="Imagem de capa" value={course.cover_image} />
                    <DetailField label="Descrição" value={course.description} full />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="modulos"><CourseModulesTab courseId={id} /></TabsContent>
                <TabsContent value="matriculas"><CourseEnrollmentsTab courseId={id} /></TabsContent>
                <TabsContent value="avisos"><CourseAnnouncementsTab courseId={id} /></TabsContent>
                <TabsContent value="foruns"><CourseForumsTab courseId={id} /></TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(course.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(course.updated_at)} />
                    <DetailField label="Excluído em" value={course.deleted_at ? formatDateTime(course.deleted_at) : null} />
                    <DetailField label="Tenant" value={course.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir curso?" description={course ? `O curso "${course.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
