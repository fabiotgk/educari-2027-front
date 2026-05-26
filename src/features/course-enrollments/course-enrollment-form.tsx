'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Course } from '@/features/courses/types';
import type { Student } from '@/features/students/types';
import { COURSE_ENROLLMENT_STATUS_LABELS } from './types';
import {
  buildCourseEnrollmentPayload,
  courseEnrollmentSchema,
  courseEnrollmentToForm,
  emptyCourseEnrollmentForm,
  type CourseEnrollmentFormValues,
} from './schema';
import { useCourseEnrollment, useCreateCourseEnrollment, useUpdateCourseEnrollment } from './hooks';

export function CourseEnrollmentFormPage({
  courseEnrollmentId,
  courseId,
  studentId,
}: {
  courseEnrollmentId?: string;
  courseId?: string;
  studentId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(courseEnrollmentId);
  const detail = useCourseEnrollment(courseEnrollmentId ?? '');
  const form = useForm<CourseEnrollmentFormValues>({
    resolver: zodResolver(courseEnrollmentSchema),
    defaultValues: {
      ...emptyCourseEnrollmentForm,
      course_id: courseId ?? '',
      student_id: studentId ?? '',
    },
  });
  const { control, register, formState: { errors } } = form;
  const create = useCreateCourseEnrollment();
  const update = useUpdateCourseEnrollment();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(courseEnrollmentToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildCourseEnrollmentPayload(values);
      if (isEdit && courseEnrollmentId) {
        await update.mutateAsync({ id: courseEnrollmentId, body: payload });
        toastSuccess('Matrícula atualizada com sucesso.');
        router.push(`/ava/matriculas/${courseEnrollmentId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Matrícula criada com sucesso.');
        router.push(`/ava/matriculas/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/matriculas/${courseEnrollmentId}` : '/ava/matriculas';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Matrículas', href: '/ava/matriculas' }, { label: isEdit ? 'Editar' : 'Nova matrícula' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild>
                <Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar matrícula' : 'Nova matrícula no AVA'}</h1>
                <p className="text-sm text-muted-foreground">Vincule aluno, usuário e curso para acompanhar progresso e certificação.</p>
              </div>
            </div>

            {isEdit && detail.isLoading ? <Skeleton className="h-72 w-full rounded-xl" /> : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Vínculo</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Curso" htmlFor="course_id" required error={errors.course_id?.message}>
                      <Controller
                        control={control}
                        name="course_id"
                        render={({ field }) => (
                          <ResourceCombobox<Course>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="courses"
                            labelFn={(course) => course.title}
                            placeholder="Selecione um curso"
                          />
                        )}
                      />
                    </Field>
                    <Field label="Aluno" htmlFor="student_id" error={errors.student_id?.message}>
                      <Controller
                        control={control}
                        name="student_id"
                        render={({ field }) => (
                          <ResourceCombobox<Student>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="students"
                            labelFn={(student) => student.full_name}
                            placeholder="Selecione um aluno"
                          />
                        )}
                      />
                    </Field>
                    <Field label="Usuário (UUID)" htmlFor="user_id" error={errors.user_id?.message}>
                      <Input id="user_id" {...register('user_id')} aria-invalid={!!errors.user_id} />
                    </Field>
                    <Field label="Situação" required error={errors.status?.message}>
                      <Controller control={control} name="status" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!errors.status}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(COURSE_ENROLLMENT_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Acompanhamento</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Progresso (%)" htmlFor="progress_percent" error={errors.progress_percent?.message}>
                      <Input id="progress_percent" type="number" min={0} max={100} step="0.01" {...register('progress_percent')} aria-invalid={!!errors.progress_percent} />
                    </Field>
                    <Field label="Nota final" htmlFor="final_grade" error={errors.final_grade?.message}>
                      <Input id="final_grade" type="number" min={0} max={100} step="0.01" {...register('final_grade')} aria-invalid={!!errors.final_grade} />
                    </Field>
                    <Field label="Matriculado em" htmlFor="enrolled_at" error={errors.enrolled_at?.message}>
                      <Input id="enrolled_at" type="datetime-local" {...register('enrolled_at')} aria-invalid={!!errors.enrolled_at} />
                    </Field>
                    <Field label="Concluído em" htmlFor="completed_at" error={errors.completed_at?.message}>
                      <Input id="completed_at" type="datetime-local" {...register('completed_at')} aria-invalid={!!errors.completed_at} />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar matrícula'}</Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
