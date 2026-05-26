import type { Course, LmsUserSummary } from '@/features/courses/types';

export interface CourseAnnouncement {
  id: string;
  tenant_id: string;
  course_id: string;
  author_id: string | null;
  title: string;
  body: string;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  course?: Course | null;
  author?: LmsUserSummary | null;
}
