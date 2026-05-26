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
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildCreateForumReplyPayload,
  buildUpdateForumReplyPayload,
  emptyForumReplyForm,
  forumReplySchema,
  forumReplyToForm,
  type ForumReplyFormValues,
} from './schema';
import { useCreateForumReply, useForumReply, useUpdateForumReply } from './hooks';

export function ForumReplyFormPage({ replyId }: { replyId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(replyId);
  const detail = useForumReply(replyId ?? '');
  const form = useForm<ForumReplyFormValues>({
    resolver: zodResolver(forumReplySchema),
    defaultValues: {
      ...emptyForumReplyForm,
      forum_thread_id: searchParams.get('forum_thread_id') ?? '',
      parent_reply_id: searchParams.get('parent_reply_id') ?? '',
    },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateForumReply();
  const update = useUpdateForumReply();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(forumReplyToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEdit && replyId) {
        await update.mutateAsync({ id: replyId, body: buildUpdateForumReplyPayload(values) });
        toastSuccess('Resposta atualizada com sucesso.');
        router.push(`/ava/respostas-forum/${replyId}`);
      } else {
        const created = await create.mutateAsync({
          forumThreadId: values.forum_thread_id,
          body: buildCreateForumReplyPayload(values),
        });
        toastSuccess('Resposta criada com sucesso.');
        router.push(`/ava/respostas-forum/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/respostas-forum/${replyId}` : '/ava/respostas-forum';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Respostas do fórum', href: '/ava/respostas-forum' }, { label: isEdit ? 'Editar' : 'Nova resposta' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar resposta' : 'Nova resposta'}</h1>
                <p className="text-sm text-muted-foreground">Registre respostas vinculadas a um tópico de fórum.</p>
              </div>
            </div>

            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Conteúdo</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Tópico (UUID)" htmlFor="forum_thread_id" required error={errors.forum_thread_id?.message}>
                    <Input id="forum_thread_id" disabled={isEdit} {...register('forum_thread_id')} aria-invalid={!!errors.forum_thread_id} />
                  </Field>
                  <Field label="Resposta pai (UUID)" htmlFor="parent_reply_id" error={errors.parent_reply_id?.message}>
                    <Input id="parent_reply_id" disabled={isEdit} {...register('parent_reply_id')} aria-invalid={!!errors.parent_reply_id} />
                  </Field>
                  <Field label="Conteúdo" htmlFor="body" required error={errors.body?.message} className="sm:col-span-2">
                    <Textarea id="body" rows={8} {...register('body')} aria-invalid={!!errors.body} />
                  </Field>
                  {isEdit && (
                    <Field label="Classificação">
                      <Controller control={control} name="is_solution" render={({ field }) => (
                        <label className="flex h-10 items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          Marcar como solução
                        </label>
                      )} />
                    </Field>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar resposta'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
