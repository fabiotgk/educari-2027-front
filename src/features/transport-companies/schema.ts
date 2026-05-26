import { z } from 'zod';

import { unmask, maskCep } from '@/lib/masks';
import type { TransportCompany } from './types';

/**
 * Schema do formulário de Empresa de Transporte. Os nomes espelham o
 * CreateTransportCompanyRequest do backend para mapeamento correto de erros 422.
 */
export const transportCompanySchema = z.object({
  name: z.string().min(1, 'O nome da empresa é obrigatório.').max(255),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'O CNPJ deve ter 14 dígitos.')
    .optional()
    .or(z.literal('')),
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

export type TransportCompanyFormValues = z.infer<typeof transportCompanySchema>;

export const emptyTransportCompanyForm: TransportCompanyFormValues = {
  name: '',
  cnpj: '',
  phone: '',
  email: '',
  address: { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' },
  is_active: true,
};

export function transportCompanyToForm(c: TransportCompany): TransportCompanyFormValues {
  const addr = c.address as Record<string, unknown> | null;
  return {
    name: c.name,
    cnpj: c.cnpj ? unmask(c.cnpj) : '',
    phone: c.phone ? unmask(c.phone) : '',
    email: c.email ?? '',
    address: {
      cep: addr?.cep ? unmask(String(addr.cep)) : '',
      logradouro: addr?.logradouro ? String(addr.logradouro) : '',
      numero: addr?.numero ? String(addr.numero) : '',
      bairro: addr?.bairro ? String(addr.bairro) : '',
      cidade: addr?.cidade ? String(addr.cidade) : '',
      uf: addr?.uf ? String(addr.uf) : '',
    },
    is_active: c.is_active,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildTransportCompanyPayload(
  v: TransportCompanyFormValues,
): Record<string, unknown> {
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
    name: v.name.trim(),
    cnpj: blank(v.cnpj),
    phone: blank(v.phone),
    email: blank(v.email),
    address: hasAddress ? address : undefined,
    is_active: v.is_active,
  };
}
