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
import { QuestionTypeBadge } from './columns';
import { useDeleteLmsQuestion, useLmsQuestion } from './hooks';

const json = (value: unknown) => value == null ? null : <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>;

export function LmsQuestionDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: question, isLoading, isError } = useLmsQuestion(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLmsQuestion();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Questão excluída.');
      router.push('/ava/questoes');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Questões', href: '/ava/questoes' }, { label: 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !question ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Questão não encontrada. <Link href="/ava/questoes" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/questoes" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Questão #{question.position}</h1><QuestionTypeBadge type={question.type} /></div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{question.statement}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/questoes/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card><CardHeader><CardTitle className="text-base">Dados da questão</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Avaliação" value={question.quiz?.title ?? question.lms_quiz_id} />
                    <DetailField label="Tipo" value={<QuestionTypeBadge type={question.type} />} />
                    <DetailField label="Pontuação" value={question.score} />
                    <DetailField label="Ordem" value={question.position} />
                    <DetailField label="Enunciado" value={question.statement} full />
                    <DetailField label="Opções" value={json(question.options)} full />
                    <DetailField label="Resposta correta" value={json(question.correct_answer)} full />
                    <DetailField label="Feedback" value={question.feedback} full />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(question.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(question.updated_at)} />
                    <DetailField label="Excluído em" value={question.deleted_at ? formatDateTime(question.deleted_at) : null} />
                    <DetailField label="Tenant" value={question.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir questão?" description="A questão selecionada será excluída." confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
