import type { Lesson } from '@/features/lessons/types';
import type { Course } from '@/features/courses/types';
import type { LmsQuestion } from '@/features/lms-questions/types';

export interface LmsQuiz {
  id: string;
  tenant_id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  passing_score: number | string;
  max_attempts: number;
  time_limit_minutes: number | null;
  shuffle_questions: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  course?: Course | null;
  lesson?: Lesson | null;
  questions?: LmsQuestion[] | null;
}
