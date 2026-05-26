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
import { SCHOOL_KIT_STATUS_LABELS } from './types';
import {
  buildSchoolKitPayload,
  emptySchoolKitForm,
  schoolKitSchema,
  schoolKitToForm,
  type SchoolKitFormValues,
} from './schema';
import { useCreateSchoolKit, useSchoolKit, useUpdateSchoolKit } from './hooks';

export function SchoolKitFormPage({ kitId }: { kitId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(kitId);
  const detail = useSchoolKit(kitId ?? '');

  const form = useForm<SchoolKitFormValues>({
    resolver: zodResolver(schoolKitSchema),
    defaultValues: emptySchoolKitForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateSchoolKit();
  const update = useUpdateSchoolKit();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(schoolKitToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildSchoolKitPayload(values);
    try {
      if (isEdit && kitId) {
        await update.mutateAsync({ id: kitId, body: payload });
        toastSuccess('Kit atualizado com sucesso.');
        router.push(`/material/${kitId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Kit criado com sucesso.');
        router.push(`/material/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/material/${kitId}` : '/material';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Material Escolar' },
          { label: 'Kits', href: '/material' },
          { label: isEdit ? 'Editar' : 'Novo kit' },
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
                  {isEdit ? 'Editar kit escolar' : 'Novo kit escolar'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do kit de material escolar.'
                    : 'Cadastre um novo kit de material ou uniforme.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do kit</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Nome do kit"
                    htmlFor="name"
                    required
                    error={errors.name?.message}
                    className="sm:col-span-2"
                  >
                    <Input
                      id="name"
                      {...register('name')}
                      aria-invalid={!!errors.name}
                      placeholder="Ex.: Kit Uniforme EF1 2025"
                    />
                  </Field>
                  <Field
                    label="Ano letivo"
                    htmlFor="academic_year"
                    required
                    hint="4 dígitos"
                    error={errors.academic_year?.message}
                  >
                    <Input
                      id="academic_year"
                      inputMode="numeric"
                      maxLength={4}
                      {...register('academic_year')}
                      aria-invalid={!!errors.academic_year}
                      placeholder="2025"
                    />
                  </Field>
                  <Field label="Etapa de ensino" htmlFor="target_stage" error={errors.target_stage?.message}>
                    <Input
                      id="target_stage"
                      {...register('target_stage')}
                      aria-invalid={!!errors.target_stage}
                      placeholder="Ex.: EF1, EF2, EM…"
                    />
                  </Field>
                  <Field label="Situação" required error={errors.status?.message}>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.status}>
                            <SelectValue placeholder="Selecione…" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SCHOOL_KIT_STATUS_LABELS).map(([v, label]) => (
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
                    label="Descrição"
                    htmlFor="description"
                    error={errors.description?.message}
                    className="sm:col-span-2"
                  >
                    <Textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      aria-invalid={!!errors.description}
                      placeholder="Informações adicionais sobre o kit…"
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
                {isEdit ? 'Salvar alterações' : 'Criar kit'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
