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
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildForumThreadPayload,
  emptyForumThreadForm,
  forumThreadSchema,
  forumThreadToForm,
  type ForumThreadFormValues,
} from './schema';
import { useCreateForumThread, useForumThread, useUpdateForumThread } from './hooks';

export function ForumThreadFormPage({ threadId }: { threadId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(threadId);
  const detail = useForumThread(threadId ?? '');
  const form = useForm<ForumThreadFormValues>({
    resolver: zodResolver(forumThreadSchema),
    defaultValues: emptyForumThreadForm,
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateForumThread();
  const update = useUpdateForumThread();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(forumThreadToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildForumThreadPayload(values);
      if (isEdit && threadId) {
        await update.mutateAsync({ id: threadId, body: payload });
        toastSuccess('Tópico atualizado com sucesso.');
        router.push(`/ava/foruns/${threadId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Tópico criado com sucesso.');
        router.push(`/ava/foruns/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/foruns/${threadId}` : '/ava/foruns';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Fóruns', href: '/ava/foruns' }, { label: isEdit ? 'Editar' : 'Novo tópico' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar tópico' : 'Novo tópico'}</h1>
                <p className="text-sm text-muted-foreground">Gerencie discussões do AVA e seus vínculos com cursos.</p>
              </div>
            </div>

            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Conteúdo</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Título" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                      <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                    </Field>
                    <Field label="Curso (UUID)" htmlFor="course_id" error={errors.course_id?.message} className="sm:col-span-2">
                      <Input id="course_id" {...register('course_id')} aria-invalid={!!errors.course_id} />
                    </Field>
                    <Field label="Conteúdo" htmlFor="body" required error={errors.body?.message} className="sm:col-span-2">
                      <Textarea id="body" rows={8} {...register('body')} aria-invalid={!!errors.body} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Moderação</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Fixação">
                      <Controller control={control} name="is_pinned" render={({ field }) => (
                        <label className="flex h-10 items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          Manter tópico fixado
                        </label>
                      )} />
                    </Field>
                    <Field label="Bloqueio">
                      <Controller control={control} name="is_locked" render={({ field }) => (
                        <label className="flex h-10 items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          Bloquear novas interações
                        </label>
                      )} />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar tópico'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
