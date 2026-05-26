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
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Course } from '@/features/courses/types';
import {
  buildCourseAnnouncementPayload,
  courseAnnouncementSchema,
  courseAnnouncementToForm,
  emptyCourseAnnouncementForm,
  type CourseAnnouncementFormValues,
} from './schema';
import {
  useCourseAnnouncement,
  useCreateCourseAnnouncement,
  useUpdateCourseAnnouncement,
} from './hooks';

export function CourseAnnouncementFormPage({ announcementId }: { announcementId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(announcementId);
  const detail = useCourseAnnouncement(announcementId ?? '');
  const form = useForm<CourseAnnouncementFormValues>({
    resolver: zodResolver(courseAnnouncementSchema),
    defaultValues: { ...emptyCourseAnnouncementForm, course_id: searchParams.get('course_id') ?? '' },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateCourseAnnouncement();
  const update = useUpdateCourseAnnouncement();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(courseAnnouncementToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildCourseAnnouncementPayload(values);
      if (isEdit && announcementId) {
        await update.mutateAsync({ id: announcementId, body: payload });
        toastSuccess('Aviso atualizado com sucesso.');
        router.push(`/ava/avisos/${announcementId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Aviso criado com sucesso.');
        router.push(`/ava/avisos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/avisos/${announcementId}` : '/ava/avisos';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Avisos', href: '/ava/avisos' }, { label: isEdit ? 'Editar' : 'Novo aviso' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar aviso' : 'Novo aviso'}</h1>
                <p className="text-sm text-muted-foreground">Publique comunicados vinculados a um curso.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-80 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Dados do aviso</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Curso" required error={errors.course_id?.message} className="sm:col-span-2">
                    <Controller control={control} name="course_id" render={({ field }) => (
                      <ResourceCombobox<Course>
                        value={field.value || null}
                        onChange={(itemId) => field.onChange(itemId ?? '')}
                        resource="courses"
                        labelFn={(course) => course.title}
                        placeholder="Selecione o curso"
                      />
                    )} />
                  </Field>
                  <Field label="Título" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                    <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                  </Field>
                  <Field label="Publicado em" htmlFor="published_at" error={errors.published_at?.message}>
                    <Input id="published_at" type="datetime-local" {...register('published_at')} aria-invalid={!!errors.published_at} />
                  </Field>
                  <Field label="Destaque">
                    <Controller control={control} name="is_pinned" render={({ field }) => (
                      <label className="flex h-10 items-center gap-2 text-sm">
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                        Fixar aviso no curso
                      </label>
                    )} />
                  </Field>
                  <Field label="Conteúdo" htmlFor="body" required error={errors.body?.message} className="sm:col-span-2">
                    <Textarea id="body" rows={8} {...register('body')} aria-invalid={!!errors.body} />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar aviso'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
