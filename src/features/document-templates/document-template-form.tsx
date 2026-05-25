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
import { DOCUMENT_KIND_LABELS } from './types';
import {
  buildDocumentTemplatePayload,
  documentTemplateSchema,
  documentTemplateToForm,
  emptyDocumentTemplateForm,
  type DocumentTemplateFormValues,
} from './schema';
import {
  useCreateDocumentTemplate,
  useDocumentTemplate,
  useUpdateDocumentTemplate,
} from './hooks';

export function DocumentTemplateFormPage({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(templateId);
  const detail = useDocumentTemplate(templateId ?? '');

  const form = useForm<DocumentTemplateFormValues>({
    resolver: zodResolver(documentTemplateSchema),
    defaultValues: emptyDocumentTemplateForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateDocumentTemplate();
  const update = useUpdateDocumentTemplate();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(documentTemplateToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildDocumentTemplatePayload(values);
    try {
      if (isEdit && templateId) {
        await update.mutateAsync({ id: templateId, body: payload });
        toastSuccess('Template atualizado com sucesso.');
        router.push(`/documentos/${templateId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Template criado com sucesso.');
        router.push(`/documentos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/documentos/${templateId}` : '/documentos';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Documentação', href: '/documentos' },
          { label: isEdit ? 'Editar template' : 'Novo template' },
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
                  {isEdit ? 'Editar template' : 'Novo template'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize o template de documento.'
                    : 'Crie um novo template de documento para o tenant.'}
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
                      label="Nome do template"
                      htmlFor="name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="name"
                        {...register('name')}
                        aria-invalid={!!errors.name}
                        placeholder="Ex.: Declaração de Matrícula v2"
                      />
                    </Field>
                    <Field label="Tipo de documento" required error={errors.kind?.message}>
                      <Controller
                        control={control}
                        name="kind"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.kind}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DOCUMENT_KIND_LABELS).map(([v, label]) => (
                                <SelectItem key={v} value={v}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                    <Field label="Configurações" className="flex flex-col gap-2 pt-2">
                      <Controller
                        control={control}
                        name="is_active"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(Boolean(v))}
                            />
                            Ativo (disponível para uso)
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name="is_default"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(Boolean(v))}
                            />
                            Template padrão para este tipo
                          </label>
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conteúdo do template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="Cabeçalho (HTML)" htmlFor="header_html" error={errors.header_html?.message}>
                      <Textarea
                        id="header_html"
                        {...register('header_html')}
                        aria-invalid={!!errors.header_html}
                        rows={4}
                        className="font-mono text-xs"
                        placeholder="<header>…</header>"
                      />
                    </Field>
                    <Field
                      label="Corpo do template (Blade)"
                      htmlFor="body_template"
                      required
                      error={errors.body_template?.message}
                    >
                      <Textarea
                        id="body_template"
                        {...register('body_template')}
                        aria-invalid={!!errors.body_template}
                        rows={12}
                        className="font-mono text-xs"
                        placeholder="{{ $student->name }} está matriculado(a)…"
                      />
                    </Field>
                    <Field label="Rodapé (HTML)" htmlFor="footer_html" error={errors.footer_html?.message}>
                      <Textarea
                        id="footer_html"
                        {...register('footer_html')}
                        aria-invalid={!!errors.footer_html}
                        rows={4}
                        className="font-mono text-xs"
                        placeholder="<footer>…</footer>"
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
                {isEdit ? 'Salvar alterações' : 'Criar template'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
