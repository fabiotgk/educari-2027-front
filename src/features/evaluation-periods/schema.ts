import { z } from 'zod';

import type { EvaluationPeriod } from './types';

const trimOrUndefined = (value: string | undefined): string | undefined =>
  value && value.trim() !== '' ? value.trim() : undefined;

const schoolId = () => z.string().uuid('Informe uma escola válida.').optional().or(z.literal(''));
const closingDate = z.union([
  z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data de fechamento no formato AAAA-MM-DD.'),
  z.literal(''),
  z.undefined(),
]);
const order = z
  .string()
  .trim()
  .min(1, 'A ordem é obrigatória.')
  .refine((value) => /^\d+$/.test(value), 'Informe a ordem em formato numérico inteiro.');

export const evaluationPeriodSchema = z
  .object({
    school_id: schoolId(),
    academic_year: z
      .string()
      .regex(/^\d{4}$/, 'Informe o ano letivo com 4 dígitos.')
      .min(1, 'O ano letivo é obrigatório.'),
    code: z.string().trim().min(1, 'O código do período é obrigatório.').max(16, 'O código do período é muito longo.'),
    name: z.string().trim().min(1, 'O nome do período é obrigatório.').max(64, 'O nome do período é muito longo.'),
    order,
    starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data de início no formato AAAA-MM-DD.'),
    ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data de término no formato AAAA-MM-DD.'),
    closing_date: closingDate,
    is_closed: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.ends_at < values.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ends_at'],
        message: 'A data de término deve ser igual ou posterior à data de início.',
      });
    }
  });

export type EvaluationPeriodFormValues = z.infer<typeof evaluationPeriodSchema>;

export const emptyEvaluationPeriodForm: EvaluationPeriodFormValues = {
  school_id: '',
  academic_year: String(new Date().getFullYear()),
  code: '',
  name: '',
  order: '',
  starts_at: '',
  ends_at: '',
  closing_date: '',
  is_closed: false,
};

export function evaluationPeriodToForm(evaluationPeriod: EvaluationPeriod): EvaluationPeriodFormValues {
  return {
    school_id: evaluationPeriod.school_id ?? '',
    academic_year: evaluationPeriod.academic_year,
    code: evaluationPeriod.code,
    name: evaluationPeriod.name,
    order: String(evaluationPeriod.order),
    starts_at: trimOrUndefined(evaluationPeriod.starts_at ?? undefined) ?? '',
    ends_at: trimOrUndefined(evaluationPeriod.ends_at ?? undefined) ?? '',
    closing_date: trimOrUndefined(evaluationPeriod.closing_date ?? undefined) ?? '',
    is_closed: evaluationPeriod.is_closed,
  };
}

export function buildEvaluationPeriodPayload(values: EvaluationPeriodFormValues): Record<string, unknown> {
  return {
    school_id: trimOrUndefined(values.school_id),
    academic_year: values.academic_year.trim(),
    code: values.code.trim(),
    name: values.name.trim(),
    order: Number(values.order),
    starts_at: values.starts_at,
    ends_at: values.ends_at,
    closing_date: trimOrUndefined(values.closing_date) ?? undefined,
    is_closed: values.is_closed,
  };
}
