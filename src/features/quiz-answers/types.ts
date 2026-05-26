import type { LmsQuestion } from '@/features/lms-questions/types';
import type { QuizAttempt } from '@/features/quiz-attempts/types';

export interface QuizAnswer {
  id: string;
  tenant_id: string;
  quiz_attempt_id: string;
  lms_question_id: string;
  answer: unknown[] | Record<string, unknown> | null;
  is_correct: boolean | null;
  score_awarded: number | string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  attempt?: QuizAttempt | null;
  question?: LmsQuestion | null;
}
