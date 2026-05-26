import { z } from 'zod';

import type { AttendanceRecord, AttendanceRecordedVia, AttendanceStatus } from './types';

const ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'late',
  'justified',
  'not_required',
] as const;

const ATTENDANCE_RECORDED_VIA = ['web', 'mobile_offline', 'facial', 'manual'] as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const attendanceRecordSchema = z.object({
  enrollment_id: z.string().uuid('Informe uma matrícula válida.'),
  class_diary_id: z.string().uuid('Informe um diário válido.').optional().or(z.literal('')),
  lesson_date: z.string().regex(DATE_PATTERN, 'Informe uma data no formato AAAA-MM-DD.'),
  lesson_number_in_day: z.string().optional().or(z.literal('')),
  status: z.enum(ATTENDANCE_STATUSES, {
    error: 'Selecione um status válido.',
  }),
  absence_reason_id: z.string().uuid('Informe uma justificativa válida.').optional().or(z.literal('')),
  notes: z.string().max(1000, 'A observação deve ter no máximo 1000 caracteres.').optional(),
  recorded_by_user_id: z.string().uuid('Informe o usuário responsável.'),
  recorded_via: z.enum(ATTENDANCE_RECORDED_VIA).optional().or(z.literal('')),
});

export type AttendanceRecordFormValues = z.infer<typeof attendanceRecordSchema>;

export const emptyAttendanceRecordForm: AttendanceRecordFormValues = {
  enrollment_id: '',
  class_diary_id: '',
  lesson_date: '',
  lesson_number_in_day: '',
  status: 'present',
  absence_reason_id: '',
  notes: '',
  recorded_by_user_id: '',
  recorded_via: '',
};

const cleanText = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export function attendanceRecordToForm(record: AttendanceRecord): AttendanceRecordFormValues {
  return {
    enrollment_id: record.enrollment_id,
    class_diary_id: record.class_diary_id ?? '',
    lesson_date: record.lesson_date?.slice(0, 10) ?? '',
    lesson_number_in_day: record.lesson_number_in_day != null ? String(record.lesson_number_in_day) : '',
    status: record.status as AttendanceStatus,
    absence_reason_id: record.absence_reason_id ?? '',
    notes: record.notes ?? '',
    recorded_by_user_id: record.recorded_by_user_id ?? '',
    recorded_via: record.recorded_via ?? '',
  };
}

export function buildAttendanceRecordPayload(values: AttendanceRecordFormValues): Record<string, unknown> {
  const lessonNumber =
    values.lesson_number_in_day && values.lesson_number_in_day.trim() !== ''
      ? Number(values.lesson_number_in_day)
      : undefined;

  return {
    enrollment_id: values.enrollment_id,
    class_diary_id: cleanText(values.class_diary_id),
    lesson_date: values.lesson_date,
    lesson_number_in_day: Number.isNaN(lessonNumber as number) ? undefined : lessonNumber,
    status: values.status,
    absence_reason_id: cleanText(values.absence_reason_id),
    notes: cleanText(values.notes),
    recorded_by_user_id: values.recorded_by_user_id,
    recorded_via: cleanText(values.recorded_via),
  };
}
