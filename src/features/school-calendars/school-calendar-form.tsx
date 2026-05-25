'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildSchoolCalendarPayload,
  emptySchoolCalendarForm,
  schoolCalendarSchema,
  schoolCalendarToForm,
  type SchoolCalendarFormValues,
} from './schema';
import { useCreateSchoolCalendar, useSchoolCalendar, useUpdateSchoolCalendar } from './hooks';

export function SchoolCalendarFormPage({ calendarId }: { calendarId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(calendarId);
  const detail = useSchoolCalendar(calendarId ?? '');

  const form = useForm<SchoolCalendarFormValues>({
    resolver: zodResolver(schoolCalendarSchema),
    defaultValues: emptySchoolCalendarForm,
  });
  const {
    register,
    formState: { errors },
  } = form;

  const create = useCreateSchoolCalendar();
  const update = useUpdateSchoolCalendar();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(schoolCalendarToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildSchoolCalendarPayload(values);
    try {
      if (isEdit && calendarId) {
        await update.mutateAsync({ id: calendarId, body: payload });
        toastSuccess('Calendário atualizado com sucesso.');
        router.push(`/calendario/${calendarId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Calendário criado com sucesso.');
        router.push(`/calendario/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/calendario/${calendarId}` : '/calendario';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Calendário', href: '/calendario' },
          { label: isEdit ? 'Editar' : 'Novo calendário' },
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
                  {isEdit ? 'Editar calendário' : 'Novo calendário'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize as informações do calendário letivo.'
                    : 'Crie um novo calendário letivo para a rede.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome do calendário"
                      htmlFor="name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="name"
                        {...register('name')}
                        aria-invalid={!!errors.name}
                        placeholder="Ex.: Calendário Letivo 2026"
                      />
                    </Field>
                    <Field
                      label="Ano letivo"
                      htmlFor="academic_year"
                      required
                      hint="4 dígitos"
                      error={errors.academic_year?.message}
                    >
                      <Input
                        id="academic_year"
                        inputMode="numeric"
                        maxLength={4}
                        {...register('academic_year')}
                        aria-invalid={!!errors.academic_year}
                        placeholder="2026"
                      />
                    </Field>
                    <Field
                      label="ID da escola"
                      htmlFor="school_id"
                      hint="Deixe em branco para calendário da rede toda"
                      error={errors.school_id?.message}
                    >
                      <Input
                        id="school_id"
                        {...register('school_id')}
                        aria-invalid={!!errors.school_id}
                        placeholder="UUID da escola (opcional)"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Período e dias letivos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Início"
                      htmlFor="starts_at"
                      required
                      error={errors.starts_at?.message}
                    >
                      <Input
                        id="starts_at"
                        type="date"
                        {...register('starts_at')}
                        aria-invalid={!!errors.starts_at}
                      />
                    </Field>
                    <Field
                      label="Término"
                      htmlFor="ends_at"
                      required
                      error={errors.ends_at?.message}
                    >
                      <Input
                        id="ends_at"
                        type="date"
                        {...register('ends_at')}
                        aria-invalid={!!errors.ends_at}
                      />
                    </Field>
                    <Field
                      label="Dias letivos planejados"
                      htmlFor="total_school_days_planned"
                      error={errors.total_school_days_planned?.message}
                    >
                      <Input
                        id="total_school_days_planned"
                        inputMode="numeric"
                        {...register('total_school_days_planned')}
                        aria-invalid={!!errors.total_school_days_planned}
                        placeholder="200"
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
                {isEdit ? 'Salvar alterações' : 'Criar calendário'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
