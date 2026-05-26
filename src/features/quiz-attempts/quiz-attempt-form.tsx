'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Student } from '@/features/students/types';
import type { LmsQuiz } from '@/features/lms-quizzes/types';
import { QUIZ_ATTEMPT_STATUS_LABELS } from './types';
import {
  buildQuizAttemptPayload,
  emptyQuizAttemptForm,
  quizAttemptSchema,
  quizAttemptToForm,
  type QuizAttemptFormValues,
} from './schema';
import { useCreateQuizAttempt, useQuizAttempt, useUpdateQuizAttempt } from './hooks';

export function QuizAttemptFormPage({ attemptId }: { attemptId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(attemptId);
  const detail = useQuizAttempt(attemptId ?? '');
  const form = useForm<QuizAttemptFormValues>({
    resolver: zodResolver(quizAttemptSchema),
    defaultValues: { ...emptyQuizAttemptForm, lms_quiz_id: searchParams.get('lms_quiz_id') ?? '' },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateQuizAttempt();
  const update = useUpdateQuizAttempt();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(quizAttemptToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildQuizAttemptPayload(values);
      if (isEdit && attemptId) {
        await update.mutateAsync({ id: attemptId, body: payload });
        toastSuccess('Tentativa atualizada com sucesso.');
        router.push(`/ava/tentativas/${attemptId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Tentativa criada com sucesso.');
        router.push(`/ava/tentativas/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/tentativas/${attemptId}` : '/ava/tentativas';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Tentativas', href: '/ava/tentativas' }, { label: isEdit ? 'Editar' : 'Nova tentativa' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar tentativa' : 'Nova tentativa'}</h1>
                <p className="text-sm text-muted-foreground">Registre execução, status, pontuação e resultado de uma avaliação.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Tentativa</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Avaliação (UUID)" htmlFor="lms_quiz_id" required error={errors.lms_quiz_id?.message}>
                      <Controller
                        control={control}
                        name="lms_quiz_id"
                        render={({ field }) => (
                          <ResourceCombobox<LmsQuiz>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="lms-quizzes"
                            labelFn={(quiz) => quiz.title}
                            placeholder="Selecione uma avaliação"
                          />
                        )}
                      />
                    </Field>
                    <Field label="Número" htmlFor="attempt_number" required error={errors.attempt_number?.message}>
                      <Input id="attempt_number" type="number" min={1} {...register('attempt_number')} aria-invalid={!!errors.attempt_number} />
                    </Field>
                    <Field label="Aluno (UUID)" htmlFor="student_id" error={errors.student_id?.message}>
                      <Controller
                        control={control}
                        name="student_id"
                        render={({ field }) => (
                          <ResourceCombobox<Student>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="students"
                            labelFn={(student) => student.full_name}
                            placeholder="Selecione um aluno"
                          />
                        )}
                      />
                    </Field>
                  <Field label="Usuário (UUID)" htmlFor="user_id" error={errors.user_id?.message}>
                    <Input id="user_id" {...register('user_id')} aria-invalid={!!errors.user_id} />
                  </Field>
                  <Field label="Status" required error={errors.status?.message}>
                    <Controller control={control} name="status" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={!!errors.status}><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(QUIZ_ATTEMPT_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  </Field>
                  <Field label="Resultado" error={errors.passed?.message}>
                    <Controller control={control} name="passed" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={!!errors.passed}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unset">Não avaliada</SelectItem>
                          <SelectItem value="true">Aprovada</SelectItem>
                          <SelectItem value="false">Reprovada</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </Field>
                  <Field label="Pontuação" htmlFor="score" error={errors.score?.message}>
                    <Input id="score" type="number" min={0} step="0.01" {...register('score')} aria-invalid={!!errors.score} />
                  </Field>
                  <Field label="Início" htmlFor="started_at" error={errors.started_at?.message}>
                    <Input id="started_at" type="datetime-local" {...register('started_at')} aria-invalid={!!errors.started_at} />
                  </Field>
                  <Field label="Envio" htmlFor="submitted_at" error={errors.submitted_at?.message}>
                    <Input id="submitted_at" type="datetime-local" {...register('submitted_at')} aria-invalid={!!errors.submitted_at} />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar tentativa'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
