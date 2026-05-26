'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { toastError, toastSuccess } from '@/lib/toast';
import { learningExpectationActiveLabel } from './types';
import { useDeleteLearningExpectation, useLearningExpectation } from './hooks';

export function LearningExpectationDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: expectation, isLoading, isError } = useLearningExpectation(id);
  const deleteExpectation = useDeleteLearningExpectation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const runDelete = async () => {
    try {
      await deleteExpectation.mutateAsync(id);
      toastSuccess('Habilidade BNCC excluída.');
      router.push('/diario/habilidades');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Habilidades BNCC', href: '/diario/habilidades' },
          { label: expectation ? expectation.bncc_code : 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !expectation ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Habilidade não encontrada ou indisponível. <Link href="/diario/habilidades" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/diario/habilidades" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{expectation.bncc_code}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {learningExpectationActiveLabel(expectation.is_active)} · Série {expectation.school_grade_id} · Componente {expectation.subject_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/diario/habilidades/${id}/editar`}>
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
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações da habilidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={expectation.id} />
                        <DetailField label="Código BNCC" value={expectation.bncc_code} />
                        <DetailField label="Série" value={expectation.school_grade_id} />
                        <DetailField label="Componente" value={expectation.subject_id} />
                        <DetailField label="Situação" value={learningExpectationActiveLabel(expectation.is_active)} />
                        <DetailField label="Descrição" value={expectation.description} full />
                      </DetailGrid>
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
                        <DetailField label="Criado em" value={expectation.created_at} />
                        <DetailField label="Atualizado em" value={expectation.updated_at} />
                        <DetailField label="Tenant" value={expectation.tenant_id} />
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
        loading={deleteExpectation.isPending}
        title="Excluir habilidade BNCC?"
        description={expectation ? `A habilidade ${expectation.bncc_code} será excluída.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}

