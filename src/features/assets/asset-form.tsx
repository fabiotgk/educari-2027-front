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
import { ASSET_CONDITION_LABELS, ASSET_STATUS_LABELS } from './types';
import {
  buildAssetPayload,
  emptyAssetForm,
  assetSchema,
  assetToForm,
  type AssetFormValues,
} from './schema';
import { useCreateAsset, useAsset, useUpdateAsset } from './hooks';

export function AssetFormPage({ assetId }: { assetId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(assetId);
  const detail = useAsset(assetId ?? '');

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: emptyAssetForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateAsset();
  const update = useUpdateAsset();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(assetToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildAssetPayload(values);
    try {
      if (isEdit && assetId) {
        await update.mutateAsync({ id: assetId, body: payload });
        toastSuccess('Bem atualizado com sucesso.');
        router.push(`/patrimonio/${assetId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Bem criado com sucesso.');
        router.push(`/patrimonio/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/patrimonio/${assetId}` : '/patrimonio';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Patrimônio' },
          { label: 'Bens', href: '/patrimonio' },
          { label: isEdit ? 'Editar' : 'Novo bem' },
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
                  {isEdit ? 'Editar bem patrimonial' : 'Novo bem patrimonial'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do bem.'
                    : 'Cadastre um novo bem patrimonial.'}
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
                      label="Nome do bem"
                      htmlFor="name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="name"
                        {...register('name')}
                        aria-invalid={!!errors.name}
                        placeholder="Nome do bem patrimonial"
                      />
                    </Field>
                    <Field
                      label="Número de tombamento"
                      htmlFor="patrimony_number"
                      required
                      error={errors.patrimony_number?.message}
                    >
                      <Input
                        id="patrimony_number"
                        {...register('patrimony_number')}
                        aria-invalid={!!errors.patrimony_number}
                        placeholder="Ex.: PAT-2024-001"
                      />
                    </Field>
                    <Field
                      label="ID da Categoria"
                      htmlFor="asset_category_id"
                      required
                      hint="UUID da categoria"
                      error={errors.asset_category_id?.message}
                    >
                      <Input
                        id="asset_category_id"
                        {...register('asset_category_id')}
                        aria-invalid={!!errors.asset_category_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
                    <Field
                      label="ID da Escola"
                      htmlFor="school_id"
                      hint="UUID da escola (opcional)"
                      error={errors.school_id?.message}
                    >
                      <Input
                        id="school_id"
                        {...register('school_id')}
                        aria-invalid={!!errors.school_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
                    <Field
                      label="Localização"
                      htmlFor="location"
                      error={errors.location?.message}
                    >
                      <Input
                        id="location"
                        {...register('location')}
                        aria-invalid={!!errors.location}
                        placeholder="Sala, andar, setor…"
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
                        placeholder="Descrição detalhada do bem"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estado e situação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Estado de conservação" error={errors.condition?.message}>
                      <Controller
                        control={control}
                        name="condition"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ''}
                            onValueChange={(v) =>
                              field.onChange(v === '' ? undefined : v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não informado</SelectItem>
                              {Object.entries(ASSET_CONDITION_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Status" error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ''}
                            onValueChange={(v) =>
                              field.onChange(v === '' ? undefined : v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não informado</SelectItem>
                              {Object.entries(ASSET_STATUS_LABELS).map(([v, label]) => (
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
                    <CardTitle className="text-base">Dados de aquisição</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Data de aquisição"
                      htmlFor="acquisition_date"
                      error={errors.acquisition_date?.message}
                    >
                      <Input
                        id="acquisition_date"
                        type="date"
                        {...register('acquisition_date')}
                        aria-invalid={!!errors.acquisition_date}
                      />
                    </Field>
                    <Field
                      label="Valor de aquisição (R$)"
                      htmlFor="acquisition_value"
                      error={errors.acquisition_value?.message}
                    >
                      <Input
                        id="acquisition_value"
                        inputMode="decimal"
                        {...register('acquisition_value')}
                        aria-invalid={!!errors.acquisition_value}
                        placeholder="0,00"
                      />
                    </Field>
                    <Field
                      label="Valor atual (R$)"
                      htmlFor="current_value"
                      error={errors.current_value?.message}
                    >
                      <Input
                        id="current_value"
                        inputMode="decimal"
                        {...register('current_value')}
                        aria-invalid={!!errors.current_value}
                        placeholder="0,00"
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
                {isEdit ? 'Salvar alterações' : 'Criar bem'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
