'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { LessonMaterialsTab } from './materials-tab';
import { LESSON_CONTENT_TYPE_LABELS } from './types';
import { useDeleteLesson, useLesson } from './hooks';

export function LessonDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: lesson, isLoading, isError } = useLesson(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLesson();
  const runDelete = async () => { try { await del.mutateAsync(id); toastSuccess('Aula excluída.'); router.push('/ava/aulas'); } catch (err) { toastError(err); } };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Aulas', href: '/ava/aulas' }, { label: lesson?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        {isLoading ? <Skeleton className="h-80 w-full rounded-xl" /> : isError || !lesson ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Aula não encontrada. <Link href="/ava/aulas" className="underline">Voltar à lista</Link>.</div> : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><Button variant="ghost" size="icon-sm" asChild><Link href="/ava/aulas" aria-label="Voltar"><ArrowLeft /></Link></Button><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1><Badge variant={lesson.is_published ? 'default' : 'secondary'}>{lesson.is_published ? 'Publicada' : 'Rascunho'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{lesson.course_module?.title ?? lesson.course_module_id}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" asChild><Link href={`/ava/aulas/${id}/editar`}><Pencil /> Editar</Link></Button><Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button></div></div>
            <Tabs defaultValue="resumo"><TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="materiais">Materiais</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
              <TabsContent value="resumo"><Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Módulo" value={lesson.course_module?.title ?? lesson.course_module_id} /><DetailField label="Título" value={lesson.title} /><DetailField label="Tipo" value={lesson.content_type ? LESSON_CONTENT_TYPE_LABELS[lesson.content_type] : null} /><DetailField label="Duração" value={lesson.duration_minutes != null ? `${lesson.duration_minutes} min` : null} /><DetailField label="Posição" value={lesson.position} /><DetailField label="Prévia" value={lesson.is_preview ? 'Sim' : 'Não'} /><DetailField label="Publicada" value={lesson.is_published ? 'Sim' : 'Não'} /><DetailField label="URL" value={lesson.content_url} full /><DetailField label="Corpo" value={lesson.content_body} full /></DetailGrid></CardContent></Card></TabsContent>
              <TabsContent value="materiais"><LessonMaterialsTab lessonId={id} /></TabsContent>
              <TabsContent value="auditoria"><Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Criada em" value={formatDateTime(lesson.created_at)} /><DetailField label="Atualizada em" value={formatDateTime(lesson.updated_at)} /><DetailField label="Excluída em" value={lesson.deleted_at ? formatDateTime(lesson.deleted_at) : null} /><DetailField label="Tenant" value={lesson.tenant_id} /></DetailGrid></CardContent></Card></TabsContent>
            </Tabs>
          </>
        )}
      </div></main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir aula?" description={lesson ? `A aula "${lesson.title}" será excluída.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
