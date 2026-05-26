import type { Lesson } from '@/features/lessons/types';

export interface LessonMaterial {
  id: string;
  tenant_id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size_kb: number | null;
  position: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  lesson?: Lesson | null;
}
