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
import { QuizPublishedBadge } from './columns';
import { LmsQuizAttemptsTab } from './attempts-tab';
import { LmsQuizQuestionsTab } from './questions-tab';
import { useDeleteLmsQuiz, useLmsQuiz } from './hooks';

export function LmsQuizDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: quiz, isLoading, isError } = useLmsQuiz(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLmsQuiz();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Avaliação excluída.');
      router.push('/ava/avaliacoes');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Avaliações', href: '/ava/avaliacoes' }, { label: quiz?.title ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !quiz ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Avaliação não encontrada. <Link href="/ava/avaliacoes" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/avaliacoes" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{quiz.title}</h1>
                      <QuizPublishedBadge published={quiz.is_published} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{quiz.passing_score}% para aprovação · {quiz.max_attempts} tentativa(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/avaliacoes/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="questoes">Questões</TabsTrigger>
                  <TabsTrigger value="tentativas">Tentativas</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card><CardHeader><CardTitle className="text-base">Identificação e regras</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Título" value={quiz.title} />
                    <DetailField label="Curso" value={quiz.course?.title ?? quiz.course_id} />
                    <DetailField label="Aula" value={quiz.lesson?.title ?? quiz.lesson_id} />
                    <DetailField label="Nota de corte" value={`${quiz.passing_score}%`} />
                    <DetailField label="Máximo de tentativas" value={quiz.max_attempts} />
                    <DetailField label="Tempo limite" value={quiz.time_limit_minutes != null ? `${quiz.time_limit_minutes} min` : null} />
                    <DetailField label="Embaralha questões" value={quiz.shuffle_questions ? 'Sim' : 'Não'} />
                    <DetailField label="Publicação" value={<QuizPublishedBadge published={quiz.is_published} />} />
                    <DetailField label="Descrição" value={quiz.description} full />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="questoes"><LmsQuizQuestionsTab quizId={id} /></TabsContent>
                <TabsContent value="tentativas"><LmsQuizAttemptsTab quizId={id} /></TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(quiz.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(quiz.updated_at)} />
                    <DetailField label="Excluído em" value={quiz.deleted_at ? formatDateTime(quiz.deleted_at) : null} />
                    <DetailField label="Tenant" value={quiz.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir avaliação?" description={quiz ? `A avaliação "${quiz.title}" será excluída.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
