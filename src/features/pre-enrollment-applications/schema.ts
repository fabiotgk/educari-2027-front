import { z } from 'zod';
import type { PreEnrollmentApplication } from './types';

/**
 * Schema de edição de Pré-Matrícula. Espelha UpdatePreEnrollmentApplicationRequest.
 * Nota: criação via portal público — aqui o admin edita dados complementares.
 */
export const preEnrollmentUpdateSchema = z.object({
  notes: z.string().optional(),
  desired_education_level_id: z
    .string()
    .uuid('UUID inválido.')
    .optional()
    .or(z.literal('')),
  desired_school_grade_id: z
    .string()
    .uuid('UUID inválido.')
    .optional()
    .or(z.literal('')),
  desired_period_id: z
    .string()
    .uuid('UUID inválido.')
    .optional()
    .or(z.literal('')),
  // student_data (editável como sub-objeto plano)
  student_name: z.string().optional(),
  student_birth_date: z.string().optional(),
  // guardian_data (editável como sub-objeto plano)
  guardian_name: z.string().optional(),
  guardian_email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  guardian_phone: z.string().optional(),
});

export type PreEnrollmentUpdateFormValues = z.infer<typeof preEnrollmentUpdateSchema>;

/** Valores iniciais (edição). */
export function preEnrollmentToForm(
  a: PreEnrollmentApplication,
): PreEnrollmentUpdateFormValues {
  return {
    notes: a.notes ?? '',
    desired_education_level_id: a.desired_education_level_id ?? '',
    desired_school_grade_id: a.desired_school_grade_id ?? '',
    desired_period_id: a.desired_period_id ?? '',
    student_name: String(a.student_data?.name ?? ''),
    student_birth_date: String(a.student_data?.birth_date ?? ''),
    guardian_name: String(a.guardian_data?.name ?? ''),
    guardian_email: String(a.guardian_data?.email ?? ''),
    guardian_phone: String(a.guardian_data?.phone ?? ''),
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para PATCH. Somente campos editáveis do UpdateRequest. */
export function buildPreEnrollmentPayload(
  v: PreEnrollmentUpdateFormValues,
  original: PreEnrollmentApplication,
): Record<string, unknown> {
  // Merge student_data com novos valores sem sobrescrever campos não expostos
  const student_data =
    v.student_name || v.student_birth_date
      ? {
          ...(original.student_data ?? {}),
          name: blank(v.student_name) ?? original.student_data?.name,
          birth_date: blank(v.student_birth_date) ?? original.student_data?.birth_date,
        }
      : undefined;

  const guardian_data =
    v.guardian_name || v.guardian_email || v.guardian_phone
      ? {
          ...(original.guardian_data ?? {}),
          name: blank(v.guardian_name) ?? original.guardian_data?.name,
          email: blank(v.guardian_email) ?? original.guardian_data?.email,
          phone: blank(v.guardian_phone) ?? original.guardian_data?.phone,
        }
      : undefined;

  return {
    notes: blank(v.notes),
    desired_education_level_id: blank(v.desired_education_level_id),
    desired_school_grade_id: blank(v.desired_school_grade_id),
    desired_period_id: blank(v.desired_period_id),
    student_data,
    guardian_data,
  };
}
