export type CourseEnrollmentStatus = 'active' | 'completed' | 'dropped' | 'suspended';

export interface StudentSummary {
  id: string;
  name: string;
}

export interface LmsUserSummary {
  id: string;
  name: string;
  email?: string | null;
}

export interface CourseEnrollment {
  id: string;
  tenant_id: string;
  course_id: string;
  student_id: string | null;
  user_id: string | null;
  status: CourseEnrollmentStatus;
  progress_percent: number | string | null;
  enrolled_at: string | null;
  completed_at: string | null;
  final_grade: number | string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  user?: LmsUserSummary | null;
  student?: StudentSummary | null;
}

export const COURSE_ENROLLMENT_STATUS_LABELS: Record<CourseEnrollmentStatus, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  dropped: 'Desistente',
  suspended: 'Suspensa',
};

export function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
