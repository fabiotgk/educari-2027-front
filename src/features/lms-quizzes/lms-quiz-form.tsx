'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildLmsQuizPayload,
  emptyLmsQuizForm,
  lmsQuizSchema,
  lmsQuizToForm,
  type LmsQuizFormValues,
} from './schema';
import { useCreateLmsQuiz, useLmsQuiz, useUpdateLmsQuiz } from './hooks';

export function LmsQuizFormPage({ quizId }: { quizId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(quizId);
  const detail = useLmsQuiz(quizId ?? '');
  const form = useForm<LmsQuizFormValues>({
    resolver: zodResolver(lmsQuizSchema),
    defaultValues: emptyLmsQuizForm,
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateLmsQuiz();
  const update = useUpdateLmsQuiz();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(lmsQuizToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLmsQuizPayload(values);
      if (isEdit && quizId) {
        await update.mutateAsync({ id: quizId, body: payload });
        toastSuccess('Avaliação atualizada com sucesso.');
        router.push(`/ava/avaliacoes/${quizId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Avaliação criada com sucesso.');
        router.push(`/ava/avaliacoes/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/avaliacoes/${quizId}` : '/ava/avaliacoes';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Avaliações', href: '/ava/avaliacoes' }, { label: isEdit ? 'Editar' : 'Nova avaliação' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar avaliação' : 'Nova avaliação'}</h1>
                <p className="text-sm text-muted-foreground">Configure questionário, nota de corte, tentativas e publicação no AVA.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Título" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                      <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                    </Field>
                    <Field label="Curso (UUID)" htmlFor="course_id" error={errors.course_id?.message}>
                      <Input id="course_id" {...register('course_id')} aria-invalid={!!errors.course_id} />
                    </Field>
                    <Field label="Aula (UUID)" htmlFor="lesson_id" error={errors.lesson_id?.message}>
                      <Input id="lesson_id" {...register('lesson_id')} aria-invalid={!!errors.lesson_id} />
                    </Field>
                    <Field label="Descrição" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
                      <Textarea id="description" rows={5} {...register('description')} aria-invalid={!!errors.description} />
                    </Field>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Regras da avaliação</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Nota de corte (%)" htmlFor="passing_score" required error={errors.passing_score?.message}>
                      <Input id="passing_score" type="number" min={0} max={100} step="0.01" {...register('passing_score')} aria-invalid={!!errors.passing_score} />
                    </Field>
                    <Field label="Máximo de tentativas" htmlFor="max_attempts" required error={errors.max_attempts?.message}>
                      <Input id="max_attempts" type="number" min={1} {...register('max_attempts')} aria-invalid={!!errors.max_attempts} />
                    </Field>
                    <Field label="Tempo limite (min)" htmlFor="time_limit_minutes" error={errors.time_limit_minutes?.message}>
                      <Input id="time_limit_minutes" type="number" min={1} {...register('time_limit_minutes')} aria-invalid={!!errors.time_limit_minutes} />
                    </Field>
                    <Field label="Opções">
                      <div className="flex flex-wrap gap-6 pt-2">
                        <Controller control={control} name="shuffle_questions" render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} /> Embaralhar questões</label>
                        )} />
                        <Controller control={control} name="is_published" render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} /> Publicada</label>
                        )} />
                      </div>
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar avaliação'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
