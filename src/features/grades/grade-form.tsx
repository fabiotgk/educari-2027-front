'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { applyApiErrors } from '@/lib/form';
import { GRADE_KIND_LABELS, type GradeKind } from './types';
import { buildGradePayload, gradeSchema, gradeToForm, emptyGradeForm, type GradeFormValues } from './schema';
import { useCreateGrade, useGrade, useUpdateGrade } from './hooks';

interface EnrollmentOption {
  id: string;
  student_id?: string | null;
  student?: { id: string; full_name?: string | null; name?: string | null } | null;
  class?: { id: string; name?: string | null } | null;
}

interface SubjectOption {
  id: string;
  name?: string | null;
  code?: string | null;
}

interface EvaluationPeriodOption {
  id: string;
  name?: string | null;
}

function buildEnrollmentLabel(item: EnrollmentOption): string {
  const student = item.student?.full_name ?? item.student?.name ?? item.student_id ?? 'Aluno sem nome';
  const schoolClass = item.class?.name;
  return schoolClass ? `${student} · ${schoolClass}` : student;
}

export function GradeFormPage({ gradeId }: { gradeId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(gradeId);
  const detail = useGrade(gradeId ?? '');

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: emptyGradeForm,
  });

  const { control, register, formState: { errors } } = form;
  const create = useCreateGrade();
  const update = useUpdateGrade();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(gradeToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildGradePayload(values);

    try {
      if (isEdit && gradeId) {
        await update.mutateAsync({ id: gradeId, body: payload });
        router.push(`/notas/${gradeId}`);
      } else {
        const created = await create.mutateAsync(payload);
        router.push(`/notas/${created.id}`);
      }
    } catch (error) {
      if (!applyApiErrors(error, form.setError)) {
        // tratar erro global no util padrão
      }
    }
  });

  const backHref = isEdit ? `/notas/${gradeId}` : '/notas';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Notas e Boletim', href: '/notas' },
          { label: isEdit ? 'Editar nota' : 'Nova nota' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <Link href={backHref} aria-label="Voltar">
                  <ArrowLeft />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {isEdit ? 'Editar nota' : 'Nova nota'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Lance e mantenha notas por matrícula, disciplina e período.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-80 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados principais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Matrícula" required error={errors.enrollment_id?.message}>
                      <Controller
                        control={control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <ResourceCombobox<EnrollmentOption>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="enrollments"
                            searchable={false}
                            labelFn={buildEnrollmentLabel}
                            placeholder="Selecione a matrícula"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Disciplina" required error={errors.subject_id?.message}>
                      <Controller
                        control={control}
                        name="subject_id"
                        render={({ field }) => (
                          <ResourceCombobox<SubjectOption>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="subjects"
                            labelFn={(item) => item.name ?? item.code ?? item.id}
                            searchable={false}
                            placeholder="Selecione a disciplina"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Período avaliativo" required error={errors.evaluation_period_id?.message}>
                      <Controller
                        control={control}
                        name="evaluation_period_id"
                        render={({ field }) => (
                          <ResourceCombobox<EvaluationPeriodOption>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="evaluation-periods"
                            labelFn={(item) => item.name ?? item.id}
                            placeholder="Selecione o período"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Tipo" required error={errors.kind?.message}>
                      <Controller
                        control={control}
                        name="kind"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.kind}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(GRADE_KIND_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field label="Peso" htmlFor="weight" error={errors.weight?.message}>
                      <Input
                        id="weight"
                        type="number"
                        min={0}
                        step="0.01"
                        {...register('weight')}
                        aria-invalid={!!errors.weight}
                        placeholder="Ex.: 1"
                      />
                    </Field>

                    <Field label="Atividade" htmlFor="activity_label" error={errors.activity_label?.message}>
                      <Input
                        id="activity_label"
                        {...register('activity_label')}
                        aria-invalid={!!errors.activity_label}
                        placeholder="Nome da atividade (opcional)"
                      />
                    </Field>

                    <Field label="Nota numérica" htmlFor="score_numeric" error={errors.score_numeric?.message}>
                      <Input
                        id="score_numeric"
                        type="number"
                        step="0.01"
                        {...register('score_numeric')}
                        aria-invalid={!!errors.score_numeric}
                        placeholder="Ex.: 8.75"
                      />
                    </Field>

                    <Field label="Conceito" htmlFor="score_concept" error={errors.score_concept?.message}>
                      <Input
                        id="score_concept"
                        maxLength={8}
                        {...register('score_concept')}
                        aria-invalid={!!errors.score_concept}
                        placeholder="Apto"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalhes da nota</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Nota descritiva" htmlFor="score_descriptive" error={errors.score_descriptive?.message} className="sm:col-span-2">
                      <Textarea
                        id="score_descriptive"
                        rows={3}
                        {...register('score_descriptive')}
                        aria-invalid={!!errors.score_descriptive}
                        placeholder="Observações conceituais da avaliação"
                      />
                    </Field>
                    <Field label="Observações" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
                      <Textarea
                        id="notes"
                        rows={3}
                        {...register('notes')}
                        aria-invalid={!!errors.notes}
                        placeholder="Complementos e justificativas"
                      />
                    </Field>
                    <Field
                      label="Usuário responsável"
                      htmlFor="recorded_by_user_id"
                      error={errors.recorded_by_user_id?.message}
                      className="sm:col-span-2"
                    >
                      <Controller
                        control={control}
                        name="recorded_by_user_id"
                        render={({ field }) => (
                          <ResourceCombobox<{ id: string; name?: string | null; email?: string | null }>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="users"
                            searchable={false}
                            labelFn={(item) => item.name || item.email || item.id}
                            placeholder="Selecione o usuário"
                          />
                        )}
                      />
                    </Field>

                    {isEdit ? (
                      <Field
                        label="Justificativa"
                        htmlFor="justification"
                        error={errors.justification?.message}
                        className="sm:col-span-2"
                      >
                        <Textarea
                          id="justification"
                          rows={3}
                          {...register('justification')}
                          aria-invalid={!!errors.justification}
                          placeholder="Obrigatória para editar e justificar mudanças"
                        />
                      </Field>
                    ) : null}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Registrar nota'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
