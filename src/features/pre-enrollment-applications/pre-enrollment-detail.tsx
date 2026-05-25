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
import { formatDate, formatDateTime } from '@/lib/format';
import { maskPhone } from '@/lib/masks';
import { toastError, toastSuccess } from '@/lib/toast';
import { PreEnrollmentStatusBadge } from './columns';
import { useDeletePreEnrollmentApplication, usePreEnrollmentApplication } from './hooks';

export function PreEnrollmentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: application, isLoading, isError } = usePreEnrollmentApplication(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeletePreEnrollmentApplication();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Inscrição excluída.');
      router.push('/pre-matricula');
    } catch (err) {
      toastError(err);
    }
  };

  const student = application?.student_data;
  const guardian = application?.guardian_data;
  const address = application?.address_data;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Pré-Matrícula', href: '/pre-matricula' },
          { label: application?.protocol_number ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !application ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Inscrição não encontrada ou indisponível.{' '}
              <Link href="/pre-matricula" className="underline">
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
                    <Link href="/pre-matricula" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {String(student?.name ?? 'Inscrição')}
                      </h1>
                      <PreEnrollmentStatusBadge status={application.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Protocolo: {application.protocol_number}
                      {application.created_at ? ` · Enviada em ${formatDate(application.created_at)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/pre-matricula/${id}/editar`}>
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
                  <TabsTrigger value="aluno">Aluno</TabsTrigger>
                  <TabsTrigger value="responsavel">Responsável</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados da inscrição</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Protocolo" value={application.protocol_number} />
                        <DetailField
                          label="Situação"
                          value={<PreEnrollmentStatusBadge status={application.status} />}
                        />
                        <DetailField label="Inscrito em" value={formatDateTime(application.created_at)} />
                        <DetailField label="Matriculado em" value={application.placed_at ? formatDateTime(application.placed_at) : null} />
                        <DetailField label="Turma alocada" value={application.placed_class_id ?? null} />
                        <DetailField
                          label="Termos aceitos em"
                          value={application.accepted_terms_at ? formatDateTime(application.accepted_terms_at) : null}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {application.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{application.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="aluno">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do aluno</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Nome" value={String(student?.name ?? '—')} />
                        <DetailField
                          label="Data de nascimento"
                          value={student?.birth_date ? formatDate(String(student.birth_date)) : null}
                        />
                        {Object.entries(student ?? {})
                          .filter(([k]) => !['name', 'birth_date'].includes(k))
                          .map(([k, v]) => (
                            <DetailField key={k} label={k} value={String(v ?? '')} />
                          ))}
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="responsavel">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do responsável</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Nome" value={String(guardian?.name ?? '—')} />
                        <DetailField label="E-mail" value={String(guardian?.email ?? '')} />
                        <DetailField
                          label="Telefone"
                          value={guardian?.phone ? maskPhone(String(guardian.phone)) : null}
                        />
                        <DetailField label="Parentesco" value={String(guardian?.relationship ?? '')} />
                        {Object.entries(guardian ?? {})
                          .filter(([k]) => !['name', 'email', 'phone', 'relationship'].includes(k))
                          .map(([k, v]) => (
                            <DetailField key={k} label={k} value={String(v ?? '')} />
                          ))}
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="endereco">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Endereço informado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="CEP" value={String(address?.cep ?? '—')} />
                        <DetailField
                          label="Município"
                          value={
                            address?.cidade
                              ? `${String(address.cidade)}${address.uf ? '/' + String(address.uf) : ''}`
                              : null
                          }
                        />
                        <DetailField label="Bairro" value={String(address?.bairro ?? '')} />
                        <DetailField
                          label="Logradouro"
                          full
                          value={
                            address?.logradouro
                              ? `${String(address.logradouro)}${address.numero ? ', ' + String(address.numero) : ''}`
                              : null
                          }
                        />
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
                        <DetailField label="Criado em" value={formatDateTime(application.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(application.updated_at)} />
                        <DetailField
                          label="Excluído em"
                          value={application.deleted_at ? formatDateTime(application.deleted_at) : null}
                        />
                        <DetailField label="Hash dos termos" value={application.terms_text_hash} />
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
        title="Excluir inscrição?"
        description={
          application
            ? `A inscrição "${application.protocol_number}" será excluída permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
