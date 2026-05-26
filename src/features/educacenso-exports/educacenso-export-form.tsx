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
import { EDUCACENSO_STAGE_LABELS, EDUCACENSO_STATUS_LABELS } from './types';
import {
  buildEducacensoExportPayload,
  educacensoExportSchema,
  educacensoExportToForm,
  emptyEducacensoExportForm,
  type EducacensoExportFormValues,
} from './schema';
import {
  useCreateEducacensoExport,
  useEducacensoExport,
  useUpdateEducacensoExport,
} from './hooks';

export function EducacensoExportFormPage({ exportId }: { exportId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(exportId);
  const detail = useEducacensoExport(exportId ?? '');

  const form = useForm<EducacensoExportFormValues>({
    resolver: zodResolver(educacensoExportSchema),
    defaultValues: emptyEducacensoExportForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateEducacensoExport();
  const update = useUpdateEducacensoExport();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(educacensoExportToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildEducacensoExportPayload(values);
    try {
      if (isEdit && exportId) {
        await update.mutateAsync({ id: exportId, body: payload });
        toastSuccess('Exportação atualizada com sucesso.');
        router.push(`/educacenso/${exportId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Exportação criada com sucesso.');
        router.push(`/educacenso/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/educacenso/${exportId}` : '/educacenso';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Educacenso', href: '/educacenso' },
          { label: isEdit ? 'Editar exportação' : 'Nova exportação' },
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
                  {isEdit ? 'Editar exportação Educacenso' : 'Nova exportação Educacenso'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os parâmetros da exportação Educacenso.'
                    : 'Configure uma nova exportação de dados ao Educacenso/INEP.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Parâmetros da exportação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Ano de referência"
                      htmlFor="reference_year"
                      required
                      error={errors.reference_year?.message}
                    >
                      <Input
                        id="reference_year"
                        inputMode="numeric"
                        maxLength={4}
                        {...register('reference_year')}
                        aria-invalid={!!errors.reference_year}
                        placeholder="2025"
                      />
                    </Field>
                    <Field
                      label="Etapa"
                      required
                      error={errors.stage?.message}
                    >
                      <Controller
                        control={control}
                        name="stage"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.stage}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EDUCACENSO_STAGE_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    {isEdit && (
                      <Field
                        label="Situação"
                        error={errors.status?.message}
                      >
                        <Controller
                          control={control}
                          name="status"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger aria-invalid={!!errors.status}>
                                <SelectValue placeholder="Selecione…" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(EDUCACENSO_STATUS_LABELS).map(([v, label]) => (
                                  <SelectItem key={v} value={v}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>
                    )}
                    <Field
                      label="IDs das escolas"
                      htmlFor="school_ids"
                      hint="UUIDs separados por vírgula (deixe vazio para todas as escolas)"
                      error={errors.school_ids?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="school_ids"
                        {...register('school_ids')}
                        aria-invalid={!!errors.school_ids}
                        placeholder="uuid1, uuid2, uuid3…"
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
                {isEdit ? 'Salvar alterações' : 'Criar exportação'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
