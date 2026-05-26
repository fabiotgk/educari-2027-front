'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { QuestionsTab } from './questions-tab';
import { useDeleteQuestionBank, useQuestionBank } from './hooks';

export function QuestionBankDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: bank, isLoading, isError } = useQuestionBank(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteQuestionBank();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Banco de questões excluído.');
      router.push('/banco-questoes');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Banco de Questões', href: '/banco-questoes' },
          { label: bank?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !bank ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Banco de questões não encontrado ou indisponível.{' '}
              <Link href="/banco-questoes" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              {/* Cabeçalho */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/banco-questoes" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{bank.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {bank.description ?? 'Banco de questões para avaliações'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/banco-questoes/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              {/* Abas */}
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="questoes">Questões</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do banco</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={2}>
                        <DetailField label="Nome" value={bank.name} />
                        <DetailField
                          label="Disciplina (ID)"
                          value={bank.subject_id}
                        />
                        {bank.description && (
                          <DetailField label="Descrição" full value={bank.description} />
                        )}
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="questoes">
                  <QuestionsTab questionBankId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(bank.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(bank.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={bank.deleted_at ? formatDateTime(bank.deleted_at) : null}
                        />
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
        title="Excluir banco de questões?"
        description={
          bank ? `O banco "${bank.name}" e todas as suas questões serão excluídos.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
