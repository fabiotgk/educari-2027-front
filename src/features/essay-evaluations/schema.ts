import { z } from 'zod';

import type { EssayEvaluation } from './types';

const ESSAY_EVALUATION_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;

/**
 * Schema do formulário de Avaliação de Redação. Os nomes dos campos espelham o
 * CreateEssayEvaluationRequest / UpdateEssayEvaluationRequest do backend,
 * para que os erros 422 mapeiem direto nos campos via applyApiErrors.
 */
export const essayEvaluationSchema = z.object({
  student_id: z.string().uuid('O identificador do aluno deve ser um UUID válido.').optional().or(z.literal('')),
  prompt_text: z.string().min(1, 'O tema/prompt é obrigatório.').max(10000, 'O texto do prompt não pode exceder 10000 caracteres.'),
  essay_text: z.string().min(1, 'O texto da redação é obrigatório.').max(50000, 'O texto da redação não pode exceder 50000 caracteres.'),
  score: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => {
      if (!v || v.trim() === '') return true;
      const n = Number(v);
      return !isNaN(n) && n >= 0 && n <= 999.99;
    }, 'A nota deve ser um número entre 0 e 999,99.'),
  competencies: z.string().optional(),
  feedback: z.string().max(10000, 'O feedback não pode exceder 10000 caracteres.').optional(),
  status: z.enum(ESSAY_EVALUATION_STATUSES).optional(),
  evaluated_at: z.string().optional().or(z.literal('')),
});

export type EssayEvaluationFormValues = z.infer<typeof essayEvaluationSchema>;

/** Valores iniciais para criação. */
export const emptyEssayEvaluationForm: EssayEvaluationFormValues = {
  student_id: '',
  prompt_text: '',
  essay_text: '',
  score: '',
  competencies: '',
  feedback: '',
  status: 'pending',
  evaluated_at: '',
};

/** Converte um EssayEvaluation (API) nos valores do formulário (para edição). */
export function essayEvaluationToForm(e: EssayEvaluation): EssayEvaluationFormValues {
  return {
    student_id: e.student_id ?? '',
    prompt_text: e.prompt_text,
    essay_text: e.essay_text,
    score: e.score != null ? String(e.score) : '',
    competencies: e.competencies ? JSON.stringify(e.competencies, null, 2) : '',
    feedback: e.feedback ?? '',
    status: e.status,
    evaluated_at: e.evaluated_at ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e convertendo tipos. */
export function buildEssayEvaluationPayload(v: EssayEvaluationFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (blank(v.student_id) !== undefined) {
    payload.student_id = v.student_id;
  }

  payload.prompt_text = v.prompt_text.trim();
  payload.essay_text = v.essay_text.trim();

  if (blank(v.score) !== undefined) {
    payload.score = Number(v.score);
  } else {
    payload.score = null;
  }

  if (blank(v.competencies) !== undefined) {
    try {
      payload.competencies = JSON.parse(v.competencies!);
    } catch {
      payload.competencies = v.competencies;
    }
  } else {
    payload.competencies = null;
  }

  if (blank(v.feedback) !== undefined) {
    payload.feedback = v.feedback;
  } else {
    payload.feedback = null;
  }

  if (v.status) {
    payload.status = v.status;
  }

  if (blank(v.evaluated_at) !== undefined) {
    payload.evaluated_at = v.evaluated_at;
  } else {
    payload.evaluated_at = null;
  }

  return payload;
}
