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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field } from '@/components/form/field';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildDistanceCenterPayload,
  distanceCenterSchema,
  distanceCenterToForm,
  emptyDistanceCenterForm,
  type DistanceCenterFormValues,
} from './schema';
import { useCreateDistanceCenter, useDistanceCenter, useUpdateDistanceCenter } from './hooks';

export function DistanceCenterFormPage({ centerId }: { centerId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(centerId);
  const detail = useDistanceCenter(centerId ?? '');

  const form = useForm<DistanceCenterFormValues>({
    resolver: zodResolver(distanceCenterSchema),
    defaultValues: emptyDistanceCenterForm,
  });
  const {
    register,
    formState: { errors },
  } = form;

  const create = useCreateDistanceCenter();
  const update = useUpdateDistanceCenter();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(distanceCenterToForm(detail.data));
  }, [isEdit, detail.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildDistanceCenterPayload(values);
    try {
      if (isEdit && centerId) {
        await update.mutateAsync({ id: centerId, body: payload });
        toastSuccess('Polo atualizado com sucesso.');
        router.push(`/polos/${centerId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Polo criado com sucesso.');
        router.push(`/polos/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/polos/${centerId}` : '/polos';

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Polos EAD', href: '/polos' },
          { label: isEdit ? 'Editar' : 'Novo polo' },
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
                  {isEdit ? 'Editar polo EAD' : 'Novo polo EAD'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? 'Atualize os dados do polo de atendimento EAD.'
                    : 'Cadastre um novo polo de educação a distância.'}
                </p>
              </div>
            </div>

            {isEdit && detail.isLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do polo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Nome do polo"
                    htmlFor="name"
                    required
                    error={errors.name?.message}
                    className="sm:col-span-2"
                  >
                    <Input
                      id="name"
                      {...register('name')}
                      aria-invalid={!!errors.name}
                      placeholder="Ex.: Polo EAD Centro"
                    />
                  </Field>
                  <Field
                    label="Localização / Endereço"
                    htmlFor="location"
                    error={errors.location?.message}
                    className="sm:col-span-2"
                  >
                    <Input
                      id="location"
                      {...register('location')}
                      aria-invalid={!!errors.location}
                      placeholder="Endereço ou descrição da localização"
                    />
                  </Field>
                  <Field
                    label="Capacidade"
                    htmlFor="capacity"
                    hint="Número de vagas"
                    error={errors.capacity?.message}
                  >
                    <Input
                      id="capacity"
                      inputMode="numeric"
                      {...register('capacity')}
                      aria-invalid={!!errors.capacity}
                      placeholder="100"
                    />
                  </Field>
                  <Field
                    label="ID do coordenador"
                    htmlFor="coordinator_user_id"
                    hint="UUID do usuário coordenador (opcional)"
                    error={errors.coordinator_user_id?.message}
                  >
                    <Input
                      id="coordinator_user_id"
                      {...register('coordinator_user_id')}
                      aria-invalid={!!errors.coordinator_user_id}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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
                {isEdit ? 'Salvar alterações' : 'Criar polo'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
