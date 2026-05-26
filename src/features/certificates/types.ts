import type { CourseEnrollment } from '@/features/course-enrollments/types';

export interface Certificate {
  id: string;
  tenant_id: string;
  course_enrollment_id: string;
  certificate_code: string;
  issued_at: string | null;
  workload_hours: number | string | null;
  verification_url: string | null;
  pdf_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  course_enrollment?: CourseEnrollment | null;
}

export function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
