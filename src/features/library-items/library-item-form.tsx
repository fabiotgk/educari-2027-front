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
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import { LIBRARY_ITEM_KIND_LABELS } from './types';
import {
  buildLibraryItemPayload,
  emptyLibraryItemForm,
  libraryItemSchema,
  libraryItemToForm,
  type LibraryItemFormValues,
} from './schema';
import { useCreateLibraryItem, useLibraryItem, useUpdateLibraryItem } from './hooks';

export function LibraryItemFormPage({ libraryItemId }: { libraryItemId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(libraryItemId);
  const detail = useLibraryItem(libraryItemId ?? '');

  const form = useForm<LibraryItemFormValues>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: emptyLibraryItemForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateLibraryItem();
  const update = useUpdateLibraryItem();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(libraryItemToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildLibraryItemPayload(values);
    try {
      if (isEdit && libraryItemId) {
        await update.mutateAsync({ id: libraryItemId, body: payload });
        toastSuccess('Item atualizado com sucesso.');
        router.push(`/biblioteca/${libraryItemId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Item criado com sucesso.');
        router.push(`/biblioteca/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/biblioteca/${libraryItemId}` : '/biblioteca';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Biblioteca' },
          { label: 'Acervo', href: '/biblioteca' },
          { label: isEdit ? 'Editar' : 'Novo item' },
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
                  {isEdit ? 'Editar item do acervo' : 'Novo item do acervo'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do item.'
                    : 'Cadastre um novo item no acervo da biblioteca.'}
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
                      label="Título"
                      htmlFor="title"
                      required
                      error={errors.title?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        id="title"
                        {...register('title')}
                        aria-invalid={!!errors.title}
                        placeholder="Título do item"
                      />
                    </Field>
                    <Field label="Tipo" required error={errors.kind?.message}>
                      <Controller
                        control={control}
                        name="kind"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={!!errors.kind}>
                              <SelectValue placeholder="Selecione…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(LIBRARY_ITEM_KIND_LABELS).map(([v, label]) => (
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
                      label="Autor"
                      htmlFor="author"
                      error={errors.author?.message}
                    >
                      <Input
                        id="author"
                        {...register('author')}
                        aria-invalid={!!errors.author}
                        placeholder="Nome do autor"
                      />
                    </Field>
                    <Field
                      label="ID da Biblioteca"
                      htmlFor="library_id"
                      required
                      error={errors.library_id?.message}
                      hint="UUID da biblioteca"
                    >
                      <Input
                        id="library_id"
                        {...register('library_id')}
                        aria-invalid={!!errors.library_id}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados editoriais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="ISBN" htmlFor="isbn" error={errors.isbn?.message}>
                      <Input
                        id="isbn"
                        {...register('isbn')}
                        aria-invalid={!!errors.isbn}
                        placeholder="978-85-0000-000-0"
                      />
                    </Field>
                    <Field label="Editora" htmlFor="publisher" error={errors.publisher?.message}>
                      <Input
                        id="publisher"
                        {...register('publisher')}
                        aria-invalid={!!errors.publisher}
                      />
                    </Field>
                    <Field
                      label="Ano de publicação"
                      htmlFor="published_year"
                      hint="4 dígitos"
                      error={errors.published_year?.message}
                    >
                      <Input
                        id="published_year"
                        inputMode="numeric"
                        maxLength={4}
                        {...register('published_year')}
                        aria-invalid={!!errors.published_year}
                        placeholder="2024"
                      />
                    </Field>
                    <Field
                      label="Código de prateleira"
                      htmlFor="shelf_code"
                      error={errors.shelf_code?.message}
                    >
                      <Input
                        id="shelf_code"
                        {...register('shelf_code')}
                        aria-invalid={!!errors.shelf_code}
                        placeholder="A1-123"
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estoque</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Total de cópias"
                      htmlFor="copies_total"
                      required
                      error={errors.copies_total?.message}
                    >
                      <Input
                        id="copies_total"
                        type="number"
                        min={1}
                        {...register('copies_total')}
                        aria-invalid={!!errors.copies_total}
                      />
                    </Field>
                    <Field
                      label="Cópias disponíveis"
                      htmlFor="copies_available"
                      required
                      error={errors.copies_available?.message}
                    >
                      <Input
                        id="copies_available"
                        type="number"
                        min={0}
                        {...register('copies_available')}
                        aria-invalid={!!errors.copies_available}
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
                {isEdit ? 'Salvar alterações' : 'Criar item'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
