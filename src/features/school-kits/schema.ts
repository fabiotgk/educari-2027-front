import { z } from 'zod';
import type { SchoolKit } from './types';

const SCHOOL_KIT_STATUSES = ['planned', 'active', 'closed'] as const;

/**
 * Schema do formulário de Kit Escolar. Os nomes dos campos espelham o
 * CreateSchoolKitRequest do backend.
 */
export const schoolKitSchema = z.object({
  academic_year: z
    .string()
    .min(1, 'O ano letivo é obrigatório.')
    .regex(/^\d{4}$/, 'O ano letivo deve ter 4 dígitos.'),
  name: z.string().min(1, 'O nome do kit é obrigatório.').max(255),
  target_stage: z.string().max(32).optional(),
  description: z.string().optional(),
  status: z.enum(SCHOOL_KIT_STATUSES).optional(),
});

export type SchoolKitFormValues = z.infer<typeof schoolKitSchema>;

export const emptySchoolKitForm: SchoolKitFormValues = {
  academic_year: String(new Date().getFullYear()),
  name: '',
  target_stage: '',
  description: '',
  status: 'planned',
};

export function schoolKitToForm(k: SchoolKit): SchoolKitFormValues {
  return {
    academic_year: k.academic_year,
    name: k.name,
    target_stage: k.target_stage ?? '',
    description: k.description ?? '',
    status: k.status,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildSchoolKitPayload(v: SchoolKitFormValues): Record<string, unknown> {
  return {
    academic_year: v.academic_year.trim(),
    name: v.name.trim(),
    target_stage: blank(v.target_stage),
    description: blank(v.description),
    status: v.status ?? 'planned',
  };
}
