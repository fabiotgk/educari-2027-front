import { z } from 'zod';

import type { LessonProgress } from './types';

const STATUSES = ['not_started', 'in_progress', 'completed'] as const;

export const lessonProgressSchema = z.object({
  course_enrollment_id: z.string().uuid('Informe um UUID válido para a matrícula.'),
  lesson_id: z.string().uuid('Informe um UUID válido para a aula.'),
  status: z.enum(STATUSES),
  progress_percent: z.string().optional(),
  time_spent_seconds: z.string().optional(),
  completed_at: z.string().optional(),
  last_accessed_at: z.string().optional(),
});

export type LessonProgressFormValues = z.infer<typeof lessonProgressSchema>;

export const emptyLessonProgressForm: LessonProgressFormValues = {
  course_enrollment_id: '',
  lesson_id: '',
  status: 'not_started',
  progress_percent: '0',
  time_spent_seconds: '0',
  completed_at: '',
  last_accessed_at: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
const dateTimeLocal = (v: string | null) => (v ? v.slice(0, 16) : '');

export function lessonProgressToForm(p: LessonProgress): LessonProgressFormValues {
  return {
    course_enrollment_id: p.course_enrollment_id,
    lesson_id: p.lesson_id,
    status: p.status,
    progress_percent: p.progress_percent != null ? String(p.progress_percent) : '',
    time_spent_seconds: p.time_spent_seconds != null ? String(p.time_spent_seconds) : '',
    completed_at: dateTimeLocal(p.completed_at),
    last_accessed_at: dateTimeLocal(p.last_accessed_at),
  };
}

export function buildLessonProgressPayload(v: LessonProgressFormValues): Record<string, unknown> {
  return {
    course_enrollment_id: v.course_enrollment_id,
    lesson_id: v.lesson_id,
    status: v.status,
    progress_percent: blank(v.progress_percent) !== undefined ? Number(v.progress_percent) : undefined,
    time_spent_seconds:
      blank(v.time_spent_seconds) !== undefined ? Number(v.time_spent_seconds) : undefined,
    completed_at: blank(v.completed_at),
    last_accessed_at: blank(v.last_accessed_at),
  };
}
