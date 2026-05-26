'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, SaveAll } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { useQuery } from '@tanstack/react-query';
import { ApiError, createResource, getResource, listResource, updateResource } from '@/lib/api-client';
import { toastError, toastSuccess } from '@/lib/toast';
import { formatDate } from '@/lib/format';
import { useGrades } from './hooks';
import { type Grade, type GradeKind, type ReleaseEnrollmentRow } from './types';

interface ReleaseState {
  scoreNumeric: string;
  scoreConcept: string;
  scoreDescriptive: string;
}

interface RowUiState {
  saving: boolean;
  success: boolean;
  errors: {
    scoreNumeric?: string;
    scoreConcept?: string;
    scoreDescriptive?: string;
    general?: string;
  };
}

const RELEASE_KINDS = ['period', 'activity', 'recovery'] as const;

type KindValue = (typeof RELEASE_KINDS)[number];

function isJsonNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getError(errors: Record<string, string[]>, field: string): string | undefined {
  return errors[field]?.[0];
}

export function GradeReleasePage() {
  const router = useRouter();

  const [schoolId, setSchoolId] = React.useState('');
  const [periodId, setPeriodId] = React.useState('');
  const [subjectId, setSubjectId] = React.useState('');
  const [kindInput, setKindInput] = React.useState('period');

  const canLoadEnrollments = Boolean(schoolId && periodId && subjectId);

  const enrollmentsQuery = useQuery({
    queryKey: ['grades', 'release-enrollments', { schoolId, periodId, subjectId, kindInput }],
    enabled: canLoadEnrollments,
    queryFn: () =>
      listResource<ReleaseEnrollmentRow>('enrollments', {
        filter: {
          school_id: schoolId,
        },
        limit: 200,
      }),
  });

  const rows = enrollmentsQuery.data?.data ?? [];

  const [rowValues, setRowValues] = React.useState<Record<string, ReleaseState>>({});
  const [rowBase, setRowBase] = React.useState<Record<string, ReleaseState>>({});
  const [rowUi, setRowUi] = React.useState<Record<string, RowUiState>>({});
  const [savingAll, setSavingAll] = React.useState(false);

  React.useEffect(() => {
    if (!canLoadEnrollments) {
      setRowValues({});
      setRowBase({});
      setRowUi({});
      return;
    }

    setRowValues((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const row of rows) {
        if (!next[row.id]) {
          next[row.id] = { scoreNumeric: '', scoreConcept: '', scoreDescriptive: '' };
          changed = true;
        }
      }
      if (!changed && Object.keys(next).every((id) => rows.some((row) => row.id === id))) {
        return next;
      }
      return next;
    });
  }, [rows, canLoadEnrollments]);

  React.useEffect(() => {
    setRowBase((prev) => {
      if (Object.keys(prev).length === Object.keys(rowValues).length &&
        Object.entries(rowValues).every(([id, value]) => {
          const base = prev[id];
          if (!base) return false;
          return (
            base.scoreNumeric === value.scoreNumeric &&
            base.scoreConcept === value.scoreConcept &&
            base.scoreDescriptive === value.scoreDescriptive
          );
        })) {
        return prev;
      }

      const next = { ...prev };
      for (const row of rows) {
        next[row.id] = { ...rowValues[row.id] };
      }
      return next;
    });
  }, [rowValues, rows]);

  const releaseGrade = React.useCallback(
    async (enrollmentId: string) => {
      const current = rowValues[enrollmentId];
      if (!current) return;

      setRowUi((state) => ({
        ...state,
        [enrollmentId]: {
          saving: true,
          success: false,
          errors: {},
        },
      }));

      const trimmedKind = kindInput.trim();
      const hasKind = (RELEASE_KINDS as readonly string[]).includes(trimmedKind);

      if (!hasKind) {
        setRowUi((state) => ({
          ...state,
          [enrollmentId]: {
            saving: false,
            success: false,
            errors: { general: 'Tipo inválido. Use period, activity ou recovery.' },
          },
        }));
        return;
      }

      const gradePayload = {
        enrollment_id: enrollmentId,
        subject_id: subjectId,
        evaluation_period_id: periodId,
        kind: trimmedKind as KindValue,
        weight: 1,
        score_numeric: isJsonNumber(current.scoreNumeric),
        score_concept: current.scoreConcept.trim() || undefined,
        score_descriptive: current.scoreDescriptive.trim() || undefined,
      };

      if (
        gradePayload.score_numeric === undefined &&
        !gradePayload.score_concept &&
        !gradePayload.score_descriptive
      ) {
        setRowUi((state) => ({
          ...state,
          [enrollmentId]: {
            saving: false,
            success: false,
            errors: { general: 'Informe pelo menos um valor para salvar.' },
          },
        }));
        return;
      }

      try {
        const found = await listResource<Grade>('grades', {
          filter: {
            enrollment_id: enrollmentId,
            subject_id: subjectId,
            evaluation_period_id: periodId,
            kind: trimmedKind,
          },
          limit: 1,
        });

        const existing = found.data[0];

        if (existing) {
          await updateResource('grades', existing.id, gradePayload);
        } else {
          await createResource('grades', gradePayload);
        }

        setRowBase((base) => ({
          ...base,
          [enrollmentId]: {
            scoreNumeric: current.scoreNumeric,
            scoreConcept: current.scoreConcept,
            scoreDescriptive: current.scoreDescriptive,
          },
        }));
        setRowUi((state) => ({
          ...state,
          [enrollmentId]: {
            saving: false,
            success: true,
            errors: {},
          },
        }));
        toastSuccess('Nota salva.');
      } catch (error) {
        if (error instanceof ApiError && error.isValidation) {
          const apiErrors = error.errors;
          setRowUi((state) => ({
            ...state,
            [enrollmentId]: {
              saving: false,
              success: false,
              errors: {
                scoreNumeric: getError(apiErrors, 'score_numeric'),
                scoreConcept: getError(apiErrors, 'score_concept'),
                scoreDescriptive: getError(apiErrors, 'score_descriptive'),
                general: getError(apiErrors, 'kind') || getError(apiErrors, 'subject_id') || getError(apiErrors, 'enrollment_id') || getError(apiErrors, 'evaluation_period_id') || undefined,
              },
            },
          }));
          return;
        }

        setRowUi((state) => ({
          ...state,
          [enrollmentId]: {
            saving: false,
            success: false,
            errors: { general: undefined },
          },
        }));
        toastError(error);
      }
    },
    [kindInput, periodId, rowValues, subjectId],
  );

  const changedRows = React.useMemo(
    () =>
      rows
        .map((row) => row.id)
        .filter((id) => {
          const current = rowValues[id];
          const base = rowBase[id];
          if (!current || !base) return false;
          return (
            current.scoreNumeric !== base.scoreNumeric ||
            current.scoreConcept !== base.scoreConcept ||
            current.scoreDescriptive !== base.scoreDescriptive
          );
        }),
    [rowBase, rowValues, rows],
  );

  const hasLoadedSelectors = canLoadEnrollments;

  const saveAllChanged = async () => {
    setSavingAll(true);
    try {
      const results = await Promise.allSettled(changedRows.map((id) => releaseGrade(id)));
      const failed = results.filter((result) => result.status === 'rejected').length;
      if (failed === 0) {
        toastSuccess('Todas as alterações foram salvas.');
      } else {
        toastError(`${changedRows.length} alterações processadas, ${failed} com falha.`);
      }
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Notas e Boletim', href: '/notas' }, { label: 'Lançamento em lote' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lançar notas em lote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Escola</label>
                  <ResourceCombobox<{ id: string; name: string }>
                    value={schoolId || null}
                    onChange={(value) => setSchoolId(value ?? '')}
                    resource="schools"
                    labelFn={(item) => item.name}
                    searchable={false}
                    placeholder="Selecione a escola"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Período avaliativo</label>
                  <ResourceCombobox<{ id: string; name: string }>
                    value={periodId || null}
                    onChange={(value) => setPeriodId(value ?? '')}
                    resource="evaluation-periods"
                    labelFn={(item) => item.name}
                    placeholder="Selecione o período"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Disciplina</label>
                  <Input
                    value={subjectId}
                    onChange={(event) => setSubjectId(event.target.value)}
                    placeholder="ID da disciplina"
                    aria-label="Disciplina"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tipo de avaliação</label>
                  <Input
                    value={kindInput}
                    onChange={(event) => setKindInput(event.target.value)}
                    placeholder="period | activity | recovery"
                    aria-label="Tipo"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSchoolId('');
                    setPeriodId('');
                    setSubjectId('');
                    setKindInput('period');
                  }}
                >
                  Limpar filtros
                </Button>
                <Button type="button" onClick={saveAllChanged} disabled={savingAll || !changedRows.length || !hasLoadedSelectors}>
                  {savingAll && <Loader2 className="animate-spin" />} <SaveAll /> Salvar todas alteradas
                </Button>
                <Button asChild>
                  <Link href="/notas">Voltar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {enrollmentsQuery.isLoading ? (
            <Skeleton className="h-52 w-full rounded-xl" />
          ) : enrollmentsQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar as matrículas dessa escola.
            </div>
          ) : !hasLoadedSelectors ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Selecione a escola, período e disciplina para carregar os alunos e iniciar o lançamento.
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
              Nenhuma matrícula encontrada para esta escola.
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border bg-card">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="w-32">Nota numérica</TableHead>
                    <TableHead className="w-32">Conceito</TableHead>
                    <TableHead>Nota descritiva</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((enrollment) => {
                    const values = rowValues[enrollment.id] ?? { scoreNumeric: '', scoreConcept: '', scoreDescriptive: '' };
                    const ui = rowUi[enrollment.id] ?? { saving: false, success: false, errors: {} };
                    const base = rowBase[enrollment.id];
                    const isDirty =
                      base
                        ? values.scoreNumeric !== base.scoreNumeric ||
                          values.scoreConcept !== base.scoreConcept ||
                          values.scoreDescriptive !== base.scoreDescriptive
                        : true;

                    const studentName =
                      enrollment.student?.full_name ??
                      enrollment.student?.name ??
                      enrollment.student_id ??
                      'Aluno sem nome';

                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{studentName}</p>
                            <p className="text-xs text-muted-foreground">{enrollment.student_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={values.scoreNumeric}
                            onChange={(event) =>
                              setRowValues((state) => ({
                                ...state,
                                [enrollment.id]: {
                                  ...state[enrollment.id],
                                  scoreNumeric: event.target.value,
                                },
                              }))
                            }
                            placeholder="9.0"
                            aria-label={`Nota numérica de ${studentName}`}
                            onBlur={() => setRowUi((state) => ({ ...state, [enrollment.id]: { ...state[enrollment.id], success: false } }))}
                            className="w-24"
                            type="number"
                          />
                          {ui.errors.scoreNumeric ? <p className="mt-1 text-xs text-destructive">{ui.errors.scoreNumeric}</p> : null}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={values.scoreConcept}
                            onChange={(event) =>
                              setRowValues((state) => ({
                                ...state,
                                [enrollment.id]: {
                                  ...state[enrollment.id],
                                  scoreConcept: event.target.value,
                                },
                              }))
                            }
                            placeholder="A"
                            aria-label={`Conceito de ${studentName}`}
                            className="w-20"
                          />
                          {ui.errors.scoreConcept ? <p className="mt-1 text-xs text-destructive">{ui.errors.scoreConcept}</p> : null}
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={values.scoreDescriptive}
                            onChange={(event) =>
                              setRowValues((state) => ({
                                ...state,
                                [enrollment.id]: {
                                  ...state[enrollment.id],
                                  scoreDescriptive: event.target.value,
                                },
                              }))
                            }
                            rows={2}
                            placeholder="Observação curta"
                          />
                          {ui.errors.scoreDescriptive ? <p className="mt-1 text-xs text-destructive">{ui.errors.scoreDescriptive}</p> : null}
                          {ui.errors.general ? <p className="mt-1 text-xs text-destructive">{ui.errors.general}</p> : null}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {ui.saving && <Loader2 className="size-4 animate-spin" />}
                            {ui.success && !ui.saving && <CheckCircle2 className="size-4 text-emerald-600" />}
                            {ui.success && !ui.saving ? 'Salvo' : null}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            type="button"
                            disabled={ui.saving || !isDirty}
                            onClick={() => releaseGrade(enrollment.id)}
                          >
                            {ui.saving && <Loader2 className="size-4 animate-spin" />}
                            Salvar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
