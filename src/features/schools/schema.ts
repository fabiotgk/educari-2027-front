import { z } from 'zod';

import { unmask, maskCep } from '@/lib/masks';
import type { School } from './types';

const SCHOOL_TYPES = [
  'municipal',
  'estadual',
  'federal',
  'privada',
  'cei',
  'creche',
  'sme_orgao',
] as const;
const SCHOOL_STATUSES = ['active', 'suspended', 'closed'] as const;
const SCHOOL_PROFILES = ['indigena', 'ceas', 'quilombola', 'rural', 'fronteira'] as const;

/**
 * Schema do formulário de Escola. Os nomes dos campos espelham o
 * CreateSchoolRequest do backend (inclusive aninhados em address/coordinates),
 * para que os erros 422 mapeiem direto nos campos via applyApiErrors.
 */
export const schoolSchema = z.object({
  code: z.string().max(32).optional(),
  inep_code: z
    .string()
    .regex(/^\d{8}$/, 'O código INEP deve ter 8 dígitos.')
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, 'O nome da escola é obrigatório.').max(255),
  short_name: z.string().max(64).optional(),
  type: z.enum(SCHOOL_TYPES, { error: 'Selecione o tipo da escola.' }),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'O CNPJ deve ter 14 dígitos.')
    .optional()
    .or(z.literal('')),
  state_registration: z.string().max(32).optional(),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  phone: z.string().max(32).optional(),
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
  coordinates: z
    .object({
      lat: z.string().optional(),
      lng: z.string().optional(),
    })
    .optional(),
  region: z.string().max(64).optional(),
  profiles: z.array(z.enum(SCHOOL_PROFILES)).optional(),
  operation_status: z.enum(SCHOOL_STATUSES),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

/** Valores iniciais para criação. */
export const emptySchoolForm: SchoolFormValues = {
  code: '',
  inep_code: '',
  name: '',
  short_name: '',
  type: 'municipal',
  cnpj: '',
  state_registration: '',
  email: '',
  phone: '',
  address: { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' },
  coordinates: { lat: '', lng: '' },
  region: '',
  profiles: [],
  operation_status: 'active',
};

/** Converte um School (API) nos valores do formulário (para edição). */
export function schoolToForm(s: School): SchoolFormValues {
  return {
    code: s.code ?? '',
    inep_code: s.inep_code ?? '',
    name: s.name,
    short_name: s.short_name ?? '',
    type: s.type,
    cnpj: s.cnpj ?? '',
    state_registration: s.state_registration ?? '',
    email: s.email ?? '',
    phone: s.phone ? unmask(s.phone) : '',
    address: {
      cep: s.address?.cep ? unmask(s.address.cep) : '',
      logradouro: s.address?.logradouro ?? '',
      numero: s.address?.numero ?? '',
      bairro: s.address?.bairro ?? '',
      cidade: s.address?.cidade ?? '',
      uf: s.address?.uf ?? '',
    },
    coordinates: {
      lat: s.coordinates?.lat != null ? String(s.coordinates.lat) : '',
      lng: s.coordinates?.lng != null ? String(s.coordinates.lng) : '',
    },
    region: s.region ?? '',
    profiles: s.profiles ?? [],
    operation_status: s.operation_status,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e formatando CEP/coordenadas. */
export function buildSchoolPayload(v: SchoolFormValues): Record<string, unknown> {
  const cepDigits = v.address?.cep ? unmask(v.address.cep) : '';
  const address = {
    cep: cepDigits.length === 8 ? maskCep(cepDigits) : undefined, // backend espera 9 chars (00000-000)
    logradouro: blank(v.address?.logradouro),
    numero: blank(v.address?.numero),
    bairro: blank(v.address?.bairro),
    cidade: blank(v.address?.cidade),
    uf: blank(v.address?.uf)?.toUpperCase(),
  };
  const hasAddress = Object.values(address).some((x) => x !== undefined);

  const coordinates = {
    lat: blank(v.coordinates?.lat) !== undefined ? Number(v.coordinates!.lat) : undefined,
    lng: blank(v.coordinates?.lng) !== undefined ? Number(v.coordinates!.lng) : undefined,
  };
  const hasCoords = coordinates.lat !== undefined || coordinates.lng !== undefined;

  return {
    code: blank(v.code),
    inep_code: blank(v.inep_code),
    name: v.name.trim(),
    short_name: blank(v.short_name),
    type: v.type,
    cnpj: blank(v.cnpj),
    state_registration: blank(v.state_registration),
    email: blank(v.email),
    phone: blank(v.phone),
    address: hasAddress ? address : undefined,
    coordinates: hasCoords ? coordinates : undefined,
    region: blank(v.region),
    profiles: v.profiles?.length ? v.profiles : undefined,
    operation_status: v.operation_status,
  };
}
