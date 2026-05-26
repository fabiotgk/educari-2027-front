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
import { TRANSFER_EVENT_STATUS_LABELS } from './types';
import {
  buildTransferEventPayload,
  emptyTransferEventForm,
  transferEventSchema,
  transferEventToForm,
  type TransferEventFormValues,
} from './schema';
import { useCreateTransferEvent, useTransferEvent, useUpdateTransferEvent } from './hooks';

export function TransferEventFormPage({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(eventId);
  const detail = useTransferEvent(eventId ?? '');

  const form = useForm<TransferEventFormValues>({
    resolver: zodResolver(transferEventSchema),
    defaultValues: emptyTransferEventForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateTransferEvent();
  const update = useUpdateTransferEvent();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(transferEventToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildTransferEventPayload(values);
    try {
      if (isEdit && eventId) {
        await update.mutateAsync({ id: eventId, body: payload });
        toastSuccess('Evento atualizado com sucesso.');
        router.push(`/remocao/${eventId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Evento criado com sucesso.');
        router.push(`/remocao/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/remocao/${eventId}` : '/remocao';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Concurso de Remoção', href: '/remocao' },
          { label: isEdit ? 'Editar evento' : 'Novo evento' },
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
                  {isEdit ? 'Editar evento de remoção' : 'Novo evento de remoção'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do evento de concurso de remoção.'
                    : 'Cadastre um novo evento de concurso de remoção.'}
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
                      label="Título do evento"
                      htmlFor="title"
                      required
                      error={errors.title?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="title"
                        {...register('title')}
                        aria-invalid={!!errors.title}
                        placeholder="Ex: Concurso de Remoção 2025/1"
                      />
                    </Field>
                    <Field
                      label="Ano letivo"
                      htmlFor="academic_year"
                      required
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
                              {Object.entries(TRANSFER_EVENT_STATUS_LABELS).map(([v, label]) => (
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
                      label="Referência do ato"
                      htmlFor="act_reference"
                      hint="Ex: Portaria 123/2025"
                      error={errors.act_reference?.message}
                    >
                      <Input
                        id="act_reference"
                        {...register('act_reference')}
                        aria-invalid={!!errors.act_reference}
                        placeholder="Portaria 123/2025"
                      />
                    </Field>
                    <Field
                      label="Data do evento"
                      htmlFor="event_date"
                      error={errors.event_date?.message}
                    >
                      <Input
                        id="event_date"
                        type="date"
                        {...register('event_date')}
                        aria-invalid={!!errors.event_date}
                      />
                    </Field>
                    <Field
                      label="Motivo"
                      htmlFor="reason"
                      error={errors.reason?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="reason"
                        {...register('reason')}
                        aria-invalid={!!errors.reason}
                        placeholder="Motivo do concurso de remoção"
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
                        placeholder="Detalhes e informações adicionais sobre o evento…"
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
                {isEdit ? 'Salvar alterações' : 'Criar evento'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
