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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildLearningExpectationPayload,
  emptyLearningExpectationForm,
  learningExpectationSchema,
  learningExpectationToForm,
  type LearningExpectationFormValues,
} from './schema';
import { useCreateLearningExpectation, useLearningExpectation, useUpdateLearningExpectation } from './hooks';

export function LearningExpectationFormPage({
  learningExpectationId,
}: {
  learningExpectationId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(learningExpectationId);
  const detail = useLearningExpectation(learningExpectationId ?? '');

  const form = useForm<LearningExpectationFormValues>({
    resolver: zodResolver(learningExpectationSchema),
    defaultValues: emptyLearningExpectationForm,
  });

  const {
    control,
    register,
    formState: { errors },
  } = form;

  const create = useCreateLearningExpectation();
  const update = useUpdateLearningExpectation();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(learningExpectationToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLearningExpectationPayload(values);
      if (isEdit && learningExpectationId) {
        await update.mutateAsync({ id: learningExpectationId, body: payload });
        toastSuccess('Habilidade atualizada com sucesso.');
        router.push(`/diario/habilidades/${learningExpectationId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Habilidade criada com sucesso.');
        router.push(`/diario/habilidades/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/diario/habilidades/${learningExpectationId}` : '/diario/habilidades';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Habilidades BNCC', href: '/diario/habilidades' },
          { label: isEdit ? 'Editar habilidade' : 'Nova habilidade' },
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
                  {isEdit ? 'Editar habilidade BNCC' : 'Nova habilidade BNCC'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Catálogo de habilidades por série e componente curricular.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-80 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Código BNCC" htmlFor="bncc_code" required error={errors.bncc_code?.message}>
                      <Input
                        id="bncc_code"
                        placeholder="EF03MAI01"
                        {...register('bncc_code')}
                        aria-invalid={!!errors.bncc_code}
                      />
                    </Field>

                    <Field
                      label="Série escolar"
                      required
                      error={errors.school_grade_id?.message}
                    >
                      <Controller
                        control={control}
                        name="school_grade_id"
                        render={({ field }) => (
                          <ResourceCombobox<{ id: string; name?: string; code?: string }>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="school-grades"
                            labelFn={(item) => item.name ?? item.code ?? item.id}
                            placeholder="Selecione a série"
                          />
                        )}
                      />
                    </Field>

                    <Field
                      label="Componente curricular"
                      required
                      className="sm:col-span-2"
                      error={errors.subject_id?.message}
                    >
                      <Controller
                        control={control}
                        name="subject_id"
                        render={({ field }) => (
                          <ResourceCombobox<{ id: string; name?: string; code?: string }>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="subjects"
                            labelFn={(item) => item.name ?? item.code ?? item.id}
                            placeholder="Selecione o componente"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Ativa" className="sm:col-span-2">
                      <Controller
                        control={control}
                        name="is_active"
                        render={({ field }) => (
                          <label className="flex h-10 items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                            Marcada como ativa
                          </label>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalhamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field
                      label="Descrição"
                      htmlFor="description"
                      required
                      error={errors.description?.message}
                    >
                      <Textarea
                        id="description"
                        rows={6}
                        {...register('description')}
                        aria-invalid={!!errors.description}
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
                {isEdit ? 'Salvar alterações' : 'Criar habilidade'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
