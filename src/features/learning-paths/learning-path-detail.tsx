'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatDateTime, formatPercent } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { LearningPathDifficultyBadge, LearningPathStatusBadge } from './columns';
import { DIFFICULTY_LABELS, STATUS_LABELS } from './types';
import { useDeleteLearningPath, useLearningPath } from './hooks';

export function LearningPathDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: lp, isLoading, isError } = useLearningPath(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLearningPath();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Trilha de aprendizagem excluída.');
      router.push('/ia-adaptativo');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Ensino Adaptativo IA' },
          { label: 'Trilhas', href: '/ia-adaptativo' },
          { label: lp?.title ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !lp ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Trilha não encontrada ou indisponível.{' '}
              <Link href="/ia-adaptativo" className="underline">
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
                    <Link href="/ia-adaptativo" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{lp.title}</h1>
                      {lp.status && <LearningPathStatusBadge status={lp.status} />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lp.difficulty ? DIFFICULTY_LABELS[lp.difficulty] : '—'}
                      {lp.current_level ? ` · Nível: ${lp.current_level}` : ''}
                      {lp.progress_pct != null ? ` · Progresso: ${formatPercent(lp.progress_pct, 0)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/ia-adaptativo/${id}/editar`}>
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
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados da trilha</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Título" value={lp.title} />
                        <DetailField label="Status" value={lp.status ? <LearningPathStatusBadge status={lp.status} /> : null} />
                        <DetailField label="Dificuldade" value={lp.difficulty ? <LearningPathDifficultyBadge difficulty={lp.difficulty} /> : null} />
                        <DetailField label="Nível atual" value={lp.current_level} />
                        <DetailField label="Progresso" value={lp.progress_pct != null ? formatPercent(lp.progress_pct, 0) : null} />
                        <DetailField label="Aluno (UUID)" value={lp.student_id ? <span className="font-mono text-xs">{lp.student_id}</span> : null} />
                        <DetailField label="Disciplina (UUID)" value={lp.subject_id ? <span className="font-mono text-xs">{lp.subject_id}</span> : null} />
                      </DetailGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Itens da trilha</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {lp.items && Array.isArray(lp.items) && lp.items.length > 0 ? (
                        <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                          {JSON.stringify(lp.items, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum item cadastrado.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criada em" value={formatDateTime(lp.created_at)} />
                        <DetailField label="Atualizada em" value={formatDateTime(lp.updated_at)} />
                        <DetailField label="Excluída em" value={lp.deleted_at ? formatDateTime(lp.deleted_at) : null} />
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
        title="Excluir trilha?"
        description={lp ? `A trilha "${lp.title}" será excluída.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
