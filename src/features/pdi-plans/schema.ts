import { z } from 'zod';

import type { PdiPlan } from './types';

const STATUSES = ['active', 'inactive', 'completed', 'cancelled'] as const;

/**
 * Schema do formulário de PDI. Os nomes espelham o
 * CreatePdiPlanRequest do backend para mapeamento correto de erros 422.
 */
export const pdiPlanSchema = z.object({
  student_id: z
    .string()
    .min(1, 'O aluno é obrigatório.')
    .uuid('UUID inválido para o aluno.'),
  school_id: z.string().uuid('UUID inválido para a escola.').optional().or(z.literal('')),
  reference_year: z
    .string()
    .regex(/^\d{4}$/, 'O ano de referência deve ter 4 dígitos.'),
  status: z.enum(STATUSES).optional(),
  responsible_user_id: z
    .string()
    .uuid('UUID inválido para o responsável.')
    .optional()
    .or(z.literal('')),
  started_at: z.string().optional(),
});

export type PdiPlanFormValues = z.infer<typeof pdiPlanSchema>;

export const emptyPdiPlanForm: PdiPlanFormValues = {
  student_id: '',
  school_id: '',
  reference_year: String(new Date().getFullYear()),
  status: 'active',
  responsible_user_id: '',
  started_at: '',
};

export function pdiPlanToForm(p: PdiPlan): PdiPlanFormValues {
  return {
    student_id: p.student_id,
    school_id: p.school_id ?? '',
    reference_year: p.reference_year,
    status: p.status,
    responsible_user_id: p.responsible_user_id ?? '',
    started_at: p.started_at ? p.started_at.slice(0, 10) : '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildPdiPlanPayload(v: PdiPlanFormValues): Record<string, unknown> {
  return {
    student_id: v.student_id,
    school_id: blank(v.school_id),
    reference_year: v.reference_year,
    status: v.status ?? undefined,
    responsible_user_id: blank(v.responsible_user_id),
    started_at: blank(v.started_at),
  };
}
