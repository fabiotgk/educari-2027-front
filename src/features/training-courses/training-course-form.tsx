'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { TRAINING_COURSE_STATUS_LABELS } from './types';
import {
  buildTrainingCoursePayload,
  emptyTrainingCourseForm,
  trainingCourseSchema,
  trainingCourseToForm,
  type TrainingCourseFormValues,
} from './schema';
import { useCreateTrainingCourse, useTrainingCourse, useUpdateTrainingCourse } from './hooks';

export function TrainingCourseFormPage({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(courseId);
  const detail = useTrainingCourse(courseId ?? '');

  const form = useForm<TrainingCourseFormValues>({
    resolver: zodResolver(trainingCourseSchema),
    defaultValues: emptyTrainingCourseForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateTrainingCourse();
  const update = useUpdateTrainingCourse();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(trainingCourseToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildTrainingCoursePayload(values);
    try {
      if (isEdit && courseId) {
        await update.mutateAsync({ id: courseId, body: payload });
        toastSuccess('Curso atualizado com sucesso.');
        router.push(`/capacitacao/${courseId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Curso criado com sucesso.');
        router.push(`/capacitacao/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/capacitacao/${courseId}` : '/capacitacao';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Capacitação', href: '/capacitacao' },
          { label: isEdit ? 'Editar curso' : 'Novo curso' },
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
                  {isEdit ? 'Editar curso de capacitação' : 'Novo curso de capacitação'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do curso de capacitação.'
                    : 'Cadastre um novo curso de capacitação para professores.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Título do curso"
                      htmlFor="title"
                      required
                      error={errors.title?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="title"
                        {...register('title')}
                        aria-invalid={!!errors.title}
                        placeholder="Ex: Formação em Metodologias Ativas"
                      />
                    </Field>
                    <Field
                      label="Ano letivo"
                      htmlFor="academic_year"
                      required
                      error={errors.academic_year?.message}
                    >
                      <Input
                        id="academic_year"
                        inputMode="numeric"
                        maxLength={9}
                        {...register('academic_year')}
                        aria-invalid={!!errors.academic_year}
                        placeholder="2025"
                      />
                    </Field>
                    <Field
                      label="Situação"
                      required
                      error={errors.status?.message}
                    >
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TRAINING_COURSE_STATUS_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field
                      label="Descrição"
                      htmlFor="description"
                      error={errors.description?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="description"
                        rows={3}
                        {...register('description')}
                        aria-invalid={!!errors.description}
                        placeholder="Descreva os objetivos e conteúdo do curso…"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Período e carga horária</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Data de início"
                      htmlFor="starts_on"
                      error={errors.starts_on?.message}
                    >
                      <Input
                        id="starts_on"
                        type="date"
                        {...register('starts_on')}
                        aria-invalid={!!errors.starts_on}
                      />
                    </Field>
                    <Field
                      label="Data de término"
                      htmlFor="ends_on"
                      error={errors.ends_on?.message}
                    >
                      <Input
                        id="ends_on"
                        type="date"
                        {...register('ends_on')}
                        aria-invalid={!!errors.ends_on}
                      />
                    </Field>
                    <Field
                      label="Carga horária (horas)"
                      htmlFor="workload_hours"
                      required
                      error={errors.workload_hours?.message}
                    >
                      <Input
                        id="workload_hours"
                        inputMode="decimal"
                        {...register('workload_hours')}
                        aria-invalid={!!errors.workload_hours}
                        placeholder="40"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Referências e público-alvo</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="ID do período"
                      htmlFor="period_id"
                      hint="UUID do período (opcional)"
                      error={errors.period_id?.message}
                    >
                      <Input
                        id="period_id"
                        {...register('period_id')}
                        aria-invalid={!!errors.period_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
                    <Field
                      label="ID da disciplina"
                      htmlFor="subject_id"
                      hint="UUID da disciplina (opcional)"
                      error={errors.subject_id?.message}
                    >
                      <Input
                        id="subject_id"
                        {...register('subject_id')}
                        aria-invalid={!!errors.subject_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
                    <Field
                      label="Séries/turmas-alvo"
                      htmlFor="target_grades"
                      hint="Separadas por vírgula (ex: 1º ano, 2º ano)"
                      error={errors.target_grades?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="target_grades"
                        {...register('target_grades')}
                        aria-invalid={!!errors.target_grades}
                        placeholder="1º ano, 2º ano, 3º ano"
                      />
                    </Field>
                    <Field
                      label="ID do usuário responsável"
                      htmlFor="created_by_user_id"
                      required
                      hint="UUID do usuário"
                      error={errors.created_by_user_id?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="created_by_user_id"
                        {...register('created_by_user_id')}
                        aria-invalid={!!errors.created_by_user_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
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
                {isEdit ? 'Salvar alterações' : 'Criar curso'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
