import type { CourseEnrollment } from '@/features/course-enrollments/types';

export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  id: string;
  tenant_id: string;
  course_enrollment_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  progress_percent: number | string | null;
  time_spent_seconds: number | string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  course_enrollment?: CourseEnrollment | null;
}

export const LESSON_PROGRESS_STATUS_LABELS: Record<LessonProgressStatus, string> = {
  not_started: 'Não iniciado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
};

export function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
