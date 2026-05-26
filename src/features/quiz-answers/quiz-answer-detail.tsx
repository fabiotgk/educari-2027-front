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
import { AnswerCorrectBadge } from './columns';
import { useDeleteQuizAnswer, useQuizAnswer } from './hooks';

const json = (value: unknown) => value == null ? null : <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>;

export function QuizAnswerDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: answer, isLoading, isError } = useQuizAnswer(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteQuizAnswer();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Resposta excluída.');
      router.push('/ava/respostas');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Respostas', href: '/ava/respostas' }, { label: 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !answer ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Resposta não encontrada. <Link href="/ava/respostas" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/respostas" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Resposta</h1><AnswerCorrectBadge correct={answer.is_correct} /></div>
                    <p className="mt-1 text-sm text-muted-foreground">{answer.question?.statement ?? answer.lms_question_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/respostas/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card><CardHeader><CardTitle className="text-base">Dados da resposta</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Tentativa" value={<Link href={`/ava/tentativas/${answer.quiz_attempt_id}`} className="hover:underline">{answer.quiz_attempt_id}</Link>} />
                    <DetailField label="Questão" value={<Link href={`/ava/questoes/${answer.lms_question_id}`} className="hover:underline">{answer.question?.statement ?? answer.lms_question_id}</Link>} />
                    <DetailField label="Correção" value={<AnswerCorrectBadge correct={answer.is_correct} />} />
                    <DetailField label="Pontuação atribuída" value={answer.score_awarded} />
                    <DetailField label="Resposta" value={json(answer.answer)} full />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(answer.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(answer.updated_at)} />
                    <DetailField label="Excluído em" value={answer.deleted_at ? formatDateTime(answer.deleted_at) : null} />
                    <DetailField label="Tenant" value={answer.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir resposta?" description="A resposta selecionada será excluída." confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
