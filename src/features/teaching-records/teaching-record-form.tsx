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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import type { ClassDiary } from '@/features/class-diaries/types';
import type { TeachingRecord } from './types';
import { buildTeachingRecordPayload, emptyTeachingRecordForm, teachingRecordSchema, teachingRecordToForm, type TeachingRecordFormValues } from './schema';
import { useCreateTeachingRecord, useTeachingRecord, useUpdateTeachingRecord } from './hooks';

export function TeachingRecordFormPage({
  teachingRecordId,
  classDiaryId,
}: {
  teachingRecordId?: string;
  classDiaryId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(teachingRecordId);
  const detail = useTeachingRecord(teachingRecordId ?? '');

  const form = useForm<TeachingRecordFormValues>({
    resolver: zodResolver(teachingRecordSchema),
    defaultValues: {
      ...emptyTeachingRecordForm,
      class_diary_id: classDiaryId ?? '',
    },
  });

  const { control, register, watch, formState: { errors } } = form;
  const create = useCreateTeachingRecord();
  const update = useUpdateTeachingRecord();
  const isSubstituted = watch('is_substituted');
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(teachingRecordToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildTeachingRecordPayload(values);
      if (isEdit && teachingRecordId) {
        await update.mutateAsync({ id: teachingRecordId, body: payload });
        toastSuccess('Registro de aula atualizado com sucesso.');
        router.push(`/diario/registros/${teachingRecordId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Registro de aula criado com sucesso.');
        router.push(`/diario/registros/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/diario/registros/${teachingRecordId}` : '/diario/registros';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: 'Registros de aula', href: '/diario/registros' },
          { label: isEdit ? 'Editar registro' : 'Novo registro' },
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
                  {isEdit ? 'Editar registro de aula' : 'Novo registro de aula'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Registre o conteúdo ministrado com vínculo ao diário da turma.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vínculo</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Diário" required error={errors.class_diary_id?.message}>
                      <Controller
                        control={control}
                        name="class_diary_id"
                        render={({ field }) => (
                          <ResourceCombobox<ClassDiary>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="class-diaries"
                            labelFn={(item) => `${item.academic_year} · ${item.class_id}`}
                            placeholder="Selecione um diário"
                          />
                        )}
                      />
                    </Field>

                    <Field label="Data da aula" required error={errors.lesson_date?.message}>
                      <Input type="date" {...register('lesson_date')} aria-invalid={!!errors.lesson_date} />
                    </Field>

                    <Field label="Aula no dia" required error={errors.lesson_number_in_day?.message}>
                      <Input
                        type="number"
                        min={1}
                        {...register('lesson_number_in_day')}
                        aria-invalid={!!errors.lesson_number_in_day}
                      />
                    </Field>

                    <Field label="Substituição" className="sm:col-span-2">
                      <Controller
                        control={control}
                        name="is_substituted"
                        render={({ field }) => (
                          <label className="flex h-10 items-center gap-2 text-sm">
                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            Aula foi ministrada em substituição
                          </label>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Conteúdo ministrado" required error={errors.content_taught?.message} className="sm:col-span-2">
                      <Textarea rows={6} {...register('content_taught')} aria-invalid={!!errors.content_taught} />
                    </Field>

                    <Field label="Metodologia" error={errors.methodology?.message} className="sm:col-span-2">
                      <Textarea rows={4} {...register('methodology')} aria-invalid={!!errors.methodology} />
                    </Field>

                    <Field label="Observações" error={errors.observations?.message} className="sm:col-span-2">
                      <Textarea rows={4} {...register('observations')} aria-invalid={!!errors.observations} />
                    </Field>

                    <Field
                      label="Habilidades esperadas (um item por linha)"
                      error={errors.learning_expectations?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea rows={4} {...register('learning_expectations')} aria-invalid={!!errors.learning_expectations} />
                    </Field>
                  </CardContent>
                </Card>

                {isSubstituted ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Registro substituído</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Field label="Substitui o registro" required={isSubstituted} error={errors.substituted_for_record_id?.message}>
                        <Controller
                          control={control}
                          name="substituted_for_record_id"
                          render={({ field }) => (
                            <ResourceCombobox<TeachingRecord>
                              value={field.value || null}
                              onChange={(itemId) => field.onChange(itemId ?? '')}
                              resource="teaching-records"
                              labelFn={(item) => `${item.lesson_date} · Aula ${item.lesson_number_in_day}`}
                              placeholder="Selecione o registro"
                            />
                          )}
                        />
                      </Field>
                    </CardContent>
                  </Card>
                ) : null}
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
