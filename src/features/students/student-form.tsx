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
import { MaskedInput } from '@/components/form/masked-input';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { GENDER_LABELS, RACE_LABELS } from './types';
import {
  buildStudentPayload,
  emptyStudentForm,
  studentSchema,
  studentToForm,
  type StudentFormValues,
} from './schema';
import { useCreateStudent, useStudent, useUpdateStudent } from './hooks';

export function StudentFormPage({ studentId }: { studentId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(studentId);
  const detail = useStudent(studentId ?? '');

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyStudentForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateStudent();
  const update = useUpdateStudent();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(studentToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildStudentPayload(values);
    try {
      if (isEdit && studentId) {
        await update.mutateAsync({ id: studentId, body: payload });
        toastSuccess('Aluno atualizado com sucesso.');
        router.push(`/alunos/${studentId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Aluno criado com sucesso.');
        router.push(`/alunos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/alunos/${studentId}` : '/alunos';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Alunos', href: '/alunos' },
          { label: isEdit ? 'Editar' : 'Novo aluno' },
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
                  {isEdit ? 'Editar aluno' : 'Novo aluno'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do aluno.'
                    : 'Cadastre um novo aluno na rede municipal.'}
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
                      label="Nome completo"
                      htmlFor="full_name"
                      required
                      error={errors.full_name?.message}
                      className="sm:col-span-2"
                    >
                      <Input id="full_name" {...register('full_name')} aria-invalid={!!errors.full_name} />
                    </Field>
                    <Field label="Nome social" htmlFor="social_name" error={errors.social_name?.message}>
                      <Input id="social_name" {...register('social_name')} aria-invalid={!!errors.social_name} />
                    </Field>
                    <Field label="Data de nascimento" htmlFor="birth_date" required error={errors.birth_date?.message}>
                      <Input id="birth_date" type="date" {...register('birth_date')} aria-invalid={!!errors.birth_date} />
                    </Field>
                    <Field label="Gênero" error={errors.gender?.message}>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.gender}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não informado</SelectItem>
                              {Object.entries(GENDER_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Raça / cor" error={errors.race?.message}>
                      <Controller
                        control={control}
                        name="race"
                        render={({ field }) => (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.race}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não informado</SelectItem>
                              {Object.entries(RACE_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Nacionalidade" htmlFor="nationality" error={errors.nationality?.message}>
                      <Input id="nationality" {...register('nationality')} aria-invalid={!!errors.nationality} />
                    </Field>
                    <Field label="UF de nascimento" htmlFor="birth_state" error={errors.birth_state?.message}>
                      <Input id="birth_state" maxLength={2} {...register('birth_state')} aria-invalid={!!errors.birth_state} placeholder="MG" />
                    </Field>
                    <Field label="Cidade de nascimento" htmlFor="birth_city" error={errors.birth_city?.message}>
                      <Input id="birth_city" {...register('birth_city')} aria-invalid={!!errors.birth_city} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Documentos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="CPF" error={errors.cpf?.message}>
                      <Controller
                        control={control}
                        name="cpf"
                        render={({ field }) => (
                          <MaskedInput mask="cpf" value={field.value ?? ''} onChange={field.onChange} aria-invalid={!!errors.cpf} placeholder="000.000.000-00" />
                        )}
                      />
                    </Field>
                    <Field label="RG" htmlFor="rg" error={errors.rg?.message}>
                      <Input id="rg" {...register('rg')} aria-invalid={!!errors.rg} />
                    </Field>
                    <Field label="Órgão emissor" htmlFor="rg_issuer" error={errors.rg_issuer?.message}>
                      <Input id="rg_issuer" {...register('rg_issuer')} aria-invalid={!!errors.rg_issuer} />
                    </Field>
                    <Field label="NIS" htmlFor="nis" error={errors.nis?.message}>
                      <Input id="nis" inputMode="numeric" maxLength={11} {...register('nis')} aria-invalid={!!errors.nis} />
                    </Field>
                    <Field label="Número da certidão" htmlFor="birth_certificate_number" error={errors.birth_certificate_number?.message}>
                      <Input id="birth_certificate_number" {...register('birth_certificate_number')} aria-invalid={!!errors.birth_certificate_number} />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Outros</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="URL da foto" htmlFor="photo_url" error={errors.photo_url?.message}>
                      <Input id="photo_url" type="url" {...register('photo_url')} aria-invalid={!!errors.photo_url} />
                    </Field>
                    <Field label="Observações" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
                      <Textarea id="notes" {...register('notes')} aria-invalid={!!errors.notes} rows={4} />
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
                {isEdit ? 'Salvar alterações' : 'Criar aluno'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
