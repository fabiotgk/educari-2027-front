'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  absenceReasonSchema,
  absenceReasonToForm,
  buildAbsenceReasonPayload,
  emptyAbsenceReasonForm,
  type AbsenceReasonFormValues,
} from './schema';
import { useAbsenceReason, useCreateAbsenceReason, useUpdateAbsenceReason } from './hooks';

interface AbsenceReasonFormPageProps {
  reasonId?: string;
}

export function AbsenceReasonFormPage({ reasonId }: AbsenceReasonFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(reasonId);

  const detail = useAbsenceReason(reasonId ?? '');
  const form = useForm<AbsenceReasonFormValues>({
    resolver: zodResolver(absenceReasonSchema),
    defaultValues: emptyAbsenceReasonForm,
  });

  const { control, register, formState: { errors } } = form;
  const create = useCreateAbsenceReason();
  const update = useUpdateAbsenceReason();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(absenceReasonToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildAbsenceReasonPayload(values);
    try {
      if (isEdit && reasonId) {
        await update.mutateAsync({ id: reasonId, body: payload });
        toastSuccess('Motivo de falta atualizado.');
        router.push(`/frequencia/motivos/${reasonId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Motivo de falta criado.');
        router.push(`/frequencia/motivos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/frequencia/motivos/${reasonId}` : '/frequencia/motivos';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Frequência', href: '/frequencia' },
          { label: 'Motivos de Falta', href: '/frequencia/motivos' },
          { label: isEdit ? 'Editar' : 'Novo motivo' },
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
                  {isEdit ? 'Editar motivo de falta' : 'Novo motivo de falta'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Cadastre um código e nome para a situação de ausência.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do motivo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Código" required htmlFor="code" error={errors.code?.message}>
                    <Input
                      id="code"
                      {...register('code')}
                      aria-invalid={!!errors.code}
                      placeholder="Ex: FAL001"
                    />
                  </Field>
                  <Field
                    label="Nome do motivo"
                    required
                    htmlFor="name"
                    className="sm:col-span-2"
                    error={errors.name?.message}
                  >
                    <Input
                      id="name"
                      {...register('name')}
                      aria-invalid={!!errors.name}
                      placeholder="Ex: Atestado médico"
                    />
                  </Field>

                  <Field label="Considerar como falta justificada">
                    <Controller
                      control={control}
                      name="is_justified"
                      render={({ field }) => (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          O registro será tratado como ausência justificada.
                        </label>
                      )}
                    />
                  </Field>

                  <Field label="Exigir documento">
                    <Controller
                      control={control}
                      name="requires_document"
                      render={({ field }) => (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                          Exigir anexo antes da baixa.
                        </label>
                      )}
                    />
                  </Field>

                  <Field label="Ativo">
                    <Controller
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          Disponibilizar este motivo para uso no lançamento.
                        </label>
                      )}
                    />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar motivo'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
