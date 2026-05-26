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
import { PDI_PLAN_STATUS_LABELS } from './types';
import {
  buildPdiPlanPayload,
  emptyPdiPlanForm,
  pdiPlanSchema,
  pdiPlanToForm,
  type PdiPlanFormValues,
} from './schema';
import { useCreatePdiPlan, usePdiPlan, useUpdatePdiPlan } from './hooks';

export function PdiPlanFormPage({ planId }: { planId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(planId);
  const detail = usePdiPlan(planId ?? '');

  const form = useForm<PdiPlanFormValues>({
    resolver: zodResolver(pdiPlanSchema),
    defaultValues: emptyPdiPlanForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreatePdiPlan();
  const update = useUpdatePdiPlan();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(pdiPlanToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildPdiPlanPayload(values);
    try {
      if (isEdit && planId) {
        await update.mutateAsync({ id: planId, body: payload });
        toastSuccess('PDI atualizado com sucesso.');
        router.push(`/aee/${planId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('PDI criado com sucesso.');
        router.push(`/aee/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/aee/${planId}` : '/aee';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Educação Especial' },
          { label: 'Planos PDI', href: '/aee' },
          { label: isEdit ? 'Editar PDI' : 'Novo PDI' },
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
                  {isEdit
                    ? 'Editar Plano de Desenvolvimento Individual'
                    : 'Novo Plano de Desenvolvimento Individual'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do PDI.'
                    : 'Cadastre um novo PDI para um estudante.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identificação do PDI</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="ID do aluno (UUID)"
                      htmlFor="student_id"
                      required
                      error={errors.student_id?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="student_id"
                        {...register('student_id')}
                        aria-invalid={!!errors.student_id}
                        placeholder="uuid do aluno"
                      />
                    </Field>
                    <Field
                      label="Ano de referência"
                      htmlFor="reference_year"
                      required
                      hint="4 dígitos"
                      error={errors.reference_year?.message}
                    >
                      <Input
                        id="reference_year"
                        inputMode="numeric"
                        maxLength={4}
                        {...register('reference_year')}
                        aria-invalid={!!errors.reference_year}
                        placeholder="2024"
                      />
                    </Field>
                    <Field label="Situação" error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PDI_PLAN_STATUS_LABELS).map(([v, label]) => (
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
                      label="ID da escola (UUID)"
                      htmlFor="school_id"
                      hint="Opcional"
                      error={errors.school_id?.message}
                    >
                      <Input
                        id="school_id"
                        {...register('school_id')}
                        aria-invalid={!!errors.school_id}
                        placeholder="uuid da escola"
                      />
                    </Field>
                    <Field
                      label="ID do responsável (UUID)"
                      htmlFor="responsible_user_id"
                      hint="Opcional"
                      error={errors.responsible_user_id?.message}
                    >
                      <Input
                        id="responsible_user_id"
                        {...register('responsible_user_id')}
                        aria-invalid={!!errors.responsible_user_id}
                        placeholder="uuid do responsável pedagógico"
                      />
                    </Field>
                    <Field
                      label="Data de início"
                      htmlFor="started_at"
                      error={errors.started_at?.message}
                    >
                      <Input
                        id="started_at"
                        type="date"
                        {...register('started_at')}
                        aria-invalid={!!errors.started_at}
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
                {isEdit ? 'Salvar alterações' : 'Criar PDI'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
