'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from '@/components/form/field';
import { MaskedInput } from '@/components/form/masked-input';
import { FormSheet } from '@/components/crud/form-sheet';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  SCHOOL_PROFILE_LABELS,
  SCHOOL_STATUS_LABELS,
  SCHOOL_TYPE_LABELS,
  type School,
  type SchoolProfile,
} from './types';
import {
  buildSchoolPayload,
  emptySchoolForm,
  schoolSchema,
  schoolToForm,
  type SchoolFormValues,
} from './schema';
import { useCreateSchool, useUpdateSchool } from './hooks';

export function SchoolForm({
  open,
  onOpenChange,
  school,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
}) {
  const isEdit = Boolean(school);
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: emptySchoolForm,
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const create = useCreateSchool();
  const update = useUpdateSchool();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (open) form.reset(school ? schoolToForm(school) : emptySchoolForm);
  }, [open, school, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = buildSchoolPayload(values);
    try {
      if (isEdit && school) {
        await update.mutateAsync({ id: school.id, body: payload });
        toastSuccess('Escola atualizada com sucesso.');
      } else {
        await create.mutateAsync(payload);
        toastSuccess('Escola criada com sucesso.');
      }
      onOpenChange(false);
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar escola' : 'Nova escola'}
      description={
        isEdit ? 'Atualize os dados da unidade escolar.' : 'Cadastre uma nova unidade escolar.'
      }
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Salvar alterações' : 'Criar escola'}
    >
      {/* Identificação */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome da escola" htmlFor="name" required error={errors.name?.message} className="col-span-2">
          <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Nome curto" htmlFor="short_name" error={errors.short_name?.message}>
          <Input id="short_name" {...register('short_name')} aria-invalid={!!errors.short_name} />
        </Field>
        <Field label="Código interno" htmlFor="code" error={errors.code?.message}>
          <Input id="code" {...register('code')} aria-invalid={!!errors.code} />
        </Field>
        <Field label="Tipo" required error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.type}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCHOOL_TYPE_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Situação" required error={errors.operation_status?.message}>
          <Controller
            control={control}
            name="operation_status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.operation_status}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCHOOL_STATUS_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Código INEP" htmlFor="inep_code" hint="8 dígitos" error={errors.inep_code?.message}>
          <Input id="inep_code" inputMode="numeric" maxLength={8} {...register('inep_code')} aria-invalid={!!errors.inep_code} />
        </Field>
      </div>

      {/* Dados fiscais e contato */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="CNPJ" error={errors.cnpj?.message}>
          <Controller
            control={control}
            name="cnpj"
            render={({ field }) => (
              <MaskedInput mask="cnpj" value={field.value ?? ''} onChange={field.onChange} aria-invalid={!!errors.cnpj} placeholder="00.000.000/0000-00" />
            )}
          />
        </Field>
        <Field label="Inscrição estadual" htmlFor="state_registration" error={errors.state_registration?.message}>
          <Input id="state_registration" {...register('state_registration')} aria-invalid={!!errors.state_registration} />
        </Field>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} placeholder="escola@cidade.gov.br" />
        </Field>
        <Field label="Telefone" error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <MaskedInput mask="phone" value={field.value ?? ''} onChange={field.onChange} aria-invalid={!!errors.phone} placeholder="(00) 00000-0000" />
            )}
          />
        </Field>
      </div>

      {/* Endereço */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Endereço</h3>
        <div className="grid grid-cols-6 gap-4">
          <Field label="CEP" className="col-span-2" error={errors.address?.cep?.message}>
            <Controller
              control={control}
              name="address.cep"
              render={({ field }) => (
                <MaskedInput mask="cep" value={field.value ?? ''} onChange={field.onChange} aria-invalid={!!errors.address?.cep} placeholder="00000-000" />
              )}
            />
          </Field>
          <Field label="Logradouro" htmlFor="logradouro" className="col-span-4" error={errors.address?.logradouro?.message}>
            <Input id="logradouro" {...register('address.logradouro')} aria-invalid={!!errors.address?.logradouro} />
          </Field>
          <Field label="Número" htmlFor="numero" className="col-span-2" error={errors.address?.numero?.message}>
            <Input id="numero" {...register('address.numero')} aria-invalid={!!errors.address?.numero} />
          </Field>
          <Field label="Bairro" htmlFor="bairro" className="col-span-4" error={errors.address?.bairro?.message}>
            <Input id="bairro" {...register('address.bairro')} aria-invalid={!!errors.address?.bairro} />
          </Field>
          <Field label="Município" htmlFor="cidade" className="col-span-4" error={errors.address?.cidade?.message}>
            <Input id="cidade" {...register('address.cidade')} aria-invalid={!!errors.address?.cidade} />
          </Field>
          <Field label="UF" htmlFor="uf" className="col-span-2" error={errors.address?.uf?.message}>
            <Input id="uf" maxLength={2} {...register('address.uf')} aria-invalid={!!errors.address?.uf} placeholder="MG" />
          </Field>
        </div>
      </div>

      {/* Localização e perfis */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude" htmlFor="lat" error={errors.coordinates?.lat?.message}>
          <Input id="lat" inputMode="decimal" {...register('coordinates.lat')} aria-invalid={!!errors.coordinates?.lat} placeholder="-20.3776" />
        </Field>
        <Field label="Longitude" htmlFor="lng" error={errors.coordinates?.lng?.message}>
          <Input id="lng" inputMode="decimal" {...register('coordinates.lng')} aria-invalid={!!errors.coordinates?.lng} placeholder="-43.4061" />
        </Field>
        <Field label="Região / zona" htmlFor="region" error={errors.region?.message}>
          <Input id="region" {...register('region')} aria-invalid={!!errors.region} placeholder="Urbana, Rural…" />
        </Field>
      </div>

      <Field label="Perfis da escola" hint="Marque os que se aplicam">
        <Controller
          control={control}
          name="profiles"
          render={({ field }) => {
            const value = field.value ?? [];
            const toggle = (p: SchoolProfile) =>
              field.onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
            return (
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                {Object.entries(SCHOOL_PROFILE_LABELS).map(([v, label]) => (
                  <label key={v} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={value.includes(v as SchoolProfile)}
                      onCheckedChange={() => toggle(v as SchoolProfile)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            );
          }}
        />
      </Field>
    </FormSheet>
  );
}
