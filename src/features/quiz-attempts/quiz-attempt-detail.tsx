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
import { AttemptStatusBadge, PassedBadge } from './columns';
import { QuizAttemptAnswersTab } from './answers-tab';
import { useDeleteQuizAttempt, useQuizAttempt } from './hooks';

export function QuizAttemptDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: attempt, isLoading, isError } = useQuizAttempt(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteQuizAttempt();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Tentativa excluída.');
      router.push('/ava/tentativas');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Tentativas', href: '/ava/tentativas' }, { label: attempt ? `#${attempt.attempt_number}` : 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : isError || !attempt ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Tentativa não encontrada. <Link href="/ava/tentativas" className="underline">Voltar à lista</Link>.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild><Link href="/ava/tentativas" aria-label="Voltar"><ArrowLeft /></Link></Button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Tentativa #{attempt.attempt_number}</h1><AttemptStatusBadge status={attempt.status} /><PassedBadge passed={attempt.passed} /></div>
                    <p className="mt-1 text-sm text-muted-foreground">{attempt.quiz?.title ?? attempt.lms_quiz_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild><Link href={`/ava/tentativas/${id}/editar`}><Pencil /> Editar</Link></Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Trash2 /> Excluir</Button>
                </div>
              </div>
              <Tabs defaultValue="resumo">
                <TabsList><TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="respostas">Respostas</TabsTrigger><TabsTrigger value="auditoria">Auditoria</TabsTrigger></TabsList>
                <TabsContent value="resumo" className="space-y-6">
                  <Card><CardHeader><CardTitle className="text-base">Dados da tentativa</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Avaliação" value={attempt.quiz?.title ?? attempt.lms_quiz_id} />
                    <DetailField label="Aluno" value={attempt.student_id} />
                    <DetailField label="Usuário" value={attempt.user_id} />
                    <DetailField label="Número" value={attempt.attempt_number} />
                    <DetailField label="Pontuação" value={attempt.score} />
                    <DetailField label="Status" value={<AttemptStatusBadge status={attempt.status} />} />
                    <DetailField label="Resultado" value={<PassedBadge passed={attempt.passed} />} />
                    <DetailField label="Início" value={formatDateTime(attempt.started_at)} />
                    <DetailField label="Envio" value={formatDateTime(attempt.submitted_at)} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
                <TabsContent value="respostas"><QuizAttemptAnswersTab attemptId={id} /></TabsContent>
                <TabsContent value="auditoria">
                  <Card><CardHeader><CardTitle className="text-base">Auditoria</CardTitle></CardHeader><CardContent><DetailGrid cols={3}>
                    <DetailField label="Criado em" value={formatDateTime(attempt.created_at)} />
                    <DetailField label="Atualizado em" value={formatDateTime(attempt.updated_at)} />
                    <DetailField label="Excluído em" value={attempt.deleted_at ? formatDateTime(attempt.deleted_at) : null} />
                    <DetailField label="Tenant" value={attempt.tenant_id} />
                  </DetailGrid></CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} destructive loading={del.isPending} title="Excluir tentativa?" description={attempt ? `A tentativa #${attempt.attempt_number} será excluída.` : undefined} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
