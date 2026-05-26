'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { Input } from '@/components/ui/input';
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
import type { Student } from '@/features/students/types';
import {
  buildFacialEnrollmentPayload,
  emptyFacialEnrollmentForm,
  facialEnrollmentSchema,
  facialEnrollmentToForm,
  type FacialEnrollmentFormValues,
} from './schema';
import {
  useCreateFacialEnrollment,
  useFacialEnrollment,
  useUpdateFacialEnrollment,
} from './hooks';
import { FACIAL_ENROLLMENT_STATUS_LABELS } from './types';

export function FacialEnrollmentFormPage({
  resourceId,
}: {
  resourceId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(resourceId);
  const detail = useFacialEnrollment(resourceId ?? '');

  const form = useForm<FacialEnrollmentFormValues>({
    resolver: zodResolver(facialEnrollmentSchema),
    defaultValues: emptyFacialEnrollmentForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateFacialEnrollment();
  const update = useUpdateFacialEnrollment();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(facialEnrollmentToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildFacialEnrollmentPayload(values);
    try {
      if (isEdit && resourceId) {
        await update.mutateAsync({ id: resourceId, body: payload });
        toastSuccess('Cadastro facial atualizado com sucesso.');
        router.push(`/facial/${resourceId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Cadastro facial criado com sucesso.');
        router.push(`/facial/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/facial/${resourceId}` : '/facial';
  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Reconhecimento Facial' },
          { label: 'Cadastros', href: '/facial' },
          { label: isEdit ? 'Editar' : 'Novo cadastro' },
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
                  {isEdit ? 'Editar cadastro facial' : 'Novo cadastro facial'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do cadastro facial do aluno.'
                    : 'Cadastre um novo aluno no reconhecimento facial.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados do aluno</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Aluno"
                      required
                      error={errors.student_id?.message}
                      className="sm:col-span-2"
                    >
                      <Controller
                        control={control}
                        name="student_id"
                            render={({ field }) => (
                          <ResourceCombobox<Student>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="students"
                            labelFn={(student) => student.full_name}
                            placeholder="Selecione um aluno…"
                          />
                        )}
                      />
                    </Field>

                    <Field
                      label="Referência da foto"
                      htmlFor="photo_reference"
                      required
                      error={errors.photo_reference?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="photo_reference"
                        {...register('photo_reference')}
                        aria-invalid={!!errors.photo_reference}
                      />
                    </Field>

                    <Field
                      label="Hash do template"
                      htmlFor="template_hash"
                      error={errors.template_hash?.message}
                    >
                      <Input
                        id="template_hash"
                        {...register('template_hash')}
                        aria-invalid={!!errors.template_hash}
                      />
                    </Field>

                    <Field
                      label="Status"
                      required
                      error={errors.status?.message}
                    >
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(
                                FACIAL_ENROLLMENT_STATUS_LABELS,
                              ).map(([v, label]) => (
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
                    <CardTitle className="text-base">
                      Consentimento e datas (LGPD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Consentimento concedido"
                      required
                      error={errors.consent_given?.message}
                      className="sm:col-span-2"
                    >
                      <Controller
                        control={control}
                        name="consent_given"
                        render={({ field }) => (
                          <div className="flex items-center gap-3 rounded-lg border p-3">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-invalid={!!errors.consent_given}
                            />
                            <span className="text-sm">
                              {field.value
                                ? 'O responsável legal concedeu consentimento para uso da imagem.'
                                : 'Consentimento ainda não concedido.'}
                            </span>
                          </div>
                        )}
                      />
                    </Field>

                    <Field
                      label="Data do consentimento"
                      htmlFor="consent_at"
                      error={errors.consent_at?.message}
                    >
                      <Input
                        id="consent_at"
                        type="date"
                        {...register('consent_at')}
                        aria-invalid={!!errors.consent_at}
                      />
                    </Field>

                    <Field
                      label="Data do cadastro"
                      htmlFor="enrolled_at"
                      error={errors.enrolled_at?.message}
                    >
                      <Input
                        id="enrolled_at"
                        type="date"
                        {...register('enrolled_at')}
                        aria-invalid={!!errors.enrolled_at}
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
                {isEdit ? 'Salvar alterações' : 'Criar cadastro'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
