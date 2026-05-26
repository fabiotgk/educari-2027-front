'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Topbar } from '@/components/dashboard/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatCpf, formatDate } from '@/lib/format';
import { listResource } from '@/lib/api-client';
import { toastError, toastSuccess } from '@/lib/toast';
import { StudentGenderBadge, StudentStatusBadge } from './columns';
import { RACE_LABELS } from './types';
import { StudentAuditTab } from './audit-tab';
import { StudentCourseEnrollmentsTab } from './course-enrollments-tab';
import { StudentDocumentsTab } from './documents-tab';
import { StudentEssayEvaluationsTab } from './essay-evaluations-tab';
import { StudentEnrollmentsTab } from './enrollments-tab';
import { StudentFacialEnrollmentsTab } from './facial-enrollments-tab';
import { StudentGuardiansTab } from './guardians-tab';
import { StudentGradesTab } from './grades-tab';
import { StudentKitSizingTab } from './kit-sizing-tab';
import { StudentLearningPathsTab } from './learning-paths-tab';
import { StudentAttendanceTab } from './attendance-tab';
import { useDeleteStudent, useStudent } from './hooks';

interface ActiveEnrollment {
  id: string;
  status: string;
}

interface ActiveCourseEnrollment {
  id: string;
  status: string;
}

interface ActiveLearningPath {
  id: string;
  status: string | null;
}

interface FacialEnrollment {
  id: string;
  status: string;
}

function getFacialBadgeLabel(rows: FacialEnrollment[]): 'Ativo' | 'Pendente' | 'Não cadastrado' {
  if (rows.length === 0) {
    return 'Não cadastrado';
  }

  if (rows.some((row) => row.status === 'active')) {
    return 'Ativo';
  }

  return 'Pendente';
}

function getFacialBadgeVariant(label: 'Ativo' | 'Pendente' | 'Não cadastrado') {
  if (label === 'Ativo') return 'secondary';
  if (label === 'Pendente') return 'outline';
  return 'destructive';
}

export function StudentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: student, isLoading, isError } = useStudent(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteStudent();

  const schoolEnrollmentsKpi = useQuery({
    queryKey: ['students', 'enrollments', 'kpi', id],
    queryFn: () =>
      listResource<ActiveEnrollment>('enrollments', {
        filter: { student_id: id, status: 'active' },
        limit: 200,
      }),
  });

  const courseEnrollmentsKpi = useQuery({
    queryKey: ['students', 'course-enrollments', 'kpi', id],
    queryFn: () =>
      listResource<ActiveCourseEnrollment>('course-enrollments', {
        filter: { student_id: id, status: 'active' },
        limit: 200,
      }),
  });

  const learningPathsKpi = useQuery({
    queryKey: ['students', 'learning-paths', 'kpi', id],
    queryFn: () =>
      listResource<ActiveLearningPath>('learning-paths', {
        filter: { student_id: id, status: 'active' },
        limit: 200,
      }),
  });

  const facialEnrollmentsKpi = useQuery({
    queryKey: ['students', 'facial-enrollments', 'kpi', id],
    queryFn: () =>
      listResource<FacialEnrollment>('facial-enrollments', {
        filter: { student_id: id },
        limit: 200,
      }),
  });

  const kpiLoading =
    schoolEnrollmentsKpi.isLoading ||
    courseEnrollmentsKpi.isLoading ||
    learningPathsKpi.isLoading ||
    facialEnrollmentsKpi.isLoading;

  const facialLabel = getFacialBadgeLabel(facialEnrollmentsKpi.data?.data ?? []);
  const kpiStats: Stat[] = [
    {
      label: 'Matrículas escolares ativas',
      value: schoolEnrollmentsKpi.data?.data.length ?? 0,
      icon: 'BookOpen',
      accent: 'primary',
    },
    {
      label: 'Matrículas AVA ativas',
      value: courseEnrollmentsKpi.data?.data.length ?? 0,
      icon: 'GraduationCap',
      accent: 'secondary',
    },
    {
      label: 'Trilhas em andamento',
      value: learningPathsKpi.data?.data.length ?? 0,
      icon: 'Route',
      accent: 'success',
    },
    {
      label: 'Cadastro facial',
      value: <Badge variant={getFacialBadgeVariant(facialLabel)}>{facialLabel}</Badge>,
      icon: 'Fingerprint',
      accent: 'warning',
    },
  ];

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
                      {student.inep_id ? ` · INEP ${student.inep_id}` : ''}
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

              <StatCards stats={kpiStats} loading={kpiLoading} />

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="matriculas">Matrículas escolares</TabsTrigger>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                  <TabsTrigger value="frequencia">Frequência</TabsTrigger>
                  <TabsTrigger value="matriculas-ava">Matrículas AVA</TabsTrigger>
                  <TabsTrigger value="trilhas">Trilhas adaptativas</TabsTrigger>
                  <TabsTrigger value="redacoes">Redações (IA)</TabsTrigger>
                  <TabsTrigger value="facial">Reconhecimento facial</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="kit-escolar">Kit escolar</TabsTrigger>
                  <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados gerais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={student.id} />
                        <DetailField label="Tenant" value={student.tenant_id} />
                        <DetailField label="Situação" value={student.anonymized_at ? 'Anônimo' : 'Ativo'} />
                        <DetailField label="Matrícula" value={student.registration_number} />
                        <DetailField label="INEP ID" value={student.inep_id} />
                        <DetailField label="Nome completo" value={student.full_name} />
                        <DetailField label="Nome social" value={student.social_name} />
                        <DetailField label="Nome fonético" value={student.phonetic_name} />
                        <DetailField label="Data de nascimento" value={formatDate(student.birth_date)} />
                        <DetailField
                          label="Gênero"
                          value={student.gender ? <StudentGenderBadge gender={student.gender} /> : '—'}
                        />
                        <DetailField
                          label="Raça / cor"
                          value={student.race ? <Badge variant="secondary">{RACE_LABELS[student.race]}</Badge> : '—'}
                        />
                        <DetailField label="Nacionalidade" value={student.nationality} />
                        <DetailField
                          label="Naturalidade"
                          value={
                            student.birth_city
                              ? `${student.birth_city}${student.birth_state ? `/${student.birth_state}` : ''}`
                              : null
                          }
                        />
                        <DetailField
                          label="Foto"
                          value={
                            student.photo_url ? (
                              <a
                                className="text-sm text-primary underline"
                                href={student.photo_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Abrir
                              </a>
                            ) : (
                              '—'
                            )
                          }
                        />
                        <DetailField label="Observações" value={student.notes} full />
                      </DetailGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos e identificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="CPF" value={student.cpf ? formatCpf(student.cpf) : null} />
                        <DetailField
                          label="RG"
                          value={
                            student.rg
                              ? `${student.rg}${student.rg_issuer ? ` / ${student.rg_issuer}` : ''}`
                              : null
                          }
                        />
                        <DetailField label="NIS" value={student.nis} />
                        <DetailField label="Número da certidão" value={student.birth_certificate_number} />
                        <DetailField label="PII protegido" value={student.has_pii ? 'Sim' : 'Não'} />
                      </DetailGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria do recurso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDate(student.created_at)} />
                        <DetailField label="Atualizado em" value={formatDate(student.updated_at)} />
                        <DetailField
                          label="Anonimizado em"
                          value={student.anonymized_at ? formatDate(student.anonymized_at) : '—'}
                        />
                        <DetailField
                          label="Excluído em"
                          value={student.deleted_at ? formatDate(student.deleted_at) : '—'}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="matriculas">
                  <StudentEnrollmentsTab studentId={id} />
                </TabsContent>

                <TabsContent value="notas">
                  <StudentGradesTab studentId={id} />
                </TabsContent>

                <TabsContent value="frequencia">
                  <StudentAttendanceTab studentId={id} />
                </TabsContent>

                <TabsContent value="matriculas-ava">
                  <StudentCourseEnrollmentsTab studentId={id} />
                </TabsContent>

                <TabsContent value="trilhas">
                  <StudentLearningPathsTab studentId={id} />
                </TabsContent>

                <TabsContent value="redacoes">
                  <StudentEssayEvaluationsTab studentId={id} />
                </TabsContent>

                <TabsContent value="facial">
                  <StudentFacialEnrollmentsTab studentId={id} />
                </TabsContent>

                <TabsContent value="documentos">
                  <StudentDocumentsTab studentId={id} />
                </TabsContent>

                <TabsContent value="kit-escolar">
                  <StudentKitSizingTab studentId={id} />
                </TabsContent>

                <TabsContent value="responsaveis">
                  <StudentGuardiansTab studentId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <StudentAuditTab student={student} studentId={id} />
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
