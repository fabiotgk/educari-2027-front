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
import { ResourceCombobox } from '@/components/form/resource-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CourseModule } from '@/features/course-modules/types';
import { LESSON_CONTENT_TYPE_LABELS } from './types';
import { buildLessonPayload, emptyLessonForm, lessonSchema, lessonToForm, type LessonFormValues } from './schema';
import { useCreateLesson, useLesson, useUpdateLesson } from './hooks';

export function LessonFormPage({ lessonId }: { lessonId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(lessonId);
  const detail = useLesson(lessonId ?? '');
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { ...emptyLessonForm, course_module_id: searchParams.get('course_module_id') ?? '' },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateLesson();
  const update = useUpdateLesson();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(lessonToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLessonPayload(values);
      if (isEdit && lessonId) {
        await update.mutateAsync({ id: lessonId, body: payload });
        toastSuccess('Aula atualizada com sucesso.');
        router.push(`/ava/aulas/${lessonId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Aula criada com sucesso.');
        router.push(`/ava/aulas/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/aulas/${lessonId}` : '/ava/aulas';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Aulas', href: '/ava/aulas' }, { label: isEdit ? 'Editar' : 'Nova aula' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar aula' : 'Nova aula'}</h1>
                <p className="text-sm text-muted-foreground">Cadastre o conteúdo da aula e sua posição na trilha.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Dados da aula</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Módulo" required error={errors.course_module_id?.message} className="sm:col-span-2">
                      <Controller control={control} name="course_module_id" render={({ field }) => (
                        <ResourceCombobox<CourseModule>
                          value={field.value || null}
                          onChange={(itemId) => field.onChange(itemId ?? '')}
                          resource="course-modules"
                          labelFn={(module) => module.title}
                          placeholder="Selecione o módulo"
                        />
                      )} />
                    </Field>
                    <Field label="Título" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                      <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                    </Field>
                    <Field label="Tipo de conteúdo" error={errors.content_type?.message}>
                      <Controller control={control} name="content_type" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.content_type}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(LESSON_CONTENT_TYPE_LABELS).map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field label="Duração (min)" htmlFor="duration_minutes" error={errors.duration_minutes?.message}>
                      <Input id="duration_minutes" type="number" min={0} {...register('duration_minutes')} aria-invalid={!!errors.duration_minutes} />
                    </Field>
                    <Field label="Posição" htmlFor="position" error={errors.position?.message}>
                      <Input id="position" type="number" min={0} {...register('position')} aria-invalid={!!errors.position} />
                    </Field>
                    <Field label="Flags">
                      <div className="flex h-10 flex-wrap items-center gap-5">
                        <Controller control={control} name="is_preview" render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} /> Prévia</label>
                        )} />
                        <Controller control={control} name="is_published" render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} /> Publicada</label>
                        )} />
                      </div>
                    </Field>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Conteúdo</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4">
                    <Field label="URL do conteúdo" htmlFor="content_url" error={errors.content_url?.message}>
                      <Input id="content_url" {...register('content_url')} aria-invalid={!!errors.content_url} placeholder="https://..." />
                    </Field>
                    <Field label="Corpo do conteúdo" htmlFor="content_body" error={errors.content_body?.message}>
                      <Textarea id="content_body" rows={8} {...register('content_body')} aria-invalid={!!errors.content_body} />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar aula'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
