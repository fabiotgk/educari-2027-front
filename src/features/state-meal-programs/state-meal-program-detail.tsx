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
import { formatCurrency, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { StateMealProgramStatusBadge } from './columns';
import { STATE_MEAL_PROGRAM_STATUS_LABELS } from './types';
import { useDeleteStateMealProgram, useStateMealProgram } from './hooks';

export function StateMealProgramDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: program, isLoading, isError } = useStateMealProgram(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteStateMealProgram();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Programa excluído.');
      router.push('/pnae-estadual');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'PNAE Estadual' },
          { label: 'Programas', href: '/pnae-estadual' },
          { label: program?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !program ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Programa não encontrado ou indisponível.{' '}
              <Link href="/pnae-estadual" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/pnae-estadual" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{program.name}</h1>
                      <StateMealProgramStatusBadge status={program.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {program.agreement_number ? `Convênio: ${program.agreement_number}` : 'Sem convênio'}
                      {program.fiscal_year ? ` · Ano fiscal: ${program.fiscal_year}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/pnae-estadual/${id}/editar`}>
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
                      <CardTitle className="text-base">Dados do programa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Nome do programa" value={program.name} />
                        <DetailField label="Número do convênio" value={program.agreement_number} />
                        <DetailField label="Ano fiscal" value={program.fiscal_year} />
                        <DetailField label="Valor total" value={program.total_value != null ? formatCurrency(program.total_value) : null} />
                        <DetailField label="Fonte de financiamento" value={program.funding_source} />
                        <DetailField label="Situação" value={<StateMealProgramStatusBadge status={program.status} />} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm">
                        {program.notes ?? '—'}
                      </p>
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
                        <DetailField label="Criado em" value={formatDateTime(program.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(program.updated_at)} />
                        <DetailField label="Excluído em" value={program.deleted_at ? formatDateTime(program.deleted_at) : null} />
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
        title="Excluir programa?"
        description={program ? `O programa "${program.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
