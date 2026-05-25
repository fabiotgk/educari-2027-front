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
import { Field } from '@/components/form/field';
import { MaskedInput } from '@/components/form/masked-input';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildGuardianPayload, emptyGuardianForm, guardianSchema, guardianToForm, type GuardianFormValues } from './schema';
import { useCreateGuardian, useGuardian, useUpdateGuardian } from './hooks';

export function GuardianFormPage({ guardianId }: { guardianId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(guardianId);
  const detail = useGuardian(guardianId ?? '');

  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: emptyGuardianForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateGuardian();
  const update = useUpdateGuardian();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(guardianToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildGuardianPayload(values);
    try {
      if (isEdit && guardianId) {
        await update.mutateAsync({ id: guardianId, body: payload });
        toastSuccess('Responsável atualizado com sucesso.');
        router.push(`/responsaveis/${guardianId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Responsável cadastrado com sucesso.');
        router.push(`/responsaveis/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/responsaveis/${guardianId}` : '/responsaveis';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Responsáveis', href: '/responsaveis' },
          { label: isEdit ? 'Editar' : 'Novo responsável' },
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
                  {isEdit ? 'Editar responsável' : 'Novo responsável'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do responsável.'
                    : 'Cadastre um novo responsável na rede.'}
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
                      <Input
                        id="full_name"
                        {...register('full_name')}
                        aria-invalid={!!errors.full_name}
                      />
                    </Field>
                    <Field label="CPF" hint="11 dígitos, sem formatação" error={errors.cpf?.message}>
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
                    <Field label="RG" htmlFor="rg" error={errors.rg?.message}>
                      <Input id="rg" {...register('rg')} aria-invalid={!!errors.rg} />
                    </Field>
                    <Field label="Data de nascimento" htmlFor="birth_date" error={errors.birth_date?.message}>
                      <Input
                        id="birth_date"
                        type="date"
                        {...register('birth_date')}
                        aria-invalid={!!errors.birth_date}
                      />
                    </Field>
                    <Field label="Profissão / Ocupação" htmlFor="occupation" error={errors.occupation?.message}>
                      <Input
                        id="occupation"
                        {...register('occupation')}
                        aria-invalid={!!errors.occupation}
                        placeholder="Ex.: Professora, Comerciante…"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        aria-invalid={!!errors.email}
                        placeholder="responsavel@email.com"
                      />
                    </Field>
                    <Field label="Telefone principal" error={errors.phone_primary?.message}>
                      <Controller
                        control={control}
                        name="phone_primary"
                        render={({ field }) => (
                          <MaskedInput
                            mask="phone"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.phone_primary}
                            placeholder="(00) 00000-0000"
                          />
                        )}
                      />
                    </Field>
                    <Field label="Telefone secundário" error={errors.phone_secondary?.message}>
                      <Controller
                        control={control}
                        name="phone_secondary"
                        render={({ field }) => (
                          <MaskedInput
                            mask="phone"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.phone_secondary}
                            placeholder="(00) 00000-0000"
                          />
                        )}
                      />
                    </Field>
                    <Field label="WhatsApp" error={errors.whatsapp?.message}>
                      <Controller
                        control={control}
                        name="whatsapp"
                        render={({ field }) => (
                          <MaskedInput
                            mask="phone"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.whatsapp}
                            placeholder="(00) 00000-0000"
                          />
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                    <Field label="CEP" className="sm:col-span-2" error={errors.address?.cep?.message}>
                      <Controller
                        control={control}
                        name="address.cep"
                        render={({ field }) => (
                          <MaskedInput
                            mask="cep"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.address?.cep}
                            placeholder="00000-000"
                          />
                        )}
                      />
                    </Field>
                    <Field
                      label="Logradouro"
                      htmlFor="logradouro"
                      className="sm:col-span-4"
                      error={errors.address?.logradouro?.message}
                    >
                      <Input
                        id="logradouro"
                        {...register('address.logradouro')}
                        aria-invalid={!!errors.address?.logradouro}
                      />
                    </Field>
                    <Field
                      label="Número"
                      htmlFor="numero"
                      className="sm:col-span-2"
                      error={errors.address?.numero?.message}
                    >
                      <Input
                        id="numero"
                        {...register('address.numero')}
                        aria-invalid={!!errors.address?.numero}
                      />
                    </Field>
                    <Field
                      label="Bairro"
                      htmlFor="bairro"
                      className="sm:col-span-4"
                      error={errors.address?.bairro?.message}
                    >
                      <Input
                        id="bairro"
                        {...register('address.bairro')}
                        aria-invalid={!!errors.address?.bairro}
                      />
                    </Field>
                    <Field
                      label="Município"
                      htmlFor="cidade"
                      className="sm:col-span-4"
                      error={errors.address?.cidade?.message}
                    >
                      <Input
                        id="cidade"
                        {...register('address.cidade')}
                        aria-invalid={!!errors.address?.cidade}
                      />
                    </Field>
                    <Field
                      label="UF"
                      htmlFor="uf"
                      className="sm:col-span-2"
                      error={errors.address?.uf?.message}
                    >
                      <Input
                        id="uf"
                        maxLength={2}
                        {...register('address.uf')}
                        aria-invalid={!!errors.address?.uf}
                        placeholder="MG"
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
                {isEdit ? 'Salvar alterações' : 'Cadastrar responsável'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
