'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildQuestionBankPayload,
  emptyQuestionBankForm,
  questionBankSchema,
  questionBankToForm,
  type QuestionBankFormValues,
} from './schema';
import { useCreateQuestionBank, useQuestionBank, useUpdateQuestionBank } from './hooks';

export function QuestionBankFormPage({ bankId }: { bankId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(bankId);
  const detail = useQuestionBank(bankId ?? '');

  const form = useForm<QuestionBankFormValues>({
    resolver: zodResolver(questionBankSchema),
    defaultValues: emptyQuestionBankForm,
  });
  const {
    register,
    formState: { errors },
  } = form;

  const create = useCreateQuestionBank();
  const update = useUpdateQuestionBank();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(questionBankToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildQuestionBankPayload(values);
    try {
      if (isEdit && bankId) {
        await update.mutateAsync({ id: bankId, body: payload });
        toastSuccess('Banco de questões atualizado com sucesso.');
        router.push(`/banco-questoes/${bankId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Banco de questões criado com sucesso.');
        router.push(`/banco-questoes/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/banco-questoes/${bankId}` : '/banco-questoes';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Banco de Questões', href: '/banco-questoes' },
          { label: isEdit ? 'Editar' : 'Novo banco' },
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
                  {isEdit ? 'Editar banco de questões' : 'Novo banco de questões'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do banco de questões.'
                    : 'Crie um novo repositório de questões para avaliações.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do banco</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  <Field
                    label="Nome do banco"
                    htmlFor="name"
                    required
                    error={errors.name?.message}
                  >
                    <Input
                      id="name"
                      {...register('name')}
                      aria-invalid={!!errors.name}
                      placeholder="Ex.: Banco de Matemática 9º Ano"
                    />
                  </Field>
                  <Field
                    label="ID da disciplina"
                    htmlFor="subject_id"
                    hint="UUID (opcional)"
                    error={errors.subject_id?.message}
                  >
                    <Input
                      id="subject_id"
                      {...register('subject_id')}
                      aria-invalid={!!errors.subject_id}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </Field>
                  <Field
                    label="Descrição"
                    htmlFor="description"
                    error={errors.description?.message}
                  >
                    <Textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      aria-invalid={!!errors.description}
                      placeholder="Informações sobre o escopo e uso deste banco…"
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
                {isEdit ? 'Salvar alterações' : 'Criar banco'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
