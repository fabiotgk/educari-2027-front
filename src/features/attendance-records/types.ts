export type AttendanceStatus = 'present' | 'absent' | 'late' | 'justified' | 'not_required';
export type AttendanceRecordedVia = 'web' | 'mobile_offline' | 'facial' | 'manual';

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  class_diary_id: string | null;
  lesson_date: string | null;
  lesson_number_in_day: number | null;
  status: AttendanceStatus;
  absence_reason_id: string | null;
  notes: string | null;
  recorded_by_user_id: string;
  recorded_via: AttendanceRecordedVia | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AttendanceRecordEnrollment {
  id: string;
  student_name?: string | null;
  class_name?: string | null;
  academic_year?: string | number | null;
}

export interface AttendanceRecordAbsenceReason {
  id: string;
  code?: string | null;
  name?: string | null;
}

export interface AttendanceRecordUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface AttendanceRecordClassDiary {
  id: string;
  academic_year?: string | null;
  class_name?: string | null;
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  absent: 'Ausente',
  late: 'Atraso',
  justified: 'Justificada',
  not_required: 'Não se aplica',
};

export const ATTENDANCE_RECORDED_VIA_LABELS: Record<AttendanceRecordedVia, string> = {
  web: 'Web',
  mobile_offline: 'Aplicativo offline',
  facial: 'Reconhecimento facial',
  manual: 'Manual',
};

export function formatAttendanceRecordEnrollmentLabel(enrollment: AttendanceRecordEnrollment): string {
  const student = enrollment.student_name?.trim();
  const schoolClass = enrollment.class_name?.trim();

  if (student && schoolClass) {
    return `${student} · ${schoolClass}`;
  }

  if (student) return student;
  if (schoolClass) return schoolClass;
  return enrollment.id;
}

export function formatAbsenceReasonLabel(reason: AttendanceRecordAbsenceReason | null | undefined): string {
  if (!reason) return 'Sem justificativa';
  if (reason.name?.trim()) return `${reason.code ? `${reason.code} — ` : ''}${reason.name}`;
  return reason.code ?? reason.id;
}

export function formatUserLabel(user: AttendanceRecordUser | null | undefined): string {
  if (!user) return '—';
  if (user.name?.trim()) return user.name;
  if (user.email?.trim()) return user.email;
  return user.id;
}

export function formatClassDiaryLabel(classDiary: AttendanceRecordClassDiary | null | undefined): string {
  if (!classDiary) return '—';
  if (classDiary.class_name?.trim()) return classDiary.class_name;
  return classDiary.academic_year ? String(classDiary.academic_year) : classDiary.id;
}
