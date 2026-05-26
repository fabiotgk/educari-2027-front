import { z } from 'zod';

import type { EvasionAlert } from './types';

const SCOPES = ['monthly', 'period', 'custom'] as const;

export const evasionAlertSchema = z.object({
  school_id: z.string().uuid('Informe um UUID válido da escola.').optional().or(z.literal('')),
  name: z.string().max(128, 'O nome deve ter no máximo 128 caracteres.').min(1, 'O nome é obrigatório.'),
  scope: z.enum(SCOPES, { error: 'Selecione o escopo.' }),
  min_attendance_pct: z.string().optional(),
  max_consecutive_absences: z.string().optional(),
  is_active: z.boolean(),
});

export type EvasionAlertFormValues = z.infer<typeof evasionAlertSchema>;

export const emptyEvasionAlertForm: EvasionAlertFormValues = {
  school_id: '',
  name: '',
  scope: 'monthly',
  min_attendance_pct: '',
  max_consecutive_absences: '',
  is_active: true,
};

const blank = (value: string | undefined) => (value && value.trim() !== '' ? value.trim() : undefined);

const toStringPercent = (value: number | string | null | undefined) =>
  value != null ? String(value) : '';

const toStringInteger = (value: number | string | null | undefined) =>
  value != null ? String(value) : '';

export function evasionAlertToForm(alert: EvasionAlert): EvasionAlertFormValues {
  return {
    school_id: alert.school_id ?? '',
    name: alert.name,
    scope: alert.scope,
    min_attendance_pct: toStringPercent(alert.min_attendance_pct),
    max_consecutive_absences: toStringInteger(alert.max_consecutive_absences),
    is_active: alert.is_active,
  };
}

export function buildEvasionAlertPayload(values: EvasionAlertFormValues): Record<string, unknown> {
  return {
    school_id: blank(values.school_id),
    name: values.name.trim(),
    scope: values.scope,
    min_attendance_pct:
      blank(values.min_attendance_pct) !== undefined ? Number(values.min_attendance_pct) : undefined,
    max_consecutive_absences:
      blank(values.max_consecutive_absences) !== undefined
        ? Number(values.max_consecutive_absences)
        : undefined,
    is_active: values.is_active,
  };
}
