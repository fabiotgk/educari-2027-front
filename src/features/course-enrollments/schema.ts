import { z } from 'zod';

import type { CourseEnrollment } from './types';

const STATUSES = ['active', 'completed', 'dropped', 'suspended'] as const;

export const courseEnrollmentSchema = z
  .object({
    course_id: z.string().uuid('Informe um UUID válido para o curso.'),
    student_id: z.string().uuid('Informe um UUID válido para o aluno.').optional().or(z.literal('')),
    user_id: z.string().uuid('Informe um UUID válido para o usuário.').optional().or(z.literal('')),
    status: z.enum(STATUSES),
    progress_percent: z.string().optional(),
    enrolled_at: z.string().optional(),
    completed_at: z.string().optional(),
    final_grade: z.string().optional(),
  })
  .refine((v) => !v.completed_at || !v.enrolled_at || v.completed_at >= v.enrolled_at, {
    path: ['completed_at'],
    message: 'A conclusão deve ser igual ou posterior à matrícula.',
  });

export type CourseEnrollmentFormValues = z.infer<typeof courseEnrollmentSchema>;

export const emptyCourseEnrollmentForm: CourseEnrollmentFormValues = {
  course_id: '',
  student_id: '',
  user_id: '',
  status: 'active',
  progress_percent: '0',
  enrolled_at: '',
  completed_at: '',
  final_grade: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
const dateTimeLocal = (v: string | null) => (v ? v.slice(0, 16) : '');

export function courseEnrollmentToForm(e: CourseEnrollment): CourseEnrollmentFormValues {
  return {
    course_id: e.course_id,
    student_id: e.student_id ?? '',
    user_id: e.user_id ?? '',
    status: e.status,
    progress_percent: e.progress_percent != null ? String(e.progress_percent) : '',
    enrolled_at: dateTimeLocal(e.enrolled_at),
    completed_at: dateTimeLocal(e.completed_at),
    final_grade: e.final_grade != null ? String(e.final_grade) : '',
  };
}

export function buildCourseEnrollmentPayload(v: CourseEnrollmentFormValues): Record<string, unknown> {
  return {
    course_id: v.course_id,
    student_id: blank(v.student_id),
    user_id: blank(v.user_id),
    status: v.status,
    progress_percent: blank(v.progress_percent) !== undefined ? Number(v.progress_percent) : undefined,
    enrolled_at: blank(v.enrolled_at),
    completed_at: blank(v.completed_at),
    final_grade: blank(v.final_grade) !== undefined ? Number(v.final_grade) : undefined,
  };
}
