import { z } from 'zod';

import type { LmsQuiz } from './types';

export const lmsQuizSchema = z.object({
  course_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
  lesson_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
  title: z.string().min(1, 'O título do questionário é obrigatório.').max(255),
  description: z.string().max(5000).optional(),
  passing_score: z
    .string()
    .min(1, 'A nota de corte é obrigatória.')
    .refine((v) => Number(v) >= 0 && Number(v) <= 100, 'Informe um número entre 0 e 100.'),
  max_attempts: z
    .string()
    .min(1, 'O número máximo de tentativas é obrigatório.')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'Informe um inteiro maior ou igual a 1.'),
  time_limit_minutes: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 1), 'Informe um inteiro maior ou igual a 1.'),
  shuffle_questions: z.boolean(),
  is_published: z.boolean(),
});

export type LmsQuizFormValues = z.infer<typeof lmsQuizSchema>;

export const emptyLmsQuizForm: LmsQuizFormValues = {
  course_id: '',
  lesson_id: '',
  title: '',
  description: '',
  passing_score: '60',
  max_attempts: '1',
  time_limit_minutes: '',
  shuffle_questions: false,
  is_published: false,
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function lmsQuizToForm(q: LmsQuiz): LmsQuizFormValues {
  return {
    course_id: q.course_id ?? '',
    lesson_id: q.lesson_id ?? '',
    title: q.title,
    description: q.description ?? '',
    passing_score: String(q.passing_score),
    max_attempts: String(q.max_attempts),
    time_limit_minutes: q.time_limit_minutes != null ? String(q.time_limit_minutes) : '',
    shuffle_questions: q.shuffle_questions,
    is_published: q.is_published,
  };
}

export function buildLmsQuizPayload(v: LmsQuizFormValues): Record<string, unknown> {
  return {
    course_id: blank(v.course_id),
    lesson_id: blank(v.lesson_id),
    title: v.title.trim(),
    description: blank(v.description),
    passing_score: Number(v.passing_score),
    max_attempts: Number(v.max_attempts),
    time_limit_minutes: blank(v.time_limit_minutes) !== undefined ? Number(v.time_limit_minutes) : undefined,
    shuffle_questions: v.shuffle_questions,
    is_published: v.is_published,
  };
}
