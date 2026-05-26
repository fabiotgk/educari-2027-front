'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { ResourceCombobox } from '@/components/form/resource-combobox';
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
import type { Student } from '@/features/students/types';
import {
  DIFFICULTY_LABELS,
  STATUS_LABELS,
} from './types';
import {
  buildLearningPathPayload,
  emptyLearningPathForm,
  learningPathSchema,
  learningPathToForm,
  type LearningPathFormValues,
} from './schema';
import {
  useCreateLearningPath,
  useLearningPath,
  useUpdateLearningPath,
} from './hooks';

export function LearningPathFormPage({ resourceId }: { resourceId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(resourceId);
  const detail = useLearningPath(resourceId ?? '');

  const form = useForm<LearningPathFormValues>({
    resolver: zodResolver(learningPathSchema),
    defaultValues: emptyLearningPathForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateLearningPath();
  const update = useUpdateLearningPath();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(learningPathToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildLearningPathPayload(values);
    try {
      if (isEdit && resourceId) {
        await update.mutateAsync({ id: resourceId, body: payload });
        toastSuccess('Trilha de aprendizagem atualizada com sucesso.');
        router.push(`/ia-adaptativo/${resourceId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Trilha de aprendizagem criada com sucesso.');
        router.push(`/ia-adaptativo/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ia-adaptativo/${resourceId}` : '/ia-adaptativo';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Ensino Adaptativo IA' },
          { label: 'Trilhas', href: '/ia-adaptativo' },
          { label: isEdit ? 'Editar' : 'Nova trilha' },
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
                  {isEdit ? 'Editar trilha' : 'Nova trilha de aprendizagem'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados da trilha de aprendizagem.'
                    : 'Cadastre uma nova trilha de aprendizagem adaptativa.'}
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
                    <Field label="Título da trilha" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                      <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                    </Field>
                    <Field label="Nível atual" htmlFor="current_level" error={errors.current_level?.message}>
                      <Input id="current_level" {...register('current_level')} aria-invalid={!!errors.current_level} />
                    </Field>
                    <Field label="Dificuldade" error={errors.difficulty?.message}>
                      <Controller
                        control={control}
                        name="difficulty"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.difficulty}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DIFFICULTY_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Status" error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configuração</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Aluno" error={errors.student_id?.message}>
                      <Controller
                        control={control}
                        name="student_id"
                        render={({ field }) => (
                          <ResourceCombobox<Student>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="students"
                            labelFn={(student) => student.full_name}
                            placeholder="Selecione um aluno…"
                          />
                        )}
                      />
                    </Field>
                    <Field label="Disciplina (UUID)" htmlFor="subject_id" error={errors.subject_id?.message}>
                      <Input id="subject_id" {...register('subject_id')} aria-invalid={!!errors.subject_id} placeholder="00000000-0000-0000-0000-000000000000" />
                    </Field>
                    <Field label="Progresso (%)" htmlFor="progress_pct" hint="0 a 100" error={errors.progress_pct?.message}>
                      <Input id="progress_pct" inputMode="numeric" {...register('progress_pct')} aria-invalid={!!errors.progress_pct} placeholder="0" />
                    </Field>
                    <Field label="Itens (JSON)" htmlFor="items" hint="Array JSON com os itens da trilha" error={errors.items?.message} className="sm:col-span-2">
                      <Textarea id="items" rows={6} {...register('items')} aria-invalid={!!errors.items} placeholder={`[\n  { "type": "video", "title": "Introdução" }\n]`} />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Rodapé de ações (fluxo normal — sem sticky) */}
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar trilha'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
