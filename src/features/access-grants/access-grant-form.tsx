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
import { ResourceCombobox } from '@/components/form/resource-combobox';
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
import { SCOPE_TYPE_LABELS } from './types';
import {
  buildAccessGrantPayload,
  emptyAccessGrantForm,
  accessGrantSchema,
  accessGrantToForm,
  type AccessGrantFormValues,
} from './schema';
import { useCreateAccessGrant, useAccessGrant, useUpdateAccessGrant } from './hooks';

interface AccessGrantUserOption {
  id: string;
  name: string;
  email?: string | null;
}

export function AccessGrantFormPage({ resourceId }: { resourceId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(resourceId);
  const detail = useAccessGrant(resourceId ?? '');

  const form = useForm<AccessGrantFormValues>({
    resolver: zodResolver(accessGrantSchema),
    defaultValues: emptyAccessGrantForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateAccessGrant();
  const update = useUpdateAccessGrant();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(accessGrantToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildAccessGrantPayload(values);
    try {
      if (isEdit && resourceId) {
        await update.mutateAsync({ id: resourceId, body: payload });
        toastSuccess('Acesso atualizado com sucesso.');
        router.push(`/auditoria/${resourceId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Acesso concedido com sucesso.');
        router.push(`/auditoria/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/auditoria/${resourceId}` : '/auditoria';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Acesso e Auditoria' },
          { label: 'Concessões', href: '/auditoria' },
          { label: isEdit ? 'Editar' : 'Nova concessão' },
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
                  {isEdit ? 'Editar concessão de acesso' : 'Nova concessão de acesso'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados da concessão de acesso.'
                    : 'Conceda um novo acesso a um usuário do sistema.'}
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
                      label="Usuário"
                      htmlFor="user_id"
                      required
                      error={errors.user_id?.message}
                      className="sm:col-span-2"
                    >
                      <Controller
                        control={control}
                        name="user_id"
                        render={({ field }) => (
                          <ResourceCombobox<AccessGrantUserOption>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="users"
                            labelFn={(user) =>
                              user.email ? `${user.name} (${user.email})` : user.name
                            }
                            placeholder="Selecione um usuário"
                          />
                        )}
                      />
                    </Field>
                    <Field
                      label="Papel (role)"
                      htmlFor="role"
                      required
                      error={errors.role?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="role"
                        {...register('role')}
                        aria-invalid={!!errors.role}
                        placeholder="Ex: admin, gestor, professor"
                      />
                    </Field>
                    <Field label="Tipo de escopo" error={errors.scope_type?.message}>
                      <Controller
                        control={control}
                        name="scope_type"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.scope_type}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhum</SelectItem>
                              {Object.entries(SCOPE_TYPE_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="ID do escopo" htmlFor="scope_id" error={errors.scope_id?.message}>
                      <Input
                        id="scope_id"
                        {...register('scope_id')}
                        aria-invalid={!!errors.scope_id}
                        placeholder="UUID do escopo"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Validade e revogação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Início da validade"
                      htmlFor="starts_at"
                      error={errors.starts_at?.message}
                    >
                      <Input
                        id="starts_at"
                        type="datetime-local"
                        {...register('starts_at')}
                        aria-invalid={!!errors.starts_at}
                      />
                    </Field>
                    <Field label="Expira em" htmlFor="expires_at" error={errors.expires_at?.message}>
                      <Input
                        id="expires_at"
                        type="datetime-local"
                        {...register('expires_at')}
                        aria-invalid={!!errors.expires_at}
                      />
                    </Field>
                    <Field label="Revogado em" htmlFor="revoked_at" error={errors.revoked_at?.message}>
                      <Input
                        id="revoked_at"
                        type="datetime-local"
                        {...register('revoked_at')}
                        aria-invalid={!!errors.revoked_at}
                      />
                    </Field>
                    <Field
                      label="Concedido por"
                      htmlFor="granted_by_user_id"
                      error={errors.granted_by_user_id?.message}
                    >
                      <Controller
                        control={control}
                        name="granted_by_user_id"
                        render={({ field }) => (
                          <ResourceCombobox<AccessGrantUserOption>
                            value={field.value || null}
                            onChange={(itemId) => field.onChange(itemId ?? '')}
                            resource="users"
                            labelFn={(user) =>
                              user.email ? `${user.name} (${user.email})` : user.name
                            }
                            placeholder="Selecione o usuário"
                          />
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field label="Observações" htmlFor="notes" error={errors.notes?.message}>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        aria-invalid={!!errors.notes}
                        rows={5}
                        placeholder="Informações adicionais sobre esta concessão…"
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
                {isEdit ? 'Salvar alterações' : 'Conceder acesso'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
