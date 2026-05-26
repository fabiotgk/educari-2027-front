'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  ANNOUNCEMENT_KIND_LABELS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_TARGET_TYPE_LABELS,
} from './types';
import {
  buildAnnouncementPayload,
  emptyAnnouncementForm,
  announcementSchema,
  announcementToForm,
  type AnnouncementFormValues,
} from './schema';
import { useCreateAnnouncement, useAnnouncement, useUpdateAnnouncement } from './hooks';

export function AnnouncementFormPage({ announcementId }: { announcementId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(announcementId);
  const detail = useAnnouncement(announcementId ?? '');

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: emptyAnnouncementForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields: targetFields, append: appendTarget, remove: removeTarget } = useFieldArray({
    control,
    name: 'targets',
  });

  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(announcementToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildAnnouncementPayload(values);
    try {
      if (isEdit && announcementId) {
        await update.mutateAsync({ id: announcementId, body: payload });
        toastSuccess('Comunicado atualizado com sucesso.');
        router.push(`/comunicacao/${announcementId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Comunicado criado com sucesso.');
        router.push(`/comunicacao/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/comunicacao/${announcementId}` : '/comunicacao';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Comunicação' },
          { label: 'Comunicados', href: '/comunicacao' },
          { label: isEdit ? 'Editar' : 'Novo comunicado' },
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
                  {isEdit ? 'Editar comunicado' : 'Novo comunicado'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do comunicado.'
                    : 'Crie um novo comunicado institucional.'}
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
                      label="Título"
                      htmlFor="title"
                      required
                      error={errors.title?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="title"
                        {...register('title')}
                        aria-invalid={!!errors.title}
                        placeholder="Título do comunicado"
                      />
                    </Field>
                    <Field label="Tipo" required error={errors.kind?.message}>
                      <Controller
                        control={control}
                        name="kind"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.kind}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ANNOUNCEMENT_KIND_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Prioridade" required error={errors.priority?.message}>
                      <Controller
                        control={control}
                        name="priority"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.priority}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ANNOUNCEMENT_PRIORITY_LABELS).map(([v, label]) => (
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
                      label="Resumo"
                      htmlFor="summary"
                      hint="Máx. 512 caracteres"
                      error={errors.summary?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="summary"
                        rows={2}
                        {...register('summary')}
                        aria-invalid={!!errors.summary}
                        placeholder="Breve descrição do comunicado"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field label="Corpo do comunicado" htmlFor="body" required error={errors.body?.message}>
                      <Textarea
                        id="body"
                        rows={8}
                        {...register('body')}
                        aria-invalid={!!errors.body}
                        placeholder="Conteúdo completo do comunicado…"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vigência e configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Data de publicação"
                      htmlFor="published_at"
                      error={errors.published_at?.message}
                    >
                      <Input
                        id="published_at"
                        type="datetime-local"
                        {...register('published_at')}
                        aria-invalid={!!errors.published_at}
                      />
                    </Field>
                    <Field
                      label="Data de expiração"
                      htmlFor="expires_at"
                      error={errors.expires_at?.message}
                    >
                      <Input
                        id="expires_at"
                        type="datetime-local"
                        {...register('expires_at')}
                        aria-invalid={!!errors.expires_at}
                      />
                    </Field>
                    <div className="flex flex-col gap-3 sm:col-span-2">
                      <Controller
                        control={control}
                        name="requires_read_confirmation"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            Requer confirmação de leitura
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name="requires_authorization"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            Requer autorização antes de publicar
                          </label>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Público-alvo</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendTarget({ target_type: 'tenant', target_id: '', target_value: '' })
                      }
                    >
                      <Plus /> Adicionar
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {errors.targets?.message && (
                      <p className="text-sm text-destructive">{errors.targets.message}</p>
                    )}
                    {targetFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Field
                          label="Tipo"
                          error={errors.targets?.[index]?.target_type?.message}
                        >
                          <Controller
                            control={control}
                            name={`targets.${index}.target_type`}
                            render={({ field: tf }) => (
                              <Select value={tf.value} onValueChange={tf.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ANNOUNCEMENT_TARGET_TYPE_LABELS).map(
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
                          label="ID (opcional)"
                          htmlFor={`targets.${index}.target_id`}
                          error={errors.targets?.[index]?.target_id?.message}
                        >
                          <Input
                            id={`targets.${index}.target_id`}
                            {...register(`targets.${index}.target_id`)}
                            placeholder="UUID do alvo (opcional)"
                          />
                        </Field>
                        <div className="flex items-end gap-2">
                          <Field
                            label="Valor (opcional)"
                            htmlFor={`targets.${index}.target_value`}
                            error={errors.targets?.[index]?.target_value?.message}
                            className="flex-1"
                          >
                            <Input
                              id={`targets.${index}.target_value`}
                              {...register(`targets.${index}.target_value`)}
                              placeholder="Ex.: 5º Ano"
                            />
                          </Field>
                          {targetFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remover público-alvo"
                              onClick={() => removeTarget(index)}
                              className="mb-0.5"
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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
                {isEdit ? 'Salvar alterações' : 'Criar comunicado'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
