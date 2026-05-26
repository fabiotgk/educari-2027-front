import { z } from 'zod';

import type { QuizAttempt } from './types';

const ATTEMPT_STATUSES = ['in_progress', 'submitted', 'graded'] as const;
const NULLABLE_BOOL = ['unset', 'true', 'false'] as const;

export const quizAttemptSchema = z.object({
  lms_quiz_id: z.string().uuid('Informe um UUID válido.'),
  student_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
  user_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
  attempt_number: z
    .string()
    .min(1, 'O número da tentativa é obrigatório.')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'Informe um inteiro maior ou igual a 1.'),
  score: z.string().optional().refine((v) => !v || Number(v) >= 0, 'Informe um número maior ou igual a 0.'),
  status: z.enum(ATTEMPT_STATUSES, { error: 'Selecione o status da tentativa.' }),
  started_at: z.string().optional(),
  submitted_at: z.string().optional(),
  passed: z.enum(NULLABLE_BOOL),
});

export type QuizAttemptFormValues = z.infer<typeof quizAttemptSchema>;

export const emptyQuizAttemptForm: QuizAttemptFormValues = {
  lms_quiz_id: '',
  student_id: '',
  user_id: '',
  attempt_number: '1',
  score: '',
  status: 'in_progress',
  started_at: '',
  submitted_at: '',
  passed: 'unset',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
const dateTimeLocal = (v: string | null) => (v ? v.slice(0, 16) : '');
const nullableBoolToForm = (v: boolean | null): QuizAttemptFormValues['passed'] =>
  v === null ? 'unset' : v ? 'true' : 'false';
const nullableBoolToPayload = (v: QuizAttemptFormValues['passed']) =>
  v === 'unset' ? undefined : v === 'true';

export function quizAttemptToForm(a: QuizAttempt): QuizAttemptFormValues {
  return {
    lms_quiz_id: a.lms_quiz_id,
    student_id: a.student_id ?? '',
    user_id: a.user_id ?? '',
    attempt_number: String(a.attempt_number),
    score: a.score != null ? String(a.score) : '',
    status: a.status,
    started_at: dateTimeLocal(a.started_at),
    submitted_at: dateTimeLocal(a.submitted_at),
    passed: nullableBoolToForm(a.passed),
  };
}

export function buildQuizAttemptPayload(v: QuizAttemptFormValues): Record<string, unknown> {
  return {
    lms_quiz_id: v.lms_quiz_id,
    student_id: blank(v.student_id),
    user_id: blank(v.user_id),
    attempt_number: Number(v.attempt_number),
    score: blank(v.score) !== undefined ? Number(v.score) : undefined,
    status: v.status,
    started_at: blank(v.started_at),
    submitted_at: blank(v.submitted_at),
    passed: nullableBoolToPayload(v.passed),
  };
}
