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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildPreEnrollmentPayload,
  preEnrollmentToForm,
  preEnrollmentUpdateSchema,
  type PreEnrollmentUpdateFormValues,
} from './schema';
import { usePreEnrollmentApplication, useUpdatePreEnrollmentApplication } from './hooks';

/** Página de edição da inscrição de pré-matrícula.
 *  Nota: criação é feita via portal público — admin só edita. */
export function PreEnrollmentFormPage({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const detail = usePreEnrollmentApplication(applicationId);

  const form = useForm<PreEnrollmentUpdateFormValues>({
    resolver: zodResolver(preEnrollmentUpdateSchema),
    defaultValues: {
      notes: '',
      desired_education_level_id: '',
      desired_school_grade_id: '',
      desired_period_id: '',
      student_name: '',
      student_birth_date: '',
      guardian_name: '',
      guardian_email: '',
      guardian_phone: '',
    },
  });
  const {
    register,
    formState: { errors },
  } = form;

  const update = useUpdatePreEnrollmentApplication();
  const submitting = update.isPending;

  React.useEffect(() => {
    if (detail.data) form.reset(preEnrollmentToForm(detail.data));
  }, [detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!detail.data) return;
    const payload = buildPreEnrollmentPayload(values, detail.data);
    try {
      await update.mutateAsync({ id: applicationId, body: payload });
      toastSuccess('Inscrição atualizada com sucesso.');
      router.push(`/pre-matricula/${applicationId}`);
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = `/pre-matricula/${applicationId}`;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Pré-Matrícula', href: '/pre-matricula' },
          { label: detail.data?.protocol_number ?? 'Editar inscrição' },
          { label: 'Editar' },
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
                <h1 className="text-2xl font-semibold tracking-tight">Editar inscrição</h1>
                <p className="text-sm text-muted-foreground">
                  Protocolo: {detail.data?.protocol_number ?? '…'}
                </p>
              </div>
            </div>

            {detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados do aluno</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome do aluno"
                      htmlFor="student_name"
                      error={errors.student_name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="student_name"
                        {...register('student_name')}
                        aria-invalid={!!errors.student_name}
                      />
                    </Field>
                    <Field
                      label="Data de nascimento"
                      htmlFor="student_birth_date"
                      error={errors.student_birth_date?.message}
                    >
                      <Input
                        id="student_birth_date"
                        type="date"
                        {...register('student_birth_date')}
                        aria-invalid={!!errors.student_birth_date}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados do responsável</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome do responsável"
                      htmlFor="guardian_name"
                      error={errors.guardian_name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="guardian_name"
                        {...register('guardian_name')}
                        aria-invalid={!!errors.guardian_name}
                      />
                    </Field>
                    <Field
                      label="E-mail"
                      htmlFor="guardian_email"
                      error={errors.guardian_email?.message}
                    >
                      <Input
                        id="guardian_email"
                        type="email"
                        {...register('guardian_email')}
                        aria-invalid={!!errors.guardian_email}
                        placeholder="responsavel@email.com"
                      />
                    </Field>
                    <Field
                      label="Telefone"
                      htmlFor="guardian_phone"
                      error={errors.guardian_phone?.message}
                    >
                      <Input
                        id="guardian_phone"
                        {...register('guardian_phone')}
                        aria-invalid={!!errors.guardian_phone}
                        placeholder="(00) 00000-0000"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preferências e observações</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="ID do nível de ensino desejado"
                      htmlFor="desired_education_level_id"
                      error={errors.desired_education_level_id?.message}
                    >
                      <Input
                        id="desired_education_level_id"
                        {...register('desired_education_level_id')}
                        aria-invalid={!!errors.desired_education_level_id}
                        placeholder="UUID (opcional)"
                      />
                    </Field>
                    <Field
                      label="ID do ano/série desejado"
                      htmlFor="desired_school_grade_id"
                      error={errors.desired_school_grade_id?.message}
                    >
                      <Input
                        id="desired_school_grade_id"
                        {...register('desired_school_grade_id')}
                        aria-invalid={!!errors.desired_school_grade_id}
                        placeholder="UUID (opcional)"
                      />
                    </Field>
                    <Field
                      label="ID do período desejado"
                      htmlFor="desired_period_id"
                      error={errors.desired_period_id?.message}
                    >
                      <Input
                        id="desired_period_id"
                        {...register('desired_period_id')}
                        aria-invalid={!!errors.desired_period_id}
                        placeholder="UUID (opcional)"
                      />
                    </Field>
                    <Field
                      label="Observações internas"
                      htmlFor="notes"
                      error={errors.notes?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        aria-invalid={!!errors.notes}
                        rows={3}
                        placeholder="Notas para a equipe de análise…"
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
                Salvar alterações
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
