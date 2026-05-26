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
import { TICKET_PRIORITY_LABELS } from './types';
import {
  buildTicketPayload,
  emptyTicketForm,
  ticketSchema,
  ticketToForm,
  type TicketFormValues,
} from './schema';
import { useCreateTicket, useTicket, useUpdateTicket } from './hooks';

export function TicketFormPage({ ticketId }: { ticketId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(ticketId);
  const detail = useTicket(ticketId ?? '');

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: emptyTicketForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateTicket();
  const update = useUpdateTicket();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(ticketToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildTicketPayload(values);
    try {
      if (isEdit && ticketId) {
        await update.mutateAsync({ id: ticketId, body: payload });
        toastSuccess('Chamado atualizado com sucesso.');
        router.push(`/helpdesk/${ticketId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Chamado aberto com sucesso.');
        router.push(`/helpdesk/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/helpdesk/${ticketId}` : '/helpdesk';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'HelpDesk' },
          { label: 'Chamados', href: '/helpdesk' },
          { label: isEdit ? 'Editar' : 'Novo chamado' },
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
                  {isEdit ? 'Editar chamado' : 'Novo chamado'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do chamado de suporte.'
                    : 'Abra um novo chamado de suporte.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados do chamado</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Assunto"
                      htmlFor="subject"
                      required
                      error={errors.subject?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="subject"
                        {...register('subject')}
                        aria-invalid={!!errors.subject}
                        placeholder="Descreva brevemente o problema"
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
                              {Object.entries(TICKET_PRIORITY_LABELS).map(([v, label]) => (
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
                      label="ID da Categoria"
                      htmlFor="ticket_category_id"
                      hint="UUID da categoria (opcional)"
                      error={errors.ticket_category_id?.message}
                    >
                      <Input
                        id="ticket_category_id"
                        {...register('ticket_category_id')}
                        aria-invalid={!!errors.ticket_category_id}
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
                      label="Descrição"
                      htmlFor="description"
                      required
                      error={errors.description?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="description"
                        rows={8}
                        {...register('description')}
                        aria-invalid={!!errors.description}
                        placeholder="Descreva detalhadamente o problema ou solicitação…"
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
                {isEdit ? 'Salvar alterações' : 'Abrir chamado'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
