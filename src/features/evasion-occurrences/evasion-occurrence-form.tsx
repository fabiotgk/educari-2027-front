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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  EVASION_OCCURRENCE_ASSIGNED_TO_LABELS,
  EVASION_OCCURRENCE_KIND_LABELS,
  EVASION_OCCURRENCE_STATUS_LABELS,
} from './types';
import {
  buildEvasionOccurrencePayload,
  evasionOccurrenceSchema,
  evasionOccurrenceToForm,
  emptyEvasionOccurrenceForm,
  type EvasionOccurrenceFormValues,
} from './schema';
import { useCreateEvasionOccurrence, useEvasionOccurrence, useUpdateEvasionOccurrence } from './hooks';

interface EnrollmentSummary {
  id: string;
  code?: string | null;
  student?: { full_name?: string | null; name?: string | null };
  class?: { name?: string | null };
}

export function EvasionOccurrenceFormPage({
  occurrenceId,
}: {
  occurrenceId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(occurrenceId);
  const detail = useEvasionOccurrence(occurrenceId ?? '');
  const form = useForm<EvasionOccurrenceFormValues>({
    resolver: zodResolver(evasionOccurrenceSchema),
    defaultValues: emptyEvasionOccurrenceForm,
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateEvasionOccurrence();
  const update = useUpdateEvasionOccurrence();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(evasionOccurrenceToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildEvasionOccurrencePayload(values);

      if (isEdit && occurrenceId) {
        await update.mutateAsync({ id: occurrenceId, body: payload });
        toastSuccess('Ocorrência atualizada com sucesso.');
        router.push(`/evasao/${occurrenceId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Ocorrência criada com sucesso.');
        router.push(`/evasao/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/evasao/${occurrenceId}` : '/evasao';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Monitor de Evasão', href: '/evasao' },
          { label: isEdit ? 'Editar ocorrência' : 'Nova ocorrência' },
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
                  {isEdit ? 'Editar ocorrência de evasão' : 'Nova ocorrência de evasão'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Registre e acompanhe ocorrências de risco de evasão por matrícula.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-80 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados da ocorrência</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Matrícula" required error={errors.enrollment_id?.message} className="sm:col-span-2">
                      <Controller
                        control={control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <ResourceCombobox<EnrollmentSummary>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="enrollments"
                            searchable={false}
                            disabled={isEdit}
                            labelFn={(item) =>
                              item.student?.full_name ??
                              item.student?.name ??
                              item.code ??
                              item.id
                            }
                            placeholder="Selecione a matrícula"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Tipo" required error={errors.kind?.message}>
                      <Controller
                        control={control}
                        name="kind"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                            <SelectTrigger aria-invalid={!!errors.kind}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EVASION_OCCURRENCE_KIND_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field label="Responsável" required error={errors.assigned_to?.message}>
                      <Controller
                        control={control}
                        name="assigned_to"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.assigned_to}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EVASION_OCCURRENCE_ASSIGNED_TO_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field label="Status" required error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EVASION_OCCURRENCE_STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field label="Frequência na detecção (%)" htmlFor="attendance_pct_at_detection" error={errors.attendance_pct_at_detection?.message}>
                      <Input
                        id="attendance_pct_at_detection"
                        type="number"
                        step={0.01}
                        min={0}
                        max={100}
                        {...register('attendance_pct_at_detection')}
                        aria-invalid={!!errors.attendance_pct_at_detection}
                        disabled={isEdit}
                      />
                    </Field>

                    <Field
                      label="Faltas consecutivas"
                      htmlFor="consecutive_absences_at_detection"
                      error={errors.consecutive_absences_at_detection?.message}
                    >
                      <Input
                        id="consecutive_absences_at_detection"
                        type="number"
                        min={0}
                        {...register('consecutive_absences_at_detection')}
                        aria-invalid={!!errors.consecutive_absences_at_detection}
                        disabled={isEdit}
                      />
                    </Field>

                    <Field label="Detectada em" htmlFor="detected_at" error={errors.detected_at?.message}>
                      <Input
                        id="detected_at"
                        type="date"
                        {...register('detected_at')}
                        aria-invalid={!!errors.detected_at}
                        disabled={isEdit}
                      />
                    </Field>

                    <Field label="Resolvida em" htmlFor="resolved_at" error={errors.resolved_at?.message}>
                      <Input
                        id="resolved_at"
                        type="date"
                        {...register('resolved_at')}
                        aria-invalid={!!errors.resolved_at}
                      />
                    </Field>

                    <Field
                      label="Motivo"
                      htmlFor="reason"
                      className="sm:col-span-2"
                      error={errors.reason?.message}
                    >
                      <Textarea
                        id="reason"
                        rows={3}
                        {...register('reason')}
                        aria-invalid={!!errors.reason}
                      />
                    </Field>

                    <Field
                      label="Observações"
                      htmlFor="notes"
                      className="sm:col-span-2"
                      error={errors.notes?.message}
                    >
                      <Textarea
                        id="notes"
                        rows={4}
                        {...register('notes')}
                        aria-invalid={!!errors.notes}
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
                {isEdit ? 'Salvar alterações' : 'Registrar ocorrência'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
