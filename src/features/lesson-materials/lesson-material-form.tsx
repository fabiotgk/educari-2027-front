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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { useLessons } from '@/features/lessons/hooks';
import {
  buildLessonMaterialPayload,
  emptyLessonMaterialForm,
  lessonMaterialSchema,
  lessonMaterialToForm,
  type LessonMaterialFormValues,
} from './schema';
import { useCreateLessonMaterial, useLessonMaterial, useUpdateLessonMaterial } from './hooks';

export function LessonMaterialFormPage({ materialId }: { materialId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(materialId);
  const detail = useLessonMaterial(materialId ?? '');
  const lessons = useLessons({ limit: 100 });
  const form = useForm<LessonMaterialFormValues>({
    resolver: zodResolver(lessonMaterialSchema),
    defaultValues: { ...emptyLessonMaterialForm, lesson_id: searchParams.get('lesson_id') ?? '' },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateLessonMaterial();
  const update = useUpdateLessonMaterial();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(lessonMaterialToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildLessonMaterialPayload(values);
      if (isEdit && materialId) {
        await update.mutateAsync({ id: materialId, body: payload });
        toastSuccess('Material atualizado com sucesso.');
        router.push(`/ava/materiais/${materialId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Material criado com sucesso.');
        router.push(`/ava/materiais/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/materiais/${materialId}` : '/ava/materiais';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Materiais', href: '/ava/materiais' }, { label: isEdit ? 'Editar' : 'Novo material' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar material' : 'Novo material'}</h1>
                <p className="text-sm text-muted-foreground">Vincule arquivos e links complementares a uma aula.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-80 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Dados do material</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Aula" required error={errors.lesson_id?.message} className="sm:col-span-2">
                    <Controller control={control} name="lesson_id" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={!!errors.lesson_id}><SelectValue placeholder="Selecione a aula" /></SelectTrigger>
                        <SelectContent>{(lessons.data?.data ?? []).map((lesson) => <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  </Field>
                  <Field label="Título" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                    <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                  </Field>
                  <Field label="URL do arquivo" htmlFor="file_url" required error={errors.file_url?.message} className="sm:col-span-2">
                    <Input id="file_url" {...register('file_url')} aria-invalid={!!errors.file_url} placeholder="https://..." />
                  </Field>
                  <Field label="Tipo do arquivo" htmlFor="file_type" error={errors.file_type?.message}>
                    <Input id="file_type" {...register('file_type')} aria-invalid={!!errors.file_type} placeholder="pdf, mp4, link..." />
                  </Field>
                  <Field label="Tamanho (KB)" htmlFor="file_size_kb" error={errors.file_size_kb?.message}>
                    <Input id="file_size_kb" type="number" min={0} {...register('file_size_kb')} aria-invalid={!!errors.file_size_kb} />
                  </Field>
                  <Field label="Posição" htmlFor="position" error={errors.position?.message}>
                    <Input id="position" type="number" min={0} {...register('position')} aria-invalid={!!errors.position} />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar material'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
