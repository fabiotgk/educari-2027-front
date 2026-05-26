import { z } from 'zod';

import type { LmsQuestion } from './types';

const QUESTION_TYPES = ['single_choice', 'multiple_choice', 'true_false', 'essay'] as const;

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

export const lmsQuestionSchema = z.object({
  lms_quiz_id: z.string().uuid('Informe um UUID válido.'),
  statement: z.string().min(1, 'O enunciado da questão é obrigatório.').max(5000),
  type: z.enum(QUESTION_TYPES, { error: 'Selecione o tipo da questão.' }),
  options: z.string().optional().refine(isJsonArray, 'Informe um JSON de array válido.'),
  correct_answer: z.string().optional().refine(isJsonArray, 'Informe um JSON de array válido.'),
  score: z.string().min(1, 'A pontuação é obrigatória.').refine((v) => Number(v) >= 0, 'Informe um número maior ou igual a 0.'),
  position: z.string().min(1, 'A posição é obrigatória.').refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Informe um inteiro maior ou igual a 0.'),
  feedback: z.string().max(5000).optional(),
});

export type LmsQuestionFormValues = z.infer<typeof lmsQuestionSchema>;

export const emptyLmsQuestionForm: LmsQuestionFormValues = {
  lms_quiz_id: '',
  statement: '',
  type: 'single_choice',
  options: '',
  correct_answer: '',
  score: '1',
  position: '0',
  feedback: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function lmsQuestionToForm(q: LmsQuestion): LmsQuestionFormValues {
  return {
    lms_quiz_id: q.lms_quiz_id,
    statement: q.statement,
    type: q.type,
    options: q.options ? jsonText(q.options) : '',
    correct_answer: q.correct_answer ? jsonText(q.correct_answer) : '',
    score: String(q.score),
    position: String(q.position),
    feedback: q.feedback ?? '',
  };
}

export function buildLmsQuestionPayload(v: LmsQuestionFormValues): Record<string, unknown> {
  return {
    lms_quiz_id: v.lms_quiz_id,
    statement: v.statement.trim(),
    type: v.type,
    options: parseJsonArray(v.options),
    correct_answer: parseJsonArray(v.correct_answer),
    score: Number(v.score),
    position: Number(v.position),
    feedback: blank(v.feedback),
  };
}
