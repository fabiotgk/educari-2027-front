'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { LMS_QUESTION_TYPE_LABELS } from './types';
import {
  buildLmsQuestionPayload,
  emptyLmsQuestionForm,
  lmsQuestionSchema,
  lmsQuestionToForm,
  type LmsQuestionFormValues,
} from './schema';
import { useCreateLmsQuestion, useLmsQuestion, useUpdateLmsQuestion } from './hooks';

export function LmsQuestionFormPage({ questionId }: { questionId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(questionId);
  const detail = useLmsQuestion(questionId ?? '');
  const form = useForm<LmsQuestionFormValues>({
    resolver: zodResolver(lmsQuestionSchema),
    defaultValues: { ...emptyLmsQuestionForm, lms_quiz_id: searchParams.get('lms_quiz_id') ?? '' },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateLmsQuestion();
  const update = useUpdateLmsQuestion();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(lmsQuestionToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLmsQuestionPayload(values);
      if (isEdit && questionId) {
        await update.mutateAsync({ id: questionId, body: payload });
        toastSuccess('Questão atualizada com sucesso.');
        router.push(`/ava/questoes/${questionId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Questão criada com sucesso.');
        router.push(`/ava/questoes/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/questoes/${questionId}` : '/ava/questoes';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Questões', href: '/ava/questoes' }, { label: isEdit ? 'Editar' : 'Nova questão' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar questão' : 'Nova questão'}</h1>
                <p className="text-sm text-muted-foreground">Cadastre enunciado, alternativas, resposta esperada e pontuação.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Questão</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Avaliação (UUID)" htmlFor="lms_quiz_id" required error={errors.lms_quiz_id?.message}>
                      <Input id="lms_quiz_id" {...register('lms_quiz_id')} aria-invalid={!!errors.lms_quiz_id} />
                    </Field>
                    <Field label="Tipo" required error={errors.type?.message}>
                      <Controller control={control} name="type" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.type}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(LMS_QUESTION_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field label="Pontuação" htmlFor="score" required error={errors.score?.message}>
                      <Input id="score" type="number" min={0} step="0.01" {...register('score')} aria-invalid={!!errors.score} />
                    </Field>
                    <Field label="Ordem" htmlFor="position" required error={errors.position?.message}>
                      <Input id="position" type="number" min={0} {...register('position')} aria-invalid={!!errors.position} />
                    </Field>
                    <Field label="Enunciado" htmlFor="statement" required error={errors.statement?.message} className="sm:col-span-2">
                      <Textarea id="statement" rows={5} {...register('statement')} aria-invalid={!!errors.statement} />
                    </Field>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Resposta e feedback</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Opções (JSON array)" htmlFor="options" error={errors.options?.message}>
                      <Textarea id="options" rows={7} {...register('options')} aria-invalid={!!errors.options} placeholder={'["Alternativa A", "Alternativa B"]'} />
                    </Field>
                    <Field label="Resposta correta (JSON array)" htmlFor="correct_answer" error={errors.correct_answer?.message}>
                      <Textarea id="correct_answer" rows={7} {...register('correct_answer')} aria-invalid={!!errors.correct_answer} placeholder={'["Alternativa A"]'} />
                    </Field>
                    <Field label="Feedback" htmlFor="feedback" error={errors.feedback?.message} className="sm:col-span-2">
                      <Textarea id="feedback" rows={4} {...register('feedback')} aria-invalid={!!errors.feedback} />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar questão'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
