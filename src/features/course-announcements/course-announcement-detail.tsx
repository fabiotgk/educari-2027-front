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
import { useCourseAnnouncement, useDeleteCourseAnnouncement } from './hooks';

export function CourseAnnouncementDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: announcement, isLoading, isError } = useCourseAnnouncement(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteCourseAnnouncement();
  const runDelete = async () => { try { await del.mutateAsync(id); toastSuccess('Aviso excluído.'); router.push('/ava/avisos'); } catch (err) { toastError(err); } };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Avisos', href: '/ava/avisos' }, { label: announcement?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        {isLoading ? <Skeleton className="h-80 w-full rounded-xl" /> : isError || !announcement ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Aviso não encontrado. <Link href="/ava/avisos" className="underline">Voltar à lista</Link>.</div> : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><Button variant="ghost" size="icon-sm" asChild><Link href="/ava/avisos" aria-label="Voltar"><ArrowLeft /></Link></Button><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{announcement.title}</h1><Badge variant={announcement.is_pinned ? 'default' : 'secondary'}>{announcement.is_pinned ? 'Fixado' : 'Normal'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{announcement.course?.title ?? announcement.course_id}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" asChild><Link href={`/ava/avisos/${id}/editar`}><Pencil /> Editar</Link></Button><Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button></div></div>
            <Tabs defaultValue="resumo"><TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
              <TabsContent value="resumo"><Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Curso" value={announcement.course?.title ?? announcement.course_id} /><DetailField label="Título" value={announcement.title} /><DetailField label="Fixado" value={announcement.is_pinned ? 'Sim' : 'Não'} /><DetailField label="Publicado em" value={formatDateTime(announcement.published_at)} /><DetailField label="Autor" value={announcement.author?.name ?? announcement.author_id} /><DetailField label="Conteúdo" value={announcement.body} full /></DetailGrid></CardContent></Card></TabsContent>
              <TabsContent value="auditoria"><Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Criado em" value={formatDateTime(announcement.created_at)} /><DetailField label="Atualizado em" value={formatDateTime(announcement.updated_at)} /><DetailField label="Excluído em" value={announcement.deleted_at ? formatDateTime(announcement.deleted_at) : null} /><DetailField label="Tenant" value={announcement.tenant_id} /></DetailGrid></CardContent></Card></TabsContent>
            </Tabs>
          </>
        )}
      </div></main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir aviso?" description={announcement ? `O aviso "${announcement.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
