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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { useLessonPlan, useCreateLessonPlan, useUpdateLessonPlan } from './hooks';
import { buildLessonPlanPayload, lessonPlanSchema, lessonPlanToForm, emptyLessonPlanForm, type LessonPlanFormValues } from './schema';
import type { LessonPlan } from './types';
import type { ClassDiary } from '@/features/class-diaries/types';
import type { EvaluationPeriod } from '@/features/evaluation-periods/types';

export function LessonPlanFormPage({
  lessonPlanId,
  classDiaryId,
  evaluationPeriodId,
}: {
  lessonPlanId?: string;
  classDiaryId?: string;
  evaluationPeriodId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(lessonPlanId);
  const detail = useLessonPlan(lessonPlanId ?? '');

  const form = useForm<LessonPlanFormValues>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: {
      ...emptyLessonPlanForm,
      class_diary_id: classDiaryId ?? '',
      evaluation_period_id: evaluationPeriodId ?? '',
    },
  });

  const { control, register, formState: { errors } } = form;
  const create = useCreateLessonPlan();
  const update = useUpdateLessonPlan();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(lessonPlanToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLessonPlanPayload(values);
      if (isEdit && lessonPlanId) {
        await update.mutateAsync({ id: lessonPlanId, body: payload });
        toastSuccess('Plano de aula atualizado com sucesso.');
        router.push(`/diario/planos/${lessonPlanId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Plano de aula criado com sucesso.');
        router.push(`/diario/planos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/diario/planos/${lessonPlanId}` : '/diario/planos';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Planos de aula', href: '/diario/planos' },
          { label: isEdit ? 'Editar plano' : 'Novo plano' },
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
                  {isEdit ? 'Editar plano de aula' : 'Novo plano de aula'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Cadastre o planejamento de aula vinculado ao diário e ao período avaliativo.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Relacionamentos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Diário" required error={errors.class_diary_id?.message}>
                      <Controller
                        control={control}
                        name="class_diary_id"
                        render={({ field }) => (
                          <ResourceCombobox<ClassDiary>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="class-diaries"
                            labelFn={(item) => `${item.academic_year} · ${item.class_id}`}
                            placeholder="Selecione um diário"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Período avaliativo" required error={errors.evaluation_period_id?.message}>
                      <Controller
                        control={control}
                        name="evaluation_period_id"
                        render={({ field }) => (
                          <ResourceCombobox<EvaluationPeriod>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="evaluation-periods"
                            labelFn={(item) => `${item.code} · ${item.name}`}
                            placeholder="Selecione um período"
                          />
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Planejamento</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Aulas planejadas" required error={errors.planned_lessons?.message}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        {...register('planned_lessons')}
                        aria-invalid={!!errors.planned_lessons}
                      />
                    </Field>

                    <Field label="Aulas ministradas" error={errors.taught_lessons?.message}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        {...register('taught_lessons')}
                        aria-invalid={!!errors.taught_lessons}
                      />
                    </Field>

                    <Field label="Objetivos" htmlFor="goals" error={errors.goals?.message} className="sm:col-span-2">
                      <Textarea id="goals" rows={4} {...register('goals')} aria-invalid={!!errors.goals} />
                    </Field>

                    <Field label="Conteúdo (um item por linha)" htmlFor="content" error={errors.content?.message} className="sm:col-span-2">
                      <Textarea id="content" rows={4} {...register('content')} aria-invalid={!!errors.content} />
                    </Field>

                    <Field
                      label="Competências esperadas (um item por linha)"
                      htmlFor="expected_competencies"
                      error={errors.expected_competencies?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="expected_competencies"
                        rows={4}
                        {...register('expected_competencies')}
                        aria-invalid={!!errors.expected_competencies}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Aprovação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      O status de aprovação é controlado por fluxo administrativo e não pode ser editado aqui.
                    </p>
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
                {isEdit ? 'Salvar alterações' : 'Criar plano'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
