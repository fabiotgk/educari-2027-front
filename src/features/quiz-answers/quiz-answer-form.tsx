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
import {
  buildQuizAnswerPayload,
  emptyQuizAnswerForm,
  quizAnswerSchema,
  quizAnswerToForm,
  type QuizAnswerFormValues,
} from './schema';
import { useCreateQuizAnswer, useQuizAnswer, useUpdateQuizAnswer } from './hooks';

export function QuizAnswerFormPage({ answerId }: { answerId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(answerId);
  const detail = useQuizAnswer(answerId ?? '');
  const form = useForm<QuizAnswerFormValues>({
    resolver: zodResolver(quizAnswerSchema),
    defaultValues: {
      ...emptyQuizAnswerForm,
      quiz_attempt_id: searchParams.get('quiz_attempt_id') ?? '',
      lms_question_id: searchParams.get('lms_question_id') ?? '',
    },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateQuizAnswer();
  const update = useUpdateQuizAnswer();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(quizAnswerToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildQuizAnswerPayload(values);
      if (isEdit && answerId) {
        await update.mutateAsync({ id: answerId, body: payload });
        toastSuccess('Resposta atualizada com sucesso.');
        router.push(`/ava/respostas/${answerId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Resposta criada com sucesso.');
        router.push(`/ava/respostas/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/respostas/${answerId}` : '/ava/respostas';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Respostas', href: '/ava/respostas' }, { label: isEdit ? 'Editar' : 'Nova resposta' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar resposta' : 'Nova resposta'}</h1>
                <p className="text-sm text-muted-foreground">Registre resposta, correção e pontuação atribuída por questão.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Resposta</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Tentativa (UUID)" htmlFor="quiz_attempt_id" required error={errors.quiz_attempt_id?.message}>
                    <Input id="quiz_attempt_id" {...register('quiz_attempt_id')} aria-invalid={!!errors.quiz_attempt_id} />
                  </Field>
                  <Field label="Questão (UUID)" htmlFor="lms_question_id" required error={errors.lms_question_id?.message}>
                    <Input id="lms_question_id" {...register('lms_question_id')} aria-invalid={!!errors.lms_question_id} />
                  </Field>
                  <Field label="Correção" error={errors.is_correct?.message}>
                    <Controller control={control} name="is_correct" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={!!errors.is_correct}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unset">Sem correção</SelectItem>
                          <SelectItem value="true">Correta</SelectItem>
                          <SelectItem value="false">Incorreta</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </Field>
                  <Field label="Pontuação atribuída" htmlFor="score_awarded" error={errors.score_awarded?.message}>
                    <Input id="score_awarded" type="number" min={0} step="0.01" {...register('score_awarded')} aria-invalid={!!errors.score_awarded} />
                  </Field>
                  <Field label="Resposta (JSON array)" htmlFor="answer" error={errors.answer?.message} className="sm:col-span-2">
                    <Textarea id="answer" rows={8} {...register('answer')} aria-invalid={!!errors.answer} placeholder={'["Resposta do estudante"]'} />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar resposta'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
