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
import { STATE_MEAL_PROGRAM_STATUS_LABELS } from './types';
import {
  buildStateMealProgramPayload,
  emptyStateMealProgramForm,
  stateMealProgramSchema,
  stateMealProgramToForm,
  type StateMealProgramFormValues,
} from './schema';
import { useCreateStateMealProgram, useStateMealProgram, useUpdateStateMealProgram } from './hooks';

export function StateMealProgramFormPage({ resourceId }: { resourceId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(resourceId);
  const detail = useStateMealProgram(resourceId ?? '');

  const form = useForm<StateMealProgramFormValues>({
    resolver: zodResolver(stateMealProgramSchema),
    defaultValues: emptyStateMealProgramForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateStateMealProgram();
  const update = useUpdateStateMealProgram();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(stateMealProgramToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildStateMealProgramPayload(values);
    try {
      if (isEdit && resourceId) {
        await update.mutateAsync({ id: resourceId, body: payload });
        toastSuccess('Programa atualizado com sucesso.');
        router.push(`/pnae-estadual/${resourceId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Programa criado com sucesso.');
        router.push(`/pnae-estadual/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/pnae-estadual/${resourceId}` : '/pnae-estadual';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'PNAE Estadual' },
          { label: 'Programas', href: '/pnae-estadual' },
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
                  {isEdit ? 'Editar programa' : 'Novo programa'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do programa estadual de alimentação escolar.'
                    : 'Cadastre um novo programa estadual de alimentação escolar.'}
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
                    <Field label="Nome do programa" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
                      <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
                    </Field>
                    <Field label="Número do convênio" htmlFor="agreement_number" error={errors.agreement_number?.message}>
                      <Input id="agreement_number" {...register('agreement_number')} aria-invalid={!!errors.agreement_number} />
                    </Field>
                    <Field label="Ano fiscal" htmlFor="fiscal_year" required error={errors.fiscal_year?.message}>
                      <Input id="fiscal_year" type="number" inputMode="numeric" {...register('fiscal_year')} aria-invalid={!!errors.fiscal_year} />
                    </Field>
                    <Field label="Status" required error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATE_MEAL_PROGRAM_STATUS_LABELS).map(([v, label]) => (
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
                    <CardTitle className="text-base">Financiamento</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Valor total" htmlFor="total_value" error={errors.total_value?.message}>
                      <Input
                        id="total_value"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        {...register('total_value')}
                        aria-invalid={!!errors.total_value}
                        placeholder="0,00"
                      />
                    </Field>
                    <Field label="Fonte de financiamento" htmlFor="funding_source" error={errors.funding_source?.message}>
                      <Input id="funding_source" {...register('funding_source')} aria-invalid={!!errors.funding_source} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field label="Observações" htmlFor="notes" error={errors.notes?.message}>
                      <Textarea id="notes" rows={6} {...register('notes')} aria-invalid={!!errors.notes} />
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
