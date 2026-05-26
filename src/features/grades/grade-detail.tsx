'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import type { Column } from '@/components/crud/data-table';

import { Topbar } from '@/components/dashboard/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { GRADE_KIND_LABELS, type Grade, type GradeAuditLog } from './types';
import { useGrade, useGradeAuditLogs, useDeleteGrade } from './hooks';

function formatScore(score: number | string | null, concept: string | null): string {
  if (score !== null) {
    const parsed = typeof score === 'number' ? score : Number.parseFloat(score);
    return Number.isNaN(parsed) ? '—' : formatNumber(parsed, 2);
  }

  if (concept) return concept;
  return '—';
}

function isRecoveredLabel(isRecovered: boolean): React.ReactNode {
  return <Badge variant={isRecovered ? 'default' : 'outline'}>{isRecovered ? 'Sim' : 'Não'}</Badge>;
}

function buildAuditColumns(audit: GradeAuditLog[]): Column<GradeAuditLog>[] {
  return [
    {
      id: 'changed_at',
      header: 'Data',
      cell: (row) => formatDateTime(row.changed_at),
      sortValue: (row) => row.changed_at,
      exportValue: (row) => row.changed_at ?? '',
    },
    {
      id: 'old',
      header: 'Nota antiga',
      cell: (row) => row.old_score ?? '—',
      sortValue: (row) => Number(row.old_score ?? 0),
      exportValue: (row) => String(row.old_score ?? ''),
    },
    {
      id: 'new',
      header: 'Nota nova',
      cell: (row) => row.new_score ?? '—',
      sortValue: (row) => Number(row.new_score ?? 0),
      exportValue: (row) => String(row.new_score ?? ''),
    },
    {
      id: 'user',
      header: 'Usuário',
      cell: (row) => row.changed_by_user_id ?? '—',
      sortValue: (row) => row.changed_by_user_id,
      exportValue: (row) => row.changed_by_user_id,
    },
    {
      id: 'justification',
      header: 'Justificativa',
      cell: (row) => row.justification ?? '—',
      sortValue: (row) => row.justification ?? '',
      exportValue: (row) => row.justification ?? '',
    },
  ];
}

function formatAuditDate(date: string | null): string {
  if (!date) return '—';
  return formatDate(date);
}

export function GradeDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const gradeQuery = useGrade(id);
  const grade = gradeQuery.data;
  const del = useDeleteGrade();
  const logsQuery = useGradeAuditLogs({
    filter: gradeQuery.data ? { grade_id: gradeQuery.data.id } : undefined,
    limit: 50,
  });

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [auditRows, setAuditRows] = React.useState<GradeAuditLog[]>([]);

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Nota excluída com sucesso.');
      router.push('/notas');
    } catch (error) {
      toastError(error);
    }
  };

  React.useEffect(() => {
    if (logsQuery.data?.data) {
      setAuditRows(logsQuery.data.data);
    }
  }, [logsQuery.data]);

  const enrollmentLabel =
    grade?.enrollment?.student?.full_name ??
    grade?.enrollment?.student?.name ??
    grade?.enrollment_id ??
    '—';

  const classLabel = grade?.enrollment?.class?.name ?? '—';
  const subjectLabel = grade?.subject?.name ?? grade?.subject_id;
  const periodLabel = grade?.evaluation_period?.name ?? grade?.evaluation_period_id;
  const typeLabel = GRADE_KIND_LABELS[grade?.kind ?? 'period'];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Notas e Boletim', href: '/notas' }, { label: grade?.subject_id ?? 'Detalhe' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {gradeQuery.isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : gradeQuery.isError || !grade ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Nota não encontrada. <Link href="/notas" className="underline">Voltar à lista</Link>.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/notas" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">Nota de {enrollmentLabel}</h1>
                      <Badge variant={grade.is_recovered ? 'secondary' : 'outline'}>
                        {grade.is_recovered ? 'Recuperação' : 'Regular'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subjectLabel} · {periodLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/notas/${id}/editar`}>
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
                      <CardTitle className="text-base">Dados da nota</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={grade.id} />
                        <DetailField label="Matrícula" value={grade.enrollment_id} />
                        <DetailField label="Aluno" value={enrollmentLabel} />
                        <DetailField label="Turma" value={classLabel} />
                        <DetailField label="Disciplina" value={subjectLabel} />
                        <DetailField label="Período" value={periodLabel} />
                        <DetailField label="Tipo" value={typeLabel} />
                        <DetailField label="Atividade" value={grade.activity_label} />
                        <DetailField label="Peso" value={grade.weight ?? '—'} />
                        <DetailField label="Nota" value={formatScore(grade.score_numeric, grade.score_concept)} />
                        <DetailField label="Conceito" value={grade.score_concept ?? '—'} />
                        <DetailField label="Nota recuperada" value={isRecoveredLabel(grade.is_recovered)} />
                        <DetailField label="Registrado em" value={formatDateTime(grade.recorded_at)} />
                        <DetailField label="Registrado por" value={grade.recorded_by_user_id ?? '—'} />
                        <DetailField label="Observações" value={grade.notes} full />
                        <DetailField label="Criado em" value={formatDateTime(grade.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(grade.updated_at)} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Histórico de alterações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {logsQuery.isLoading ? (
                        <Skeleton className="h-40 w-full rounded-xl" />
                      ) : logsQuery.isError ? (
                        <p className="text-sm text-destructive">Não foi possível carregar o histórico de auditoria.</p>
                      ) : auditRows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum registro de alteração para esta nota.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border">
                          <Table>
                            <TableHeader className="bg-muted/40">
                              {[
                                { id: 'changed_at', name: 'Data' },
                                { id: 'old_score', name: 'Nota anterior' },
                                { id: 'new_score', name: 'Nova nota' },
                                { id: 'user', name: 'Usuário' },
                                { id: 'justification', name: 'Justificativa' },
                              ].map((column) => (
                                <TableHead key={column.id}>{column.name}</TableHead>
                              ))}
                            </TableHeader>
                            <TableBody>
                              {auditRows.map((row) => (
                                <TableRow key={row.id}>
                                  <TableCell>{formatAuditDate(row.changed_at)}</TableCell>
                                  <TableCell>{row.old_score ?? '—'}</TableCell>
                                  <TableCell>{row.new_score ?? '—'}</TableCell>
                                  <TableCell>{row.changed_by_user_id ?? '—'}</TableCell>
                                  <TableCell>{row.justification ?? '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
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
        title="Excluir nota?"
        description={grade ? `A nota de "${grade.subject?.name ?? grade.subject_id}" será excluída.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
