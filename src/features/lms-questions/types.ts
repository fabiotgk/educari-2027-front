import type { LmsQuiz } from '@/features/lms-quizzes/types';

export type LmsQuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'essay';

export interface LmsQuestion {
  id: string;
  tenant_id: string;
  lms_quiz_id: string;
  statement: string;
  type: LmsQuestionType;
  options: unknown[] | Record<string, unknown> | null;
  correct_answer: unknown[] | Record<string, unknown> | null;
  score: number | string;
  position: number;
  feedback: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  quiz?: LmsQuiz | null;
}

export const LMS_QUESTION_TYPE_LABELS: Record<LmsQuestionType, string> = {
  single_choice: 'Escolha única',
  multiple_choice: 'Múltipla escolha',
  true_false: 'Verdadeiro ou falso',
  essay: 'Dissertativa',
};
