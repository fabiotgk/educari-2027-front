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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { COURSE_LEVEL_LABELS, COURSE_STATUS_LABELS } from './types';
import {
  buildCoursePayload,
  courseSchema,
  courseToForm,
  emptyCourseForm,
  type CourseFormValues,
} from './schema';
import { useCourse, useCreateCourse, useUpdateCourse } from './hooks';

export function CourseFormPage({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(courseId);
  const detail = useCourse(courseId ?? '');
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: emptyCourseForm,
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(courseToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildCoursePayload(values);
      if (isEdit && courseId) {
        await update.mutateAsync({ id: courseId, body: payload });
        toastSuccess('Curso atualizado com sucesso.');
        router.push(`/ava/${courseId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Curso criado com sucesso.');
        router.push(`/ava/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/${courseId}` : '/ava';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Cursos', href: '/ava' }, { label: isEdit ? 'Editar' : 'Novo curso' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar curso' : 'Novo curso'}</h1>
                <p className="text-sm text-muted-foreground">Organize o curso que será o hub de módulos, aulas, materiais e avisos.</p>
              </div>
            </div>

            {isEdit && detail.isLoading ? <Skeleton className="h-96 w-full rounded-xl" /> : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Título" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                      <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                    </Field>
                    <Field label="Slug" htmlFor="slug" required error={errors.slug?.message}>
                      <Input id="slug" {...register('slug')} aria-invalid={!!errors.slug} placeholder="educacao-hibrida" />
                    </Field>
                    <Field label="Categoria" htmlFor="category" error={errors.category?.message}>
                      <Input id="category" {...register('category')} aria-invalid={!!errors.category} />
                    </Field>
                    <Field label="Nível" error={errors.level?.message}>
                      <Controller control={control} name="level" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.level}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(COURSE_LEVEL_LABELS).map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field label="Status" error={errors.status?.message}>
                      <Controller control={control} name="status" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.status}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(COURSE_STATUS_LABELS).map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field label="Carga horária" htmlFor="workload_hours" error={errors.workload_hours?.message}>
                      <Input id="workload_hours" type="number" min={0} {...register('workload_hours')} aria-invalid={!!errors.workload_hours} />
                    </Field>
                    <Field label="Instrutor (UUID)" htmlFor="instructor_id" error={errors.instructor_id?.message}>
                      <Input id="instructor_id" {...register('instructor_id')} aria-invalid={!!errors.instructor_id} />
                    </Field>
                    <Field label="Descrição" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
                      <Textarea id="description" rows={5} {...register('description')} aria-invalid={!!errors.description} />
                    </Field>
                    <Field label="Imagem de capa" htmlFor="cover_image" error={errors.cover_image?.message} className="sm:col-span-2">
                      <Input id="cover_image" {...register('cover_image')} aria-invalid={!!errors.cover_image} placeholder="https://..." />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Agenda e publicação</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Início" htmlFor="starts_at" error={errors.starts_at?.message}>
                      <Input id="starts_at" type="date" {...register('starts_at')} aria-invalid={!!errors.starts_at} />
                    </Field>
                    <Field label="Término" htmlFor="ends_at" error={errors.ends_at?.message}>
                      <Input id="ends_at" type="date" {...register('ends_at')} aria-invalid={!!errors.ends_at} />
                    </Field>
                    <Field label="Publicado em" htmlFor="published_at" error={errors.published_at?.message}>
                      <Input id="published_at" type="datetime-local" {...register('published_at')} aria-invalid={!!errors.published_at} />
                    </Field>
                    <Field label="Ritmo do curso">
                      <Controller control={control} name="is_self_paced" render={({ field }) => (
                        <label className="flex h-10 items-center gap-2 text-sm">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          Autoestudo liberado
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
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar curso'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
