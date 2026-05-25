import { z } from 'zod';
import type { SchoolCalendar } from './types';

const CALENDAR_EVENT_KINDS = [
  'school_day',
  'holiday',
  'recess',
  'event',
  'pedagogical_meeting',
  'evaluation_day',
] as const;

/**
 * Schema do formulário de Calendário Letivo. Os nomes dos campos espelham
 * CreateSchoolCalendarRequest do backend.
 */
export const schoolCalendarSchema = z.object({
  school_id: z.string().uuid('UUID inválido.').optional().or(z.literal('')),
  academic_year: z
    .string()
    .regex(/^\d{4}$/, 'O ano letivo deve ter 4 dígitos.')
    .min(1, 'O ano letivo é obrigatório.'),
  name: z.string().min(1, 'O nome do calendário é obrigatório.').max(128),
  starts_at: z.string().min(1, 'A data de início é obrigatória.'),
  ends_at: z.string().min(1, 'A data de término é obrigatória.'),
  total_school_days_planned: z.string().optional(),
});

export type SchoolCalendarFormValues = z.infer<typeof schoolCalendarSchema>;

/** Valores iniciais para criação. */
export const emptySchoolCalendarForm: SchoolCalendarFormValues = {
  school_id: '',
  academic_year: String(new Date().getFullYear()),
  name: '',
  starts_at: '',
  ends_at: '',
  total_school_days_planned: '',
};

/** Converte um SchoolCalendar (API) nos valores do formulário (para edição). */
export function schoolCalendarToForm(c: SchoolCalendar): SchoolCalendarFormValues {
  return {
    school_id: c.school_id ?? '',
    academic_year: c.academic_year,
    name: c.name,
    starts_at: c.starts_at ? c.starts_at.split('T')[0] : '',
    ends_at: c.ends_at ? c.ends_at.split('T')[0] : '',
    total_school_days_planned:
      c.total_school_days_planned != null ? String(c.total_school_days_planned) : '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API. */
export function buildSchoolCalendarPayload(v: SchoolCalendarFormValues): Record<string, unknown> {
  const days = blank(v.total_school_days_planned);
  return {
    school_id: blank(v.school_id),
    academic_year: v.academic_year.trim(),
    name: v.name.trim(),
    starts_at: v.starts_at,
    ends_at: v.ends_at,
    total_school_days_planned: days !== undefined ? Number(days) : undefined,
  };
}

// Re-export dos tipos de evento para uso nos schemas de eventos
export { CALENDAR_EVENT_KINDS };
