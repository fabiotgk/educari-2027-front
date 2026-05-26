'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Field } from '@/components/form/field';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import type { EvaluationPeriod } from './types';
import {
  buildEvaluationPeriodPayload,
  emptyEvaluationPeriodForm,
  evaluationPeriodSchema,
  evaluationPeriodToForm,
  type EvaluationPeriodFormValues,
} from './schema';
import { useCreateEvaluationPeriod, useEvaluationPeriod, useUpdateEvaluationPeriod } from './hooks';

export function EvaluationPeriodFormPage({
  evaluationPeriodId,
}: {
  evaluationPeriodId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(evaluationPeriodId);
  const detail = useEvaluationPeriod(evaluationPeriodId ?? '');

  const form = useForm<EvaluationPeriodFormValues>({
    resolver: zodResolver(evaluationPeriodSchema),
    defaultValues: {
      ...emptyEvaluationPeriodForm,
      school_id: '',
    },
  });

  const {
    control,
    register,
    formState: { errors },
  } = form;
  const create = useCreateEvaluationPeriod();
  const update = useUpdateEvaluationPeriod();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(evaluationPeriodToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildEvaluationPeriodPayload(values);
      if (isEdit && evaluationPeriodId) {
        await update.mutateAsync({ id: evaluationPeriodId, body: payload });
        toastSuccess('Período atualizado com sucesso.');
        router.push(`/diario/periodos/${evaluationPeriodId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Período criado com sucesso.');
        router.push(`/diario/periodos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/diario/periodos/${evaluationPeriodId}` : '/diario/periodos';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Períodos avaliativos', href: '/diario/periodos' },
          { label: isEdit ? 'Editar período' : 'Novo período' },
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
                  {isEdit ? 'Editar período avaliativo' : 'Novo período avaliativo'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Registre os períodos avaliativos da escola (BNCC, bimestre, trimestre, etc.).
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-80 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contexto</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Escola" htmlFor="school_id" error={errors.school_id?.message}>
                      <Controller
                        control={control}
                        name="school_id"
                        render={({ field }) => (
                          <ResourceCombobox<{ id: string; name?: string; code?: string }>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="schools"
                            labelFn={(item) => item.name ?? item.code ?? item.id}
                            placeholder="Selecione uma escola (opcional)"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Ano letivo" htmlFor="academic_year" required error={errors.academic_year?.message}>
                      <Input
                        id="academic_year"
                        inputMode="numeric"
                        maxLength={4}
                        {...register('academic_year')}
                        aria-invalid={!!errors.academic_year}
                      />
                    </Field>

                    <Field label="Código" htmlFor="code" required error={errors.code?.message} className="sm:col-span-2">
                      <Input id="code" {...register('code')} aria-invalid={!!errors.code} />
                    </Field>

                    <Field label="Nome" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
                      <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cronograma</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Ordem" htmlFor="order" required error={errors.order?.message}>
                      <Input id="order" type="number" min={1} {...register('order')} aria-invalid={!!errors.order} />
                    </Field>

                    <Field label="Data de início" htmlFor="starts_at" required error={errors.starts_at?.message}>
                      <Input id="starts_at" type="date" {...register('starts_at')} aria-invalid={!!errors.starts_at} />
                    </Field>

                    <Field label="Data de término" htmlFor="ends_at" required error={errors.ends_at?.message}>
                      <Input id="ends_at" type="date" {...register('ends_at')} aria-invalid={!!errors.ends_at} />
                    </Field>

                    <Field
                      label="Data de fechamento"
                      htmlFor="closing_date"
                      error={errors.closing_date?.message}
                    >
                      <Input
                        id="closing_date"
                        type="date"
                        {...register('closing_date')}
                        aria-invalid={!!errors.closing_date}
                      />
                    </Field>

                    <Field label="Período encerrado" className="sm:col-span-2">
                      <Controller
                        control={control}
                        name="is_closed"
                        render={({ field }) => (
                          <label className="flex h-10 items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            />
                            Marcar período como encerrado
                          </label>
                        )}
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
                {isEdit ? 'Salvar alterações' : 'Criar período'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

