import type { Course } from '@/features/courses/types';

export interface CourseModule {
  id: string;
  tenant_id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  course?: Course | null;
}
