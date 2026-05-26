'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
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
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/form/field';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { ATTENDANCE_RECORDED_VIA_LABELS, ATTENDANCE_STATUS_LABELS, type AttendanceStatus, type AttendanceRecord } from './types';
import {
  attendanceRecordSchema,
  attendanceRecordToForm,
  buildAttendanceRecordPayload,
  emptyAttendanceRecordForm,
  type AttendanceRecordFormValues,
} from './schema';
import { useAttendanceRecord, useCreateAttendanceRecord, useUpdateAttendanceRecord } from './hooks';

interface AttendanceRecordFormPageProps {
  recordId?: string;
}

export function AttendanceRecordFormPage({ recordId }: AttendanceRecordFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(recordId);

  const detail = useAttendanceRecord(recordId ?? '');
  const form = useForm<AttendanceRecordFormValues>({
    resolver: zodResolver(attendanceRecordSchema),
    defaultValues: emptyAttendanceRecordForm,
  });

  const { control, register, formState: { errors } } = form;
  const create = useCreateAttendanceRecord();
  const update = useUpdateAttendanceRecord();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(attendanceRecordToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildAttendanceRecordPayload(values);

    try {
      if (isEdit && recordId) {
        await update.mutateAsync({ id: recordId, body: payload });
        toastSuccess('Registro de frequência atualizado.');
        router.push(`/frequencia/${recordId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Registro de frequência criado.');
        router.push(`/frequencia/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/frequencia/${recordId}` : '/frequencia';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Frequência', href: '/frequencia' },
          { label: 'Registros', href: '/frequencia' },
          { label: isEdit ? 'Editar' : 'Novo registro' },
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
                  {isEdit ? 'Editar registro de frequência' : 'Novo registro de frequência'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Informe os dados do lançamento de presença/falta.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identificação do registro</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Matrícula" required error={errors.enrollment_id?.message}>
                      <Controller
                        control={control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <ResourceCombobox
                            value={field.value ?? null}
                            onChange={(value) => field.onChange(value ?? '')}
                            resource="enrollments"
                            searchable={false}
                            labelFn={(item) => {
                              const it = item as { student_name?: string; class_name?: string; id: string };
                              return it.student_name
                                ? `${it.student_name} · ${it.class_name ?? ''}`.trim()
                                : it.id;
                            }}
                            placeholder="Selecione a matrícula"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Diário de classe" error={errors.class_diary_id?.message}>
                      <Controller
                        control={control}
                        name="class_diary_id"
                        render={({ field }) => (
                          <ResourceCombobox
                            value={field.value ?? null}
                            onChange={(value) => field.onChange(value ?? '')}
                            resource="class-diaries"
                            searchable
                            labelFn={(item) => ((item as { name?: string; id: string }).name ?? item.id)}
                            placeholder="Selecione o diário"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Data da aula" required error={errors.lesson_date?.message}>
                      <Input
                        type="date"
                        {...register('lesson_date')}
                        aria-invalid={!!errors.lesson_date}
                      />
                    </Field>

                    <Field
                      label="Nº da aula"
                      htmlFor="lesson_number_in_day"
                      error={errors.lesson_number_in_day?.message}
                    >
                      <Input
                        id="lesson_number_in_day"
                        type="number"
                        min={1}
                        max={10}
                        {...register('lesson_number_in_day')}
                        aria-invalid={!!errors.lesson_number_in_day}
                        placeholder="1 a 10"
                      />
                    </Field>

                    <Field label="Status" required error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ATTENDANCE_STATUS_LABELS).map(([status, label]) => (
                                <SelectItem key={status} value={status}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field label="Justificativa" error={errors.absence_reason_id?.message}>
                      <Controller
                        control={control}
                        name="absence_reason_id"
                        render={({ field }) => (
                          <ResourceCombobox
                            value={field.value ?? null}
                            onChange={(value) => field.onChange(value ?? '')}
                            resource="absence-reasons"
                            searchable
                            labelFn={(item) => (item as { code?: string; name?: string; id: string }).name ?? item.id}
                            placeholder="Selecione a justificativa"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Canal de registro" error={errors.recorded_via?.message}>
                      <Controller
                        control={control}
                        name="recorded_via"
                        render={({ field }) => (
                          <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.recorded_via}>
                              <SelectValue placeholder="Selecione o canal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não informado</SelectItem>
                              {Object.entries(ATTENDANCE_RECORDED_VIA_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field label="Responsável pelo registro" required error={errors.recorded_by_user_id?.message}>
                      <Controller
                        control={control}
                        name="recorded_by_user_id"
                        render={({ field }) => (
                          <ResourceCombobox
                            value={field.value ?? null}
                            onChange={(value) => field.onChange(value ?? '')}
                            resource="users"
                            searchable
                            labelFn={(item) => (item as { name?: string; email?: string; id: string }).name ?? (item as { email?: string; id: string }).email ?? item.id}
                            placeholder="Selecione o responsável"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Observações" htmlFor="notes" className="sm:col-span-2" error={errors.notes?.message}>
                      <Textarea
                        id="notes"
                        rows={4}
                        {...register('notes')}
                        aria-invalid={!!errors.notes}
                        placeholder="Descrição opcional sobre o registro"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Opções avançadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field label="Marcar ausência justificada sem mudança de status" hint="Use apenas se o status for Justificada." error={errors.absence_reason_id?.message}>
                      <Controller
                        control={control}
                        name="absence_reason_id"
                        render={({ field }) => (
                          <Checkbox
                            checked={Boolean(field.value)}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                field.onChange('');
                              }
                            }}
                          />
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
                {isEdit ? 'Salvar alterações' : 'Criar registro'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
