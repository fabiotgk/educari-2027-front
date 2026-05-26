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
import { Checkbox } from '@/components/ui/checkbox';
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
import { SITE_OWNER_TYPE_LABELS } from './types';
import {
  buildSitePayload,
  emptySiteForm,
  siteSchema,
  siteToForm,
  type SiteFormValues,
} from './schema';
import { useCreateSite, useSite, useUpdateSite } from './hooks';

export function SiteFormPage({ siteId }: { siteId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(siteId);
  const detail = useSite(siteId ?? '');

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: emptySiteForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateSite();
  const update = useUpdateSite();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(siteToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildSitePayload(values);
    try {
      if (isEdit && siteId) {
        await update.mutateAsync({ id: siteId, body: payload });
        toastSuccess('Site atualizado com sucesso.');
        router.push(`/portal/${siteId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Site criado com sucesso.');
        router.push(`/portal/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/portal/${siteId}` : '/portal';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Portal Educacional', href: '/portal' },
          { label: isEdit ? 'Editar site' : 'Novo site' },
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
                  {isEdit ? 'Editar site' : 'Novo site'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize as informações do portal educacional.'
                    : 'Crie um novo site no portal educacional.'}
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
                      label="Nome do site"
                      htmlFor="name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="name"
                        {...register('name')}
                        aria-invalid={!!errors.name}
                        placeholder="Portal da Escola Municipal"
                      />
                    </Field>
                    <Field
                      label="Slug (identificador)"
                      htmlFor="slug"
                      required
                      hint="Apenas letras minúsculas, números e hífens"
                      error={errors.slug?.message}
                    >
                      <Input
                        id="slug"
                        {...register('slug')}
                        aria-invalid={!!errors.slug}
                        placeholder="escola-municipal"
                      />
                    </Field>
                    <Field
                      label="Tipo de proprietário"
                      error={errors.owner_type?.message}
                    >
                      <Controller
                        control={control}
                        name="owner_type"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger aria-invalid={!!errors.owner_type}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhum</SelectItem>
                              {Object.entries(SITE_OWNER_TYPE_LABELS).map(([v, label]) => (
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
                      label="ID do proprietário"
                      htmlFor="owner_id"
                      hint="UUID da escola, projeto ou rede"
                      error={errors.owner_id?.message}
                    >
                      <Input
                        id="owner_id"
                        {...register('owner_id')}
                        aria-invalid={!!errors.owner_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
                    <Field
                      label="Descrição"
                      htmlFor="description"
                      error={errors.description?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        id="description"
                        rows={3}
                        {...register('description')}
                        aria-invalid={!!errors.description}
                        placeholder="Descreva o propósito deste site…"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Domínio e publicação</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Subdomínio"
                      htmlFor="subdomain"
                      hint="Ex: escola-central (sem .educari.com.br)"
                      error={errors.subdomain?.message}
                    >
                      <Input
                        id="subdomain"
                        {...register('subdomain')}
                        aria-invalid={!!errors.subdomain}
                        placeholder="escola-central"
                      />
                    </Field>
                    <Field
                      label="Domínio personalizado"
                      htmlFor="custom_domain"
                      error={errors.custom_domain?.message}
                    >
                      <Input
                        id="custom_domain"
                        {...register('custom_domain')}
                        aria-invalid={!!errors.custom_domain}
                        placeholder="portal.escola.gov.br"
                      />
                    </Field>
                    <Field
                      label="Data de publicação"
                      htmlFor="published_at"
                      error={errors.published_at?.message}
                    >
                      <Input
                        id="published_at"
                        type="date"
                        {...register('published_at')}
                        aria-invalid={!!errors.published_at}
                      />
                    </Field>
                    <Field label="Site publicado" className="flex items-end">
                      <Controller
                        control={control}
                        name="is_published"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                            />
                            Publicar site
                          </label>
                        )}
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
                {isEdit ? 'Salvar alterações' : 'Criar site'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
