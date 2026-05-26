import type { CourseModule } from '@/features/course-modules/types';

export type LessonContentType = 'video' | 'text' | 'pdf' | 'scorm' | 'link' | 'quiz';

export interface Lesson {
  id: string;
  tenant_id: string;
  course_module_id: string;
  title: string;
  content_type: LessonContentType | null;
  content_url: string | null;
  content_body: string | null;
  duration_minutes: number | null;
  position: number | null;
  is_preview: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  course_module?: CourseModule | null;
}

export const LESSON_CONTENT_TYPE_LABELS: Record<LessonContentType, string> = {
  video: 'Vídeo',
  text: 'Texto',
  pdf: 'PDF',
  scorm: 'SCORM',
  link: 'Link',
  quiz: 'Questionário',
};
