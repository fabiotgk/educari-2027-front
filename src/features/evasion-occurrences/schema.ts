import { z } from 'zod';

import type { EvasionOccurrence } from './types';

const KINDS = ['low_attendance', 'consecutive_absences', 'dropout_risk'] as const;
const ASSIGNED_TO = ['school', 'sme', 'conselho_tutelar', 'ministerio_publico'] as const;
const STATUSES = ['open', 'in_progress', 'escalated', 'resolved', 'closed'] as const;

export const evasionOccurrenceSchema = z.object({
  enrollment_id: z.string().uuid('Informe um UUID válido para a matrícula.'),
  kind: z.enum(KINDS, { error: 'Selecione o tipo de ocorrência.' }),
  assigned_to: z.enum(ASSIGNED_TO, { error: 'Selecione o responsável.' }),
  status: z.enum(STATUSES, { error: 'Selecione o status.' }),
  attendance_pct_at_detection: z.string().optional(),
  consecutive_absences_at_detection: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  detected_at: z.string().optional(),
  resolved_at: z.string().optional(),
});

export type EvasionOccurrenceFormValues = z.infer<typeof evasionOccurrenceSchema>;

export const emptyEvasionOccurrenceForm: EvasionOccurrenceFormValues = {
  enrollment_id: '',
  kind: 'low_attendance',
  assigned_to: 'school',
  status: 'open',
  attendance_pct_at_detection: '',
  consecutive_absences_at_detection: '',
  reason: '',
  notes: '',
  detected_at: '',
  resolved_at: '',
};

const blank = (value: string | undefined) => (value && value.trim() !== '' ? value.trim() : undefined);

const toStringPercent = (value: number | string | null | undefined) =>
  value != null ? String(value) : '';

const toStringInteger = (value: number | string | null | undefined) =>
  value != null ? String(value) : '';

export function evasionOccurrenceToForm(o: EvasionOccurrence): EvasionOccurrenceFormValues {
  return {
    enrollment_id: o.enrollment_id ?? '',
    kind: o.kind,
    assigned_to: o.assigned_to,
    status: o.status,
    attendance_pct_at_detection: toStringPercent(o.attendance_pct_at_detection),
    consecutive_absences_at_detection: toStringInteger(o.consecutive_absences_at_detection),
    reason: o.reason ?? '',
    notes: o.notes ?? '',
    detected_at: o.detected_at ?? '',
    resolved_at: o.resolved_at ?? '',
  };
}

export function buildEvasionOccurrencePayload(
  values: EvasionOccurrenceFormValues,
): Record<string, unknown> {
  return {
    enrollment_id: values.enrollment_id,
    kind: values.kind,
    assigned_to: values.assigned_to,
    status: values.status,
    attendance_pct_at_detection:
      blank(values.attendance_pct_at_detection) !== undefined
        ? Number(values.attendance_pct_at_detection)
        : undefined,
    consecutive_absences_at_detection:
      blank(values.consecutive_absences_at_detection) !== undefined
        ? Number(values.consecutive_absences_at_detection)
        : undefined,
    reason: blank(values.reason),
    notes: blank(values.notes),
    detected_at: blank(values.detected_at),
    resolved_at: blank(values.resolved_at),
  };
}
