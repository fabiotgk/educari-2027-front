import { z } from 'zod';

import type { StateMealProgram } from './types';

const STATE_MEAL_PROGRAM_STATUSES = ['draft', 'active', 'closed'] as const;

/**
 * Schema do formulário de Programa Estadual de Alimentação Escolar.
 * Os nomes dos campos espelham o CreateStateMealProgramRequest / UpdateStateMealProgramRequest
 * do backend, para que os erros 422 mapeiem direto nos campos via applyApiErrors.
 *
 * Campos numéricos são tratados como string no formulário e convertidos no payload,
 * evitando conflitos de tipagem com zodResolver + inputs HTML.
 */
export const stateMealProgramSchema = z.object({
  name: z.string().min(1, 'O nome do programa é obrigatório.').max(255, 'O nome não pode exceder 255 caracteres.'),
  agreement_number: z.string().max(100, 'O número do convênio não pode exceder 100 caracteres.').optional().or(z.literal('')),
  fiscal_year: z
    .string()
    .min(1, 'O ano fiscal é obrigatório.')
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 2000 && n <= 2100;
    }, { message: 'O ano fiscal deve ser um inteiro entre 2000 e 2100.' }),
  total_value: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => {
      if (!v) return true;
      const n = Number(v);
      return !isNaN(n) && n >= 0;
    }, { message: 'O valor total não pode ser negativo.' }),
  funding_source: z.string().max(255, 'A fonte de financiamento não pode exceder 255 caracteres.').optional().or(z.literal('')),
  status: z.enum(STATE_MEAL_PROGRAM_STATUSES, { error: 'Selecione o status do programa.' }),
  notes: z.string().max(10000, 'As observações não podem exceder 10000 caracteres.').optional().or(z.literal('')),
});

export type StateMealProgramFormValues = z.infer<typeof stateMealProgramSchema>;

/** Valores iniciais para criação. */
export const emptyStateMealProgramForm: StateMealProgramFormValues = {
  name: '',
  agreement_number: '',
  fiscal_year: String(new Date().getFullYear()),
  total_value: '',
  funding_source: '',
  status: 'draft',
  notes: '',
};

/** Converte um StateMealProgram (API) nos valores do formulário (para edição). */
export function stateMealProgramToForm(s: StateMealProgram): StateMealProgramFormValues {
  return {
    name: s.name,
    agreement_number: s.agreement_number ?? '',
    fiscal_year: String(s.fiscal_year),
    total_value: s.total_value != null ? String(s.total_value) : '',
    funding_source: s.funding_source ?? '',
    status: s.status,
    notes: s.notes ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e convertendo números. */
export function buildStateMealProgramPayload(v: StateMealProgramFormValues): Record<string, unknown> {
  const fiscalYearNum = Number(v.fiscal_year);
  const totalValueNum = v.total_value ? Number(v.total_value) : undefined;

  return {
    name: v.name.trim(),
    agreement_number: blank(v.agreement_number),
    fiscal_year: Number.isInteger(fiscalYearNum) ? fiscalYearNum : undefined,
    total_value: totalValueNum != null && !isNaN(totalValueNum) ? totalValueNum : undefined,
    funding_source: blank(v.funding_source),
    status: v.status,
    notes: blank(v.notes),
  };
}
