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
import { STAFF_STATUS_LABELS } from './types';
import {
  buildStaffMemberPayload,
  emptyStaffMemberForm,
  staffMemberSchema,
  staffMemberToForm,
  type StaffMemberFormValues,
} from './schema';
import { useCreateStaffMember, useStaffMember, useUpdateStaffMember } from './hooks';

export function StaffMemberFormPage({ memberId }: { memberId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(memberId);
  const detail = useStaffMember(memberId ?? '');

  const form = useForm<StaffMemberFormValues>({
    resolver: zodResolver(staffMemberSchema),
    defaultValues: emptyStaffMemberForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateStaffMember();
  const update = useUpdateStaffMember();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(staffMemberToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildStaffMemberPayload(values);
    try {
      if (isEdit && memberId) {
        await update.mutateAsync({ id: memberId, body: payload });
        toastSuccess('Servidor atualizado com sucesso.');
        router.push(`/rh/${memberId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Servidor cadastrado com sucesso.');
        router.push(`/rh/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/rh/${memberId}` : '/rh';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'RH Magistério' },
          { label: 'Servidores', href: '/rh' },
          { label: isEdit ? 'Editar' : 'Novo servidor' },
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
                  {isEdit ? 'Editar servidor' : 'Novo servidor'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do servidor do magistério.'
                    : 'Cadastre um novo servidor no quadro do magistério.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome completo"
                      htmlFor="name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="name"
                        {...register('name')}
                        aria-invalid={!!errors.name}
                      />
                    </Field>
                    <Field label="CPF" error={errors.cpf?.message}>
                      <Controller
                        control={control}
                        name="cpf"
                        render={({ field }) => (
                          <MaskedInput
                            mask="cpf"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.cpf}
                            placeholder="000.000.000-00"
                          />
                        )}
                      />
                    </Field>
                    <Field
                      label="Matrícula funcional"
                      htmlFor="registration_number"
                      error={errors.registration_number?.message}
                    >
                      <Input
                        id="registration_number"
                        {...register('registration_number')}
                        aria-invalid={!!errors.registration_number}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vínculo funcional</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Cargo / função"
                      htmlFor="role_title"
                      error={errors.role_title?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="role_title"
                        {...register('role_title')}
                        aria-invalid={!!errors.role_title}
                        placeholder="Professor(a) Classe I"
                      />
                    </Field>
                    <Field
                      label="Data de admissão"
                      htmlFor="admission_date"
                      error={errors.admission_date?.message}
                    >
                      <Input
                        id="admission_date"
                        type="date"
                        {...register('admission_date')}
                        aria-invalid={!!errors.admission_date}
                      />
                    </Field>
                    <Field label="Situação" error={errors.status?.message}>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger aria-invalid={!!errors.status}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STAFF_STATUS_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field
                      label="ID do usuário (UUID)"
                      htmlFor="user_id"
                      hint="Opcional — vincula a conta de acesso"
                      error={errors.user_id?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="user_id"
                        {...register('user_id')}
                        aria-invalid={!!errors.user_id}
                        placeholder="uuid do usuário no sistema"
                      />
                    </Field>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Cadastrar servidor'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
