import { z } from 'zod';

import { unmask, maskCep } from '@/lib/masks';
import type { Guardian } from './types';

/**
 * Schema do formulário de Responsável. Os nomes dos campos espelham o
 * CreateGuardianRequest do backend para que erros 422 mapeiem direto
 * nos campos via applyApiErrors.
 */
export const guardianSchema = z.object({
  full_name: z.string().min(1, 'O nome completo é obrigatório.').max(255),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'O CPF deve ter 11 dígitos.')
    .optional()
    .or(z.literal('')),
  rg: z.string().max(20).optional(),
  birth_date: z.string().optional(),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  phone_primary: z.string().max(32).optional(),
  phone_secondary: z.string().max(32).optional(),
  whatsapp: z.string().max(32).optional(),
  occupation: z.string().max(128).optional(),
  address: z
    .object({
      cep: z.string().optional(),
      logradouro: z.string().max(255).optional(),
      numero: z.string().max(16).optional(),
      bairro: z.string().max(128).optional(),
      cidade: z.string().max(128).optional(),
      uf: z.string().max(2).optional(),
    })
    .optional(),
});

export type GuardianFormValues = z.infer<typeof guardianSchema>;

/** Valores iniciais para criação. */
export const emptyGuardianForm: GuardianFormValues = {
  full_name: '',
  cpf: '',
  rg: '',
  birth_date: '',
  email: '',
  phone_primary: '',
  phone_secondary: '',
  whatsapp: '',
  occupation: '',
  address: { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' },
};

/** Converte um Guardian (API) nos valores do formulário (para edição). */
export function guardianToForm(g: Guardian): GuardianFormValues {
  return {
    full_name: g.full_name,
    cpf: '',
    rg: '',
    birth_date: g.birth_date ? g.birth_date.split('T')[0] : '',
    email: g.email ?? '',
    phone_primary: g.phone_primary ? unmask(g.phone_primary) : '',
    phone_secondary: g.phone_secondary ? unmask(g.phone_secondary) : '',
    whatsapp: g.whatsapp ? unmask(g.whatsapp) : '',
    occupation: g.occupation ?? '',
    address: {
      cep: g.address?.cep ? unmask(g.address.cep) : '',
      logradouro: g.address?.logradouro ?? '',
      numero: g.address?.numero ?? '',
      bairro: g.address?.bairro ?? '',
      cidade: g.address?.cidade ?? '',
      uf: g.address?.uf ?? '',
    },
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e formatando CEP. */
export function buildGuardianPayload(v: GuardianFormValues): Record<string, unknown> {
  const cepDigits = v.address?.cep ? unmask(v.address.cep) : '';
  const address = {
    cep: cepDigits.length === 8 ? maskCep(cepDigits) : undefined,
    logradouro: blank(v.address?.logradouro),
    numero: blank(v.address?.numero),
    bairro: blank(v.address?.bairro),
    cidade: blank(v.address?.cidade),
    uf: blank(v.address?.uf)?.toUpperCase(),
  };
  const hasAddress = Object.values(address).some((x) => x !== undefined);

  return {
    full_name: v.full_name.trim(),
    cpf: blank(v.cpf),
    rg: blank(v.rg),
    birth_date: blank(v.birth_date),
    email: blank(v.email),
    phone_primary: blank(v.phone_primary),
    phone_secondary: blank(v.phone_secondary),
    whatsapp: blank(v.whatsapp),
    occupation: blank(v.occupation),
    address: hasAddress ? address : undefined,
  };
}
