'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
import { listResource } from '@/lib/api-client';
import type { Student } from '@/features/students/types';
import {
  ESSAY_EVALUATION_STATUS_LABELS,
} from './types';
import {
  buildEssayEvaluationPayload,
  emptyEssayEvaluationForm,
  essayEvaluationSchema,
  essayEvaluationToForm,
  type EssayEvaluationFormValues,
} from './schema';
import { useCreateEssayEvaluation, useEssayEvaluation, useUpdateEssayEvaluation } from './hooks';

export function EssayEvaluationFormPage({ resourceId }: { resourceId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(resourceId);
  const detail = useEssayEvaluation(resourceId ?? '');

  const form = useForm<EssayEvaluationFormValues>({
    resolver: zodResolver(essayEvaluationSchema),
    defaultValues: emptyEssayEvaluationForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateEssayEvaluation();
  const update = useUpdateEssayEvaluation();
  const submitting = create.isPending || update.isPending;

  const studentsQuery = useQuery({
    queryKey: ['students', 'select'],
    queryFn: () => listResource<Student>('students', { limit: 1000 }),
  });
  const students = studentsQuery.data?.data ?? [];

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(essayEvaluationToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildEssayEvaluationPayload(values);
    try {
      if (isEdit && resourceId) {
        await update.mutateAsync({ id: resourceId, body: payload });
        toastSuccess('Avaliação de redação atualizada com sucesso.');
        router.push(`/ia-redacao/${resourceId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Avaliação de redação criada com sucesso.');
        router.push(`/ia-redacao/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ia-redacao/${resourceId}` : '/ia-redacao';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'IA Redação' },
          { label: 'Avaliações', href: '/ia-redacao' },
          { label: isEdit ? 'Editar' : 'Nova avaliação' },
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
                  {isEdit ? 'Editar avaliação de redação' : 'Nova avaliação de redação'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados da avaliação de redação.'
                    : 'Crie uma nova avaliação de redação para correção pela IA.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Aluno" error={errors.student_id?.message} className="sm:col-span-2">
                      <Controller
                        control={control}
                        name="student_id"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.student_id}>
                              <SelectValue placeholder="Selecione um aluno…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhum aluno</SelectItem>
                              {students.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Tema/Prompt" htmlFor="prompt_text" required error={errors.prompt_text?.message} className="sm:col-span-2">
                      <Textarea
                        id="prompt_text"
                        rows={6}
                        {...register('prompt_text')}
                        aria-invalid={!!errors.prompt_text}
                        placeholder="Digite o tema ou prompt da redação…"
                      />
                    </Field>
                    <Field label="Texto da redação" htmlFor="essay_text" required error={errors.essay_text?.message} className="sm:col-span-2">
                      <Textarea
                        id="essay_text"
                        rows={10}
                        {...register('essay_text')}
                        aria-invalid={!!errors.essay_text}
                        placeholder="Cole o texto da redação aqui…"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Avaliação e feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Nota" htmlFor="score" error={errors.score?.message}>
                      <Input
                        id="score"
                        inputMode="decimal"
                        {...register('score')}
                        aria-invalid={!!errors.score}
                        placeholder="0,00"
                      />
                    </Field>
                    <Field label="Situação" error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ESSAY_EVALUATION_STATUS_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Competências (JSON)" htmlFor="competencies" error={errors.competencies?.message} className="sm:col-span-2">
                      <Textarea
                        id="competencies"
                        rows={6}
                        {...register('competencies')}
                        aria-invalid={!!errors.competencies}
                        placeholder='{"competencia_1": 120, "competencia_2": 80}'
                      />
                    </Field>
                    <Field label="Feedback" htmlFor="feedback" error={errors.feedback?.message} className="sm:col-span-2">
                      <Textarea
                        id="feedback"
                        rows={6}
                        {...register('feedback')}
                        aria-invalid={!!errors.feedback}
                        placeholder="Digite o feedback sobre a redação…"
                      />
                    </Field>
                    <Field label="Avaliada em" htmlFor="evaluated_at" error={errors.evaluated_at?.message}>
                      <Input
                        id="evaluated_at"
                        type="datetime-local"
                        {...register('evaluated_at')}
                        aria-invalid={!!errors.evaluated_at}
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
                {isEdit ? 'Salvar alterações' : 'Criar avaliação'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
