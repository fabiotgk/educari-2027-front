import type { LmsQuiz } from '@/features/lms-quizzes/types';
import type { QuizAnswer } from '@/features/quiz-answers/types';

export type QuizAttemptStatus = 'in_progress' | 'submitted' | 'graded';

export interface QuizAttempt {
  id: string;
  tenant_id: string;
  lms_quiz_id: string;
  student_id: string | null;
  user_id: string | null;
  attempt_number: number;
  score: number | string | null;
  status: QuizAttemptStatus;
  started_at: string | null;
  submitted_at: string | null;
  passed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  quiz?: LmsQuiz | null;
  answers?: QuizAnswer[] | null;
}

export const QUIZ_ATTEMPT_STATUS_LABELS: Record<QuizAttemptStatus, string> = {
  in_progress: 'Em andamento',
  submitted: 'Enviada',
  graded: 'Corrigida',
};
