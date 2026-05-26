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
import { useDeleteLessonMaterial, useLessonMaterial } from './hooks';

export function LessonMaterialDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: material, isLoading, isError } = useLessonMaterial(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLessonMaterial();
  const runDelete = async () => { try { await del.mutateAsync(id); toastSuccess('Material excluído.'); router.push('/ava/materiais'); } catch (err) { toastError(err); } };
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Materiais', href: '/ava/materiais' }, { label: material?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30"><div className="space-y-6 p-6 lg:p-8">
        {isLoading ? <Skeleton className="h-80 w-full rounded-xl" /> : isError || !material ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Material não encontrado. <Link href="/ava/materiais" className="underline">Voltar à lista</Link>.</div> : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><Button variant="ghost" size="icon-sm" asChild><Link href="/ava/materiais" aria-label="Voltar"><ArrowLeft /></Link></Button><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{material.title}</h1>{material.file_type && <Badge variant="secondary">{material.file_type}</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{material.lesson?.title ?? material.lesson_id}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" asChild><Link href={`/ava/materiais/${id}/editar`}><Pencil /> Editar</Link></Button><Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button></div></div>
            <Tabs defaultValue="resumo"><TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
              <TabsContent value="resumo"><Card><CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Aula" value={material.lesson?.title ?? material.lesson_id} /><DetailField label="Título" value={material.title} /><DetailField label="Tipo" value={material.file_type} /><DetailField label="Tamanho" value={material.file_size_kb != null ? `${material.file_size_kb} KB` : null} /><DetailField label="Posição" value={material.position} /><DetailField label="URL" value={material.file_url} full /></DetailGrid></CardContent></Card></TabsContent>
              <TabsContent value="auditoria"><Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}><DetailField label="Criado em" value={formatDateTime(material.created_at)} /><DetailField label="Atualizado em" value={formatDateTime(material.updated_at)} /><DetailField label="Excluído em" value={material.deleted_at ? formatDateTime(material.deleted_at) : null} /><DetailField label="Tenant" value={material.tenant_id} /></DetailGrid></CardContent></Card></TabsContent>
            </Tabs>
          </>
        )}
      </div></main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir material?" description={material ? `O material "${material.title}" será excluído.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
