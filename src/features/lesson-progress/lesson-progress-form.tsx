'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { LESSON_PROGRESS_STATUS_LABELS } from './types';
import {
  buildLessonProgressPayload,
  emptyLessonProgressForm,
  lessonProgressSchema,
  lessonProgressToForm,
  type LessonProgressFormValues,
} from './schema';
import { useCreateLessonProgress, useLessonProgress, useUpdateLessonProgress } from './hooks';

export function LessonProgressFormPage({ lessonProgressId, courseEnrollmentId }: { lessonProgressId?: string; courseEnrollmentId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(lessonProgressId);
  const detail = useLessonProgress(lessonProgressId ?? '');
  const form = useForm<LessonProgressFormValues>({
    resolver: zodResolver(lessonProgressSchema),
    defaultValues: { ...emptyLessonProgressForm, course_enrollment_id: courseEnrollmentId ?? '' },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateLessonProgress();
  const update = useUpdateLessonProgress();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(lessonProgressToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLessonProgressPayload(values);
      if (isEdit && lessonProgressId) {
        await update.mutateAsync({ id: lessonProgressId, body: payload });
        toastSuccess('Progresso atualizado com sucesso.');
        router.push(`/ava/progresso/${lessonProgressId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Progresso criado com sucesso.');
        router.push(`/ava/progresso/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/progresso/${lessonProgressId}` : courseEnrollmentId ? `/ava/matriculas/${courseEnrollmentId}` : '/ava/progresso';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Progresso', href: '/ava/progresso' }, { label: isEdit ? 'Editar' : 'Novo progresso' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar progresso' : 'Novo progresso de aula'}</h1>
                <p className="text-sm text-muted-foreground">Registre o andamento de uma aula dentro da matrícula do curso.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-72 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Progresso</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Matrícula do curso (UUID)" htmlFor="course_enrollment_id" required error={errors.course_enrollment_id?.message}>
                    <Input id="course_enrollment_id" {...register('course_enrollment_id')} aria-invalid={!!errors.course_enrollment_id} />
                  </Field>
                  <Field label="Aula (UUID)" htmlFor="lesson_id" required error={errors.lesson_id?.message}>
                    <Input id="lesson_id" {...register('lesson_id')} aria-invalid={!!errors.lesson_id} />
                  </Field>
                  <Field label="Situação" required error={errors.status?.message}>
                    <Controller control={control} name="status" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={!!errors.status}><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(LESSON_PROGRESS_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  </Field>
                  <Field label="Progresso (%)" htmlFor="progress_percent" error={errors.progress_percent?.message}>
                    <Input id="progress_percent" type="number" min={0} max={100} step="0.01" {...register('progress_percent')} aria-invalid={!!errors.progress_percent} />
                  </Field>
                  <Field label="Tempo gasto (segundos)" htmlFor="time_spent_seconds" error={errors.time_spent_seconds?.message}>
                    <Input id="time_spent_seconds" type="number" min={0} step={1} {...register('time_spent_seconds')} aria-invalid={!!errors.time_spent_seconds} />
                  </Field>
                  <Field label="Concluído em" htmlFor="completed_at" error={errors.completed_at?.message}>
                    <Input id="completed_at" type="datetime-local" {...register('completed_at')} aria-invalid={!!errors.completed_at} />
                  </Field>
                  <Field label="Último acesso em" htmlFor="last_accessed_at" error={errors.last_accessed_at?.message}>
                    <Input id="last_accessed_at" type="datetime-local" {...register('last_accessed_at')} aria-invalid={!!errors.last_accessed_at} />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background"><div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
            <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
            <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar progresso'}</Button>
          </div></div>
        </form>
      </main>
    </>
  );
}
