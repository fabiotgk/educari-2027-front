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
import { toastError, toastSuccess } from '@/lib/toast';
import { formatDateTime } from '@/lib/format';
import { classDiaryStatusLabel, classLabel, subjectLabel, teacherLabel } from './types';
import { LessonPlansTab } from './lesson-plans-tab';
import { TeachingRecordsTab } from './teaching-records-tab';
import { useClassDiary, useDeleteClassDiary } from './hooks';

export function ClassDiaryDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: diary, isLoading, isError } = useClassDiary(id);
  const del = useDeleteClassDiary();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Diário excluído.');
      router.push('/diario');
    } catch (err) {
      toastError(err);
    }
  };

  const diaryTitle = diary ? `Diário ${diary.academic_year}` : 'Detalhe';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Diário Online', href: '/diario' }, { label: diaryTitle }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !diary ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Diário não encontrado ou indisponível. <Link href="/diario" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/diario" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{diaryTitle}</h1>
                      <Badge variant={diary.is_active ? 'default' : 'secondary'}>
                        {classDiaryStatusLabel(diary.is_active)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {classLabel(diary.class)} · {subjectLabel(diary.subject)} · {teacherLabel(diary.teacher)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/diario/${id}/editar`}>
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
                  <TabsTrigger value="planos">Planos de aula</TabsTrigger>
                  <TabsTrigger value="registros">Registros de aula</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações do diário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={diary.id} />
                        <DetailField label="Ano letivo" value={diary.academic_year} />
                        <DetailField label="ID da turma" value={diary.class_id} />
                        <DetailField label="Turma" value={classLabel(diary.class)} />
                        <DetailField label="Componente" value={subjectLabel(diary.subject)} />
                        <DetailField label="Professor" value={teacherLabel(diary.teacher)} />
                        <DetailField label="ID do professor" value={diary.teacher_user_id} />
                        <DetailField label="Situação" value={classDiaryStatusLabel(diary.is_active)} />
                        <DetailField label="Tenant" value={diary.tenant_id} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="planos">
                  <LessonPlansTab diaryId={diary.id} />
                </TabsContent>

                <TabsContent value="registros">
                  <TeachingRecordsTab diaryId={diary.id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(diary.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(diary.updated_at)} />
                        <DetailField label="Ano letivo" value={diary.academic_year} />
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
        title="Excluir diário?"
        description={diary ? `O diário ${diary.academic_year} será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
