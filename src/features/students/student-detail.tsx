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
import { formatCpf, formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { StudentGenderBadge, StudentStatusBadge } from './columns';
import { GENDER_LABELS, RACE_LABELS } from './types';
import { StudentEnrollmentsTab } from './enrollments-tab';
import { useDeleteStudent, useStudent } from './hooks';

export function StudentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: student, isLoading, isError } = useStudent(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteStudent();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Aluno excluído.');
      router.push('/alunos');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Alunos', href: '/alunos' },
          { label: student?.full_name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !student ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Aluno não encontrado ou indisponível.{' '}
              <Link href="/alunos" className="underline">
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
                    <Link href="/alunos" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{student.full_name}</h1>
                      <StudentStatusBadge status={student.anonymized_at ? 'anonymized' : 'active'} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {student.registration_number ? `Matrícula ${student.registration_number}` : ''}
                      {student.birth_date ? ` · Nascimento ${formatDate(student.birth_date)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/alunos/${id}/editar`}>
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
                  <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Matrícula" value={student.registration_number} />
                        <DetailField label="Nome completo" value={student.full_name} />
                        <DetailField label="Nome social" value={student.social_name} />
                        <DetailField label="Nascimento" value={formatDate(student.birth_date)} />
                        <DetailField
                          label="Gênero"
                          value={student.gender ? <StudentGenderBadge gender={student.gender} /> : null}
                        />
                        <DetailField
                          label="Raça / cor"
                          value={student.race ? <Badge variant="secondary">{RACE_LABELS[student.race]}</Badge> : null}
                        />
                        <DetailField label="Nacionalidade" value={student.nationality} />
                        <DetailField
                          label="Naturalidade"
                          value={
                            student.birth_city
                              ? `${student.birth_city}${student.birth_state ? '/' + student.birth_state : ''}`
                              : null
                          }
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="CPF" value={student.cpf ? formatCpf(student.cpf) : null} />
                        <DetailField
                          label="RG"
                          value={
                            student.rg
                              ? `${student.rg}${student.rg_issuer ? ' / ' + student.rg_issuer : ''}`
                              : null
                          }
                        />
                        <DetailField label="NIS" value={student.nis} />
                        <DetailField label="Número da certidão" value={student.birth_certificate_number} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="matriculas">
                  <StudentEnrollmentsTab studentId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(student.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(student.updated_at)} />
                        <DetailField label="Anonimizado em" value={student.anonymized_at ? formatDateTime(student.anonymized_at) : null} />
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
        title="Excluir aluno?"
        description={student ? `O aluno "${student.full_name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
