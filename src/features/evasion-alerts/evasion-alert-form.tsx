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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { type School } from '@/features/schools/types';
import { buildEvasionAlertPayload, evasionAlertSchema, evasionAlertToForm, emptyEvasionAlertForm, type EvasionAlertFormValues } from './schema';
import { useCreateEvasionAlert, useEvasionAlert, useUpdateEvasionAlert } from './hooks';
import { EVASION_ALERT_SCOPE_LABELS } from './types';

export function EvasionAlertFormPage({ alertId }: { alertId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(alertId);
  const detail = useEvasionAlert(alertId ?? '');
  const form = useForm<EvasionAlertFormValues>({
    resolver: zodResolver(evasionAlertSchema),
    defaultValues: emptyEvasionAlertForm,
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateEvasionAlert();
  const update = useUpdateEvasionAlert();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(evasionAlertToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildEvasionAlertPayload(values);
      if (isEdit && alertId) {
        await update.mutateAsync({ id: alertId, body: payload });
        toastSuccess('Alerta atualizado com sucesso.');
        router.push(`/evasao/alertas/${alertId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Alerta criado com sucesso.');
        router.push(`/evasao/alertas/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/evasao/alertas/${alertId}` : '/evasao/alertas';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Monitor de Evasão', href: '/evasao' },
          { label: 'Alertas', href: '/evasao/alertas' },
          { label: isEdit ? 'Editar alerta' : 'Novo alerta' },
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
                  {isEdit ? 'Editar alerta' : 'Novo alerta de evasão'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure alertas automáticos com parâmetros de frequência e faltas.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do alerta</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nome" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
                    <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
                  </Field>

                  <Field label="Escola (opcional)" htmlFor="school_id" error={errors.school_id?.message}>
                    <Controller
                      control={control}
                      name="school_id"
                      render={({ field }) => (
                        <ResourceCombobox<School>
                          value={field.value || null}
                          onChange={(itemId) => field.onChange(itemId ?? '')}
                          resource="schools"
                          searchable={false}
                          labelFn={(school) => school.name}
                          placeholder="Selecione uma escola"
                        />
                      )}
                    />
                  </Field>

                  <Field label="Escopo" required error={errors.scope?.message}>
                    <Controller
                      control={control}
                      name="scope"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.scope}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EVASION_ALERT_SCOPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <Field
                    label="Percentual mínimo de presença (%)"
                    htmlFor="min_attendance_pct"
                    error={errors.min_attendance_pct?.message}
                  >
                    <Input
                      id="min_attendance_pct"
                      type="number"
                      step={0.01}
                      min={0}
                      max={100}
                      {...register('min_attendance_pct')}
                      aria-invalid={!!errors.min_attendance_pct}
                    />
                  </Field>

                  <Field
                    label="Máximo de faltas consecutivas"
                    htmlFor="max_consecutive_absences"
                    error={errors.max_consecutive_absences?.message}
                  >
                    <Input
                      id="max_consecutive_absences"
                      type="number"
                      min={1}
                      {...register('max_consecutive_absences')}
                      aria-invalid={!!errors.max_consecutive_absences}
                    />
                  </Field>

                  <Field label="Ativo" className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                        <label className="flex h-10 items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          Alerta habilitado para disparo automático
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
                {isEdit ? 'Salvar alterações' : 'Criar alerta'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
