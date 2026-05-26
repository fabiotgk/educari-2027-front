import { z } from 'zod';

import type { TrainingCourse } from './types';

const TRAINING_COURSE_STATUSES = [
  'planned',
  'open',
  'in_progress',
  'completed',
  'cancelled',
] as const;

/**
 * Schema do formulário de Curso de Capacitação.
 * Os nomes dos campos espelham o CreateTrainingCourseRequest do backend.
 */
export const trainingCourseSchema = z.object({
  academic_year: z.string().min(1, 'O ano letivo é obrigatório.').max(9),
  title: z.string().min(1, 'O título do curso é obrigatório.').max(255),
  description: z.string().optional(),
  period_id: z.string().uuid('UUID inválido.').optional().or(z.literal('')),
  subject_id: z.string().uuid('UUID inválido.').optional().or(z.literal('')),
  target_grades: z.string().optional(),
  starts_on: z.string().optional(),
  ends_on: z.string().optional(),
  workload_hours: z
    .string()
    .refine((v) => v === '' || !isNaN(Number(v)), 'A carga horária deve ser um número.'),
  status: z.enum(TRAINING_COURSE_STATUSES, { error: 'Selecione o status do curso.' }),
  created_by_user_id: z.string().uuid('UUID inválido.').min(1, 'O usuário responsável é obrigatório.'),
});

export type TrainingCourseFormValues = z.infer<typeof trainingCourseSchema>;

/** Valores iniciais para criação. */
export const emptyTrainingCourseForm: TrainingCourseFormValues = {
  academic_year: '',
  title: '',
  description: '',
  period_id: '',
  subject_id: '',
  target_grades: '',
  starts_on: '',
  ends_on: '',
  workload_hours: '',
  status: 'planned',
  created_by_user_id: '',
};

/** Converte um TrainingCourse (API) nos valores do formulário (para edição). */
export function trainingCourseToForm(c: TrainingCourse): TrainingCourseFormValues {
  return {
    academic_year: c.academic_year,
    title: c.title,
    description: c.description ?? '',
    period_id: c.period_id ?? '',
    subject_id: c.subject_id ?? '',
    target_grades: c.target_grades?.join(', ') ?? '',
    starts_on: c.starts_on ? c.starts_on.slice(0, 10) : '',
    ends_on: c.ends_on ? c.ends_on.slice(0, 10) : '',
    workload_hours: c.workload_hours != null ? String(c.workload_hours) : '',
    status: c.status,
    created_by_user_id: c.created_by_user_id ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios. */
export function buildTrainingCoursePayload(v: TrainingCourseFormValues): Record<string, unknown> {
  const rawGrades = blank(v.target_grades);
  const target_grades = rawGrades
    ? rawGrades.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  return {
    academic_year: v.academic_year.trim(),
    title: v.title.trim(),
    description: blank(v.description),
    period_id: blank(v.period_id),
    subject_id: blank(v.subject_id),
    target_grades,
    starts_on: blank(v.starts_on),
    ends_on: blank(v.ends_on),
    workload_hours: blank(v.workload_hours) !== undefined ? Number(v.workload_hours) : 0,
    status: v.status,
    created_by_user_id: v.created_by_user_id.trim(),
  };
}
