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
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { PublishedBadge } from './columns';
import { CourseModuleLessonsTab } from './lessons-tab';
import { useCourseModule, useDeleteCourseModule } from './hooks';

export function CourseModuleDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: module, isLoading, isError } = useCourseModule(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteCourseModule();
  const runDelete = async () => {
    try { await del.mutateAsync(id); toastSuccess('Módulo excluído.'); router.push('/ava/modulos'); } catch (err) { toastError(err); }
  };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Módulos', href: '/ava/modulos' }, { label: module?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        {isLoading ? <Skeleton className="h-80 w-full rounded-xl" /> : isError || !module ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Módulo não encontrado. <Link href="/ava/modulos" className="underline">Voltar à lista</Link>.</div> : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><Button variant="ghost" size="icon-sm" asChild><Link href="/ava/modulos" aria-label="Voltar"><ArrowLeft /></Link></Button><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{module.title}</h1><PublishedBadge published={module.is_published} /></div><p className="mt-1 text-sm text-muted-foreground">{module.course?.title ?? module.course_id}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" asChild><Link href={`/ava/modulos/${id}/editar`}><Pencil /> Editar</Link></Button><Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button></div></div>
            <Tabs defaultValue="resumo"><TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="aulas">Aulas</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
              <TabsContent value="resumo"><Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Curso" value={module.course?.title ?? module.course_id} /><DetailField label="Título" value={module.title} /><DetailField label="Posição" value={module.position} /><DetailField label="Publicado" value={<PublishedBadge published={module.is_published} />} /><DetailField label="Descrição" value={module.description} full /></DetailGrid></CardContent></Card></TabsContent>
              <TabsContent value="aulas"><CourseModuleLessonsTab moduleId={id} /></TabsContent>
              <TabsContent value="auditoria"><Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Criado em" value={formatDateTime(module.created_at)} /><DetailField label="Atualizado em" value={formatDateTime(module.updated_at)} /><DetailField label="Excluído em" value={module.deleted_at ? formatDateTime(module.deleted_at) : null} /><DetailField label="Tenant" value={module.tenant_id} /></DetailGrid></CardContent></Card></TabsContent>
            </Tabs>
          </>
        )}
      </div></main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir módulo?" description={module ? `O módulo "${module.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
