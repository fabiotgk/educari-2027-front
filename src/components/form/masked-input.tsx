'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';
import { MASKS, unmask, type MaskKind } from '@/lib/masks';

const MAX_DIGITS: Record<MaskKind, number> = {
  cpf: 11,
  cnpj: 14,
  cep: 8,
  phone: 11,
  date: 8,
};

/**
 * Input com máscara PT-BR para campos numéricos (CPF/CNPJ/CEP/telefone).
 * Armazena apenas dígitos no formulário (o backend espera dígitos), mas
 * exibe o valor formatado. Usar com Controller do react-hook-form:
 *
 *   <Controller name="cpf" control={control} render={({ field }) => (
 *     <MaskedInput mask="cpf" value={field.value ?? ''} onChange={field.onChange} />
 *   )} />
 */
export function MaskedInput({
  mask,
  value,
  onChange,
  ...props
}: {
  mask: MaskKind;
  value: string;
  onChange: (digits: string) => void;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>) {
  const display = MASKS[mask](value ?? '');
  return (
    <Input
      inputMode="numeric"
      value={display}
      onChange={(e) => onChange(unmask(e.target.value).slice(0, MAX_DIGITS[mask]))}
      {...props}
    />
  );
}
