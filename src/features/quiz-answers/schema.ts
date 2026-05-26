import { z } from 'zod';

import type { QuizAnswer } from './types';

const NULLABLE_BOOL = ['unset', 'true', 'false'] as const;

const isJsonArray = (value: string | undefined) => {
  if (!value || value.trim() === '') return true;
  try {
    return Array.isArray(JSON.parse(value));
  } catch {
    return false;
  }
};

const jsonText = (value: unknown) => JSON.stringify(value ?? [], null, 2);
const parseJsonArray = (value: string | undefined): unknown[] | undefined =>
  value && value.trim() !== '' ? (JSON.parse(value) as unknown[]) : undefined;
const boolToForm = (v: boolean | null): QuizAnswerFormValues['is_correct'] =>
  v === null ? 'unset' : v ? 'true' : 'false';
const boolToPayload = (v: QuizAnswerFormValues['is_correct']) =>
  v === 'unset' ? undefined : v === 'true';

export const quizAnswerSchema = z.object({
  quiz_attempt_id: z.string().uuid('Informe um UUID válido.'),
  lms_question_id: z.string().uuid('Informe um UUID válido.'),
  answer: z.string().optional().refine(isJsonArray, 'Informe um JSON de array válido.'),
  is_correct: z.enum(NULLABLE_BOOL),
  score_awarded: z.string().optional().refine((v) => !v || Number(v) >= 0, 'Informe um número maior ou igual a 0.'),
});

export type QuizAnswerFormValues = z.infer<typeof quizAnswerSchema>;

export const emptyQuizAnswerForm: QuizAnswerFormValues = {
  quiz_attempt_id: '',
  lms_question_id: '',
  answer: '',
  is_correct: 'unset',
  score_awarded: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function quizAnswerToForm(a: QuizAnswer): QuizAnswerFormValues {
  return {
    quiz_attempt_id: a.quiz_attempt_id,
    lms_question_id: a.lms_question_id,
    answer: a.answer ? jsonText(a.answer) : '',
    is_correct: boolToForm(a.is_correct),
    score_awarded: a.score_awarded != null ? String(a.score_awarded) : '',
  };
}

export function buildQuizAnswerPayload(v: QuizAnswerFormValues): Record<string, unknown> {
  return {
    quiz_attempt_id: v.quiz_attempt_id,
    lms_question_id: v.lms_question_id,
    answer: parseJsonArray(v.answer),
    is_correct: boolToPayload(v.is_correct),
    score_awarded: blank(v.score_awarded) !== undefined ? Number(v.score_awarded) : undefined,
  };
}
