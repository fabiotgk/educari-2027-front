import { z } from 'zod';

import type { LearningExpectation } from './types';

const trimOrUndefined = (value: string | undefined): string | undefined =>
  value && value.trim() !== '' ? value.trim() : undefined;

export const learningExpectationSchema = z.object({
  bncc_code: z.string().trim().min(1, 'O código BNCC é obrigatório.').max(32),
  school_grade_id: z.string().uuid('Informe uma série válida.'),
  subject_id: z.string().uuid('Informe um componente curricular válido.'),
  description: z.string().trim().min(1, 'A descrição da habilidade é obrigatória.'),
  is_active: z.boolean(),
});

export type LearningExpectationFormValues = z.infer<typeof learningExpectationSchema>;

export const emptyLearningExpectationForm: LearningExpectationFormValues = {
  bncc_code: '',
  school_grade_id: '',
  subject_id: '',
  description: '',
  is_active: true,
};

export function learningExpectationToForm(expectation: LearningExpectation): LearningExpectationFormValues {
  return {
    bncc_code: expectation.bncc_code,
    school_grade_id: expectation.school_grade_id,
    subject_id: expectation.subject_id,
    description: expectation.description,
    is_active: expectation.is_active,
  };
}

export function buildLearningExpectationPayload(values: LearningExpectationFormValues): Record<string, unknown> {
  return {
    bncc_code: values.bncc_code.trim(),
    school_grade_id: values.school_grade_id,
    subject_id: values.subject_id,
    description: trimOrUndefined(values.description),
    is_active: values.is_active,
  };
}

