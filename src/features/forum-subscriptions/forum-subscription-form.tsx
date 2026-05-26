'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildCreateForumSubscriptionPayload,
  buildUpdateForumSubscriptionPayload,
  emptyForumSubscriptionForm,
  forumSubscriptionSchema,
  forumSubscriptionToForm,
  type ForumSubscriptionFormValues,
} from './schema';
import { useCreateForumSubscription, useForumSubscription, useUpdateForumSubscription } from './hooks';

export function ForumSubscriptionFormPage({ subscriptionId }: { subscriptionId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(subscriptionId);
  const detail = useForumSubscription(subscriptionId ?? '');
  const form = useForm<ForumSubscriptionFormValues>({
    resolver: zodResolver(forumSubscriptionSchema),
    defaultValues: {
      ...emptyForumSubscriptionForm,
      forum_thread_id: searchParams.get('forum_thread_id') ?? '',
    },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateForumSubscription();
  const update = useUpdateForumSubscription();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(forumSubscriptionToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEdit && subscriptionId) {
        await update.mutateAsync({ id: subscriptionId, body: buildUpdateForumSubscriptionPayload(values) });
        toastSuccess('Inscrição atualizada com sucesso.');
        router.push(`/ava/inscricoes-forum/${subscriptionId}`);
      } else {
        const created = await create.mutateAsync(buildCreateForumSubscriptionPayload(values));
        toastSuccess('Inscrição criada com sucesso.');
        router.push(`/ava/inscricoes-forum/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/inscricoes-forum/${subscriptionId}` : '/ava/inscricoes-forum';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Inscrições do fórum', href: '/ava/inscricoes-forum' }, { label: isEdit ? 'Editar' : 'Nova inscrição' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar inscrição' : 'Nova inscrição'}</h1>
                <p className="text-sm text-muted-foreground">Controle notificações de acompanhamento em tópicos do fórum.</p>
              </div>
            </div>

            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Inscrição</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Tópico (UUID)" htmlFor="forum_thread_id" required error={errors.forum_thread_id?.message}>
                    <Input id="forum_thread_id" disabled={isEdit} {...register('forum_thread_id')} aria-invalid={!!errors.forum_thread_id} />
                  </Field>
                  <Field label="Notificações">
                    <Controller control={control} name="notify" render={({ field }) => (
                      <label className="flex h-10 items-center gap-2 text-sm">
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                        Receber notificações do tópico
                      </label>
                    )} />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar inscrição'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
