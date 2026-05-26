import { z } from 'zod';

import type { Asset } from './types';

const ASSET_CONDITIONS = ['new', 'good', 'fair', 'poor'] as const;
const ASSET_STATUSES = ['active', 'maintenance', 'disposed', 'lost'] as const;

/**
 * Schema do formulário de Bem Patrimonial. Os nomes dos campos espelham o
 * CreateAssetRequest do backend para que os erros 422 mapeiem
 * direto nos campos via applyApiErrors.
 */
export const assetSchema = z.object({
  asset_category_id: z.string().uuid('Selecione uma categoria válida.'),
  school_id: z.string().uuid().optional().or(z.literal('')),
  patrimony_number: z
    .string()
    .min(1, 'O número de tombamento é obrigatório.')
    .max(64),
  name: z.string().min(1, 'O nome do bem é obrigatório.').max(255),
  description: z.string().optional().or(z.literal('')),
  acquisition_date: z.string().optional().or(z.literal('')),
  acquisition_value: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Valor inválido.')
    .optional()
    .or(z.literal('')),
  current_value: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Valor inválido.')
    .optional()
    .or(z.literal('')),
  condition: z.enum(ASSET_CONDITIONS).optional().or(z.literal('' as never)),
  status: z.enum(ASSET_STATUSES).optional().or(z.literal('' as never)),
  location: z.string().max(255).optional().or(z.literal('')),
});

export type AssetFormValues = z.infer<typeof assetSchema>;

/** Valores iniciais para criação. */
export const emptyAssetForm: AssetFormValues = {
  asset_category_id: '',
  school_id: '',
  patrimony_number: '',
  name: '',
  description: '',
  acquisition_date: '',
  acquisition_value: '',
  current_value: '',
  condition: undefined,
  status: undefined,
  location: '',
};

/** Converte um Asset (API) nos valores do formulário (para edição). */
export function assetToForm(a: Asset): AssetFormValues {
  return {
    asset_category_id: a.asset_category_id,
    school_id: a.school_id ?? '',
    patrimony_number: a.patrimony_number,
    name: a.name,
    description: a.description ?? '',
    acquisition_date: a.acquisition_date ?? '',
    acquisition_value: a.acquisition_value ?? '',
    current_value: a.current_value ?? '',
    condition: a.condition ?? undefined,
    status: a.status ?? undefined,
    location: a.location ?? '',
  };
}

const blank = (v: string | undefined) =>
  v && v.trim() !== '' ? v.trim() : undefined;

const toNumber = (v: string | undefined): number | undefined => {
  if (!v || v.trim() === '') return undefined;
  return parseFloat(v.replace(',', '.'));
};

/** Monta o payload para a API, omitindo vazios. */
export function buildAssetPayload(v: AssetFormValues): Record<string, unknown> {
  return {
    asset_category_id: v.asset_category_id,
    school_id: blank(v.school_id) ?? null,
    patrimony_number: v.patrimony_number.trim(),
    name: v.name.trim(),
    description: blank(v.description),
    acquisition_date: blank(v.acquisition_date),
    acquisition_value: toNumber(v.acquisition_value),
    current_value: toNumber(v.current_value),
    condition: v.condition || undefined,
    status: v.status || undefined,
    location: blank(v.location),
  };
}
