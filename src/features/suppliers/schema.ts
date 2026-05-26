import { z } from 'zod';

import { unmask } from '@/lib/masks';
import type { Supplier } from './types';

/**
 * Schema do formulário de Fornecedor. Os nomes dos campos espelham o
 * CreateSupplierRequest do backend para que erros 422 mapeiem direto
 * nos campos via applyApiErrors.
 */
export const supplierSchema = z.object({
  name: z.string().min(1, 'O nome do fornecedor é obrigatório.').max(255),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'O CNPJ deve ter 14 dígitos.')
    .optional()
    .or(z.literal('')),
  is_regional: z.boolean(),
  phone: z.string().max(32).optional(),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
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
  is_active: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

/** Valores iniciais para criação. */
export const emptySupplierForm: SupplierFormValues = {
  name: '',
  cnpj: '',
  is_regional: false,
  phone: '',
  email: '',
  address: { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' },
  is_active: true,
};

/** Converte um Supplier (API) nos valores do formulário (para edição). */
export function supplierToForm(s: Supplier): SupplierFormValues {
  return {
    name: s.name,
    cnpj: s.cnpj ?? '',
    is_regional: s.is_regional ?? false,
    phone: s.phone ? unmask(s.phone) : '',
    email: s.email ?? '',
    address: {
      cep: s.address?.cep ? unmask(s.address.cep) : '',
      logradouro: s.address?.logradouro ?? '',
      numero: s.address?.numero ?? '',
      bairro: s.address?.bairro ?? '',
      cidade: s.address?.cidade ?? '',
      uf: s.address?.uf ?? '',
    },
    is_active: s.is_active,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e formatando. */
export function buildSupplierPayload(v: SupplierFormValues): Record<string, unknown> {
  const address = {
    cep: blank(v.address?.cep),
    logradouro: blank(v.address?.logradouro),
    numero: blank(v.address?.numero),
    bairro: blank(v.address?.bairro),
    cidade: blank(v.address?.cidade),
    uf: blank(v.address?.uf)?.toUpperCase(),
  };
  const hasAddress = Object.values(address).some((x) => x !== undefined);

  return {
    name: v.name.trim(),
    cnpj: blank(v.cnpj),
    is_regional: v.is_regional,
    phone: blank(v.phone),
    email: blank(v.email),
    address: hasAddress ? address : undefined,
    is_active: v.is_active,
  };
}
