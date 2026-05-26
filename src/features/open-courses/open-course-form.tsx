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
import { Switch } from '@/components/ui/switch';
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
import { MODALITY_LABELS, STATUS_LABELS } from './types';
import {
  buildOpenCoursePayload,
  emptyOpenCourseForm,
  openCourseSchema,
  openCourseToForm,
  type OpenCourseFormValues,
} from './schema';
import { useCreateOpenCourse, useOpenCourse, useUpdateOpenCourse } from './hooks';

export function OpenCourseFormPage({ openCourseId }: { openCourseId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(openCourseId);
  const detail = useOpenCourse(openCourseId ?? '');

  const form = useForm<OpenCourseFormValues>({
    resolver: zodResolver(openCourseSchema),
    defaultValues: emptyOpenCourseForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateOpenCourse();
  const update = useUpdateOpenCourse();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(openCourseToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildOpenCoursePayload(values);
    try {
      if (isEdit && openCourseId) {
        await update.mutateAsync({ id: openCourseId, body: payload });
        toastSuccess('Curso atualizado com sucesso.');
        router.push(`/cursos-livres/${openCourseId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Curso criado com sucesso.');
        router.push(`/cursos-livres/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/cursos-livres/${openCourseId}` : '/cursos-livres';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Cursos Livres' },
          { label: 'Lista', href: '/cursos-livres' },
          { label: isEdit ? 'Editar' : 'Novo curso' },
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
                  {isEdit ? 'Editar curso' : 'Novo curso'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do curso livre.'
                    : 'Cadastre um novo curso livre na plataforma.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Título do curso" htmlFor="title" required error={errors.title?.message} className="sm:col-span-2">
                      <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                    </Field>
                    <Field label="Descrição" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
                      <Textarea id="description" {...register('description')} aria-invalid={!!errors.description} rows={4} />
                    </Field>
                    <Field label="Modalidade" required error={errors.modality?.message}>
                      <Controller
                        control={control}
                        name="modality"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.modality}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(MODALITY_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Status" required error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Carga horária e vagas</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Carga horária (horas)" htmlFor="workload_hours" required error={errors.workload_hours?.message}>
                      <Controller
                        control={control}
                        name="workload_hours"
                        render={({ field }) => (
                          <Input
                            id="workload_hours"
                            type="number"
                            min={0}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            aria-invalid={!!errors.workload_hours}
                          />
                        )}
                      />
                    </Field>
                    <Field label="Vagas" htmlFor="vacancies" error={errors.vacancies?.message}>
                      <Controller
                        control={control}
                        name="vacancies"
                        render={({ field }) => (
                          <Input
                            id="vacancies"
                            type="number"
                            min={1}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            aria-invalid={!!errors.vacancies}
                          />
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Período</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Início" htmlFor="starts_at" error={errors.starts_at?.message}>
                      <Input id="starts_at" type="date" {...register('starts_at')} aria-invalid={!!errors.starts_at} />
                    </Field>
                    <Field label="Término" htmlFor="ends_at" error={errors.ends_at?.message}>
                      <Input id="ends_at" type="date" {...register('ends_at')} aria-invalid={!!errors.ends_at} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Emite certificado" error={errors.certificate_enabled?.message}>
                      <Controller
                        control={control}
                        name="certificate_enabled"
                        render={({ field }) => (
                          <div className="flex items-center gap-2 pt-1">
                            <Switch
                              id="certificate_enabled"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-invalid={!!errors.certificate_enabled}
                            />
                            <span className="text-sm text-muted-foreground">{field.value ? 'Sim' : 'Não'}</span>
                          </div>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Rodapé de ações (fluxo normal — sem sticky) */}
          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar curso'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
