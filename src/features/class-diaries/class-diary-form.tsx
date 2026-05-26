'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { ResourceCombobox } from '@/components/form/resource-combobox';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import type { ClassResource, SubjectResource, UserResource } from './types';
import {
  buildClassDiaryPayload,
  classDiarySchema,
  classDiaryToForm,
  emptyClassDiaryForm,
  type ClassDiaryFormValues,
} from './schema';
import { useClassDiary, useCreateClassDiary, useUpdateClassDiary } from './hooks';

export function ClassDiaryFormPage({ diaryId }: { diaryId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(diaryId);
  const detail = useClassDiary(diaryId ?? '');

  const form = useForm<ClassDiaryFormValues>({
    resolver: zodResolver(classDiarySchema),
    defaultValues: { ...emptyClassDiaryForm },
  });
  const { control, register, formState: { errors } } = form;

  const create = useCreateClassDiary();
  const update = useUpdateClassDiary();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) {
      form.reset(classDiaryToForm(detail.data));
    }
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildClassDiaryPayload(values);

    try {
      if (isEdit && diaryId) {
        await update.mutateAsync({ id: diaryId, body: payload });
        toastSuccess('Diário atualizado com sucesso.');
        router.push(`/diario/${diaryId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Diário criado com sucesso.');
        router.push(`/diario/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toastError(err);
      }
    }
  });

  const backHref = isEdit ? `/diario/${diaryId}` : '/diario';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Diário Online', href: '/diario' },
          { label: isEdit ? 'Editar diário' : 'Novo diário' },
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
                  {isEdit ? 'Editar diário' : 'Novo diário'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Cadastre a relação entre turma, componente curricular e professor.
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-80 w-full rounded-xl" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do diário</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Turma" required error={errors.class_id?.message} className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="class_id"
                      render={({ field }) => (
                        <ResourceCombobox<ClassResource>
                          value={field.value || null}
                          onChange={(itemId) => field.onChange(itemId ?? '')}
                          resource="classes"
                          searchable={false}
                          labelFn={(item) => item.name || item.code || item.id}
                          placeholder="Selecione uma turma"
                        />
                      )}
                    />
                  </Field>

                  <Field label="Componente curricular" required error={errors.subject_id?.message} className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="subject_id"
                      render={({ field }) => (
                        <ResourceCombobox<SubjectResource>
                          value={field.value || null}
                          onChange={(itemId) => field.onChange(itemId ?? '')}
                          resource="subjects"
                          searchable={false}
                          labelFn={(item) => item.name || item.code || item.id}
                          placeholder="Selecione um componente"
                        />
                      )}
                    />
                  </Field>

                  <Field label="Professor responsável" required error={errors.teacher_user_id?.message} className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="teacher_user_id"
                      render={({ field }) => (
                        <ResourceCombobox<UserResource>
                          value={field.value || null}
                          onChange={(itemId) => field.onChange(itemId ?? '')}
                          resource="users"
                          labelFn={(item) => item.name || item.email || item.id}
                          placeholder="Selecione um professor"
                        />
                      )}
                    />
                  </Field>

                  <Field label="Ano letivo" htmlFor="academic_year" required error={errors.academic_year?.message}>
                    <Input
                      id="academic_year"
                      inputMode="numeric"
                      maxLength={4}
                      {...register('academic_year')}
                      aria-invalid={!!errors.academic_year}
                    />
                  </Field>

                  <Field label="Diário ativo">
                    <Controller
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                        <label className="flex h-10 items-center gap-2 text-sm">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                          />
                          Ativar imediatamente
                        </label>
                      )}
                    />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="border-t bg-background">
            <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
              <Button type="button" variant="outline" asChild>
                <Link href={backHref}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar diário'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
