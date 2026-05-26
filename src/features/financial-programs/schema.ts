import { z } from 'zod';

import type { FinancialProgram } from './types';

const STATUSES = ['open', 'closed'] as const;

/**
 * Schema do formulário de Programa FNDE. Os nomes espelham o
 * CreateFinancialProgramRequest do backend para mapeamento correto de erros 422.
 */
export const financialProgramSchema = z.object({
  school_id: z.string().uuid('UUID inválido.').optional().or(z.literal('')),
  name: z.string().min(1, 'O nome do programa é obrigatório.').max(255),
  exercise_year: z
    .string()
    .regex(/^\d{4}$/, 'O ano de exercício deve ter 4 dígitos.'),
  process_number: z.string().max(64).optional(),
  agreement: z.string().max(64).optional(),
  funding_source: z.string().max(128).optional(),
  status: z.enum(STATUSES).optional(),
  opened_at: z.string().optional(),
  closed_at: z.string().optional(),
});

export type FinancialProgramFormValues = z.infer<typeof financialProgramSchema>;

export const emptyFinancialProgramForm: FinancialProgramFormValues = {
  school_id: '',
  name: '',
  exercise_year: String(new Date().getFullYear()),
  process_number: '',
  agreement: '',
  funding_source: '',
  status: 'open',
  opened_at: '',
  closed_at: '',
};

export function financialProgramToForm(p: FinancialProgram): FinancialProgramFormValues {
  return {
    school_id: p.school_id ?? '',
    name: p.name,
    exercise_year: p.exercise_year,
    process_number: p.process_number ?? '',
    agreement: p.agreement ?? '',
    funding_source: p.funding_source ?? '',
    status: p.status ?? 'open',
    opened_at: p.opened_at ? p.opened_at.slice(0, 10) : '',
    closed_at: p.closed_at ? p.closed_at.slice(0, 10) : '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildFinancialProgramPayload(v: FinancialProgramFormValues): Record<string, unknown> {
  return {
    school_id: blank(v.school_id),
    name: v.name.trim(),
    exercise_year: v.exercise_year,
    process_number: blank(v.process_number),
    agreement: blank(v.agreement),
    funding_source: blank(v.funding_source),
    status: v.status ?? undefined,
    opened_at: blank(v.opened_at),
    closed_at: blank(v.closed_at),
  };
}
