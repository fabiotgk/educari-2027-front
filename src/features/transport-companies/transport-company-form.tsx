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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { MaskedInput } from '@/components/form/masked-input';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildTransportCompanyPayload,
  emptyTransportCompanyForm,
  transportCompanySchema,
  transportCompanyToForm,
  type TransportCompanyFormValues,
} from './schema';
import {
  useCreateTransportCompany,
  useTransportCompany,
  useUpdateTransportCompany,
} from './hooks';

export function TransportCompanyFormPage({ companyId }: { companyId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(companyId);
  const detail = useTransportCompany(companyId ?? '');

  const form = useForm<TransportCompanyFormValues>({
    resolver: zodResolver(transportCompanySchema),
    defaultValues: emptyTransportCompanyForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateTransportCompany();
  const update = useUpdateTransportCompany();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(transportCompanyToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildTransportCompanyPayload(values);
    try {
      if (isEdit && companyId) {
        await update.mutateAsync({ id: companyId, body: payload });
        toastSuccess('Empresa atualizada com sucesso.');
        router.push(`/transporte/${companyId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Empresa cadastrada com sucesso.');
        router.push(`/transporte/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/transporte/${companyId}` : '/transporte';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Transporte Escolar' },
          { label: 'Empresas', href: '/transporte' },
          { label: isEdit ? 'Editar' : 'Nova empresa' },
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
                  {isEdit ? 'Editar empresa de transporte' : 'Nova empresa de transporte'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados da empresa prestadora.'
                    : 'Cadastre uma nova empresa de transporte escolar.'}
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
                      label="Nome da empresa"
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
                    <Field label="CNPJ" error={errors.cnpj?.message}>
                      <Controller
                        control={control}
                        name="cnpj"
                        render={({ field }) => (
                          <MaskedInput
                            mask="cnpj"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.cnpj}
                            placeholder="00.000.000/0000-00"
                          />
                        )}
                      />
                    </Field>
                    <Field label="Situação" className="flex items-end gap-3 pb-1">
                      <Controller
                        control={control}
                        name="is_active"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            Empresa ativa
                          </label>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Telefone" error={errors.phone?.message}>
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <MaskedInput
                            mask="phone"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            aria-invalid={!!errors.phone}
                            placeholder="(00) 00000-0000"
                          />
                        )}
                      />
                    </Field>
                    <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        aria-invalid={!!errors.email}
                        placeholder="empresa@transporte.com.br"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                    <Field
                      label="CEP"
                      className="sm:col-span-2"
                      error={errors.address?.cep?.message}
                    >
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

          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Cadastrar empresa'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
