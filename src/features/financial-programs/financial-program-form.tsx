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
import { FINANCIAL_PROGRAM_STATUS_LABELS } from './types';
import {
  buildFinancialProgramPayload,
  emptyFinancialProgramForm,
  financialProgramSchema,
  financialProgramToForm,
  type FinancialProgramFormValues,
} from './schema';
import {
  useCreateFinancialProgram,
  useFinancialProgram,
  useUpdateFinancialProgram,
} from './hooks';

export function FinancialProgramFormPage({ programId }: { programId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(programId);
  const detail = useFinancialProgram(programId ?? '');

  const form = useForm<FinancialProgramFormValues>({
    resolver: zodResolver(financialProgramSchema),
    defaultValues: emptyFinancialProgramForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateFinancialProgram();
  const update = useUpdateFinancialProgram();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(financialProgramToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildFinancialProgramPayload(values);
    try {
      if (isEdit && programId) {
        await update.mutateAsync({ id: programId, body: payload });
        toastSuccess('Programa financeiro atualizado com sucesso.');
        router.push(`/financeiro/${programId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Programa financeiro criado com sucesso.');
        router.push(`/financeiro/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/financeiro/${programId}` : '/financeiro';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Financeiro' },
          { label: 'Programas FNDE', href: '/financeiro' },
          { label: isEdit ? 'Editar' : 'Novo programa' },
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
                  {isEdit ? 'Editar programa financeiro' : 'Novo programa financeiro'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do programa FNDE.'
                    : 'Cadastre um novo programa financeiro federal.'}
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
                    <Field
                      label="Nome do programa"
                      htmlFor="name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="name"
                        {...register('name')}
                        aria-invalid={!!errors.name}
                        placeholder="Ex: PNAE 2024"
                      />
                    </Field>
                    <Field
                      label="Ano de exercício"
                      htmlFor="exercise_year"
                      required
                      hint="4 dígitos"
                      error={errors.exercise_year?.message}
                    >
                      <Input
                        id="exercise_year"
                        inputMode="numeric"
                        maxLength={4}
                        {...register('exercise_year')}
                        aria-invalid={!!errors.exercise_year}
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
                              {Object.entries(FINANCIAL_PROGRAM_STATUS_LABELS).map(
                                ([v, label]) => (
                                  <SelectItem key={v} value={v}>
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field
                      label="N.º do processo"
                      htmlFor="process_number"
                      error={errors.process_number?.message}
                    >
                      <Input
                        id="process_number"
                        {...register('process_number')}
                        aria-invalid={!!errors.process_number}
                        placeholder="23400.000000/2024-00"
                      />
                    </Field>
                    <Field
                      label="Convênio"
                      htmlFor="agreement"
                      error={errors.agreement?.message}
                    >
                      <Input
                        id="agreement"
                        {...register('agreement')}
                        aria-invalid={!!errors.agreement}
                      />
                    </Field>
                    <Field
                      label="Fonte de recurso"
                      htmlFor="funding_source"
                      error={errors.funding_source?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="funding_source"
                        {...register('funding_source')}
                        aria-invalid={!!errors.funding_source}
                        placeholder="Ex: FNDE — PNAE"
                      />
                    </Field>
                    <Field
                      label="ID da escola (UUID)"
                      htmlFor="school_id"
                      hint="Opcional"
                      error={errors.school_id?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="school_id"
                        {...register('school_id')}
                        aria-invalid={!!errors.school_id}
                        placeholder="uuid da escola vinculada"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Datas do programa</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Data de abertura"
                      htmlFor="opened_at"
                      error={errors.opened_at?.message}
                    >
                      <Input
                        id="opened_at"
                        type="date"
                        {...register('opened_at')}
                        aria-invalid={!!errors.opened_at}
                      />
                    </Field>
                    <Field
                      label="Data de encerramento"
                      htmlFor="closed_at"
                      error={errors.closed_at?.message}
                    >
                      <Input
                        id="closed_at"
                        type="date"
                        {...register('closed_at')}
                        aria-invalid={!!errors.closed_at}
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
                {isEdit ? 'Salvar alterações' : 'Criar programa'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
