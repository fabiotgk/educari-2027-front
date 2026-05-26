/** Tipos do recurso M34 / Banco de Questões — espelham QuestionBankResource e QuestionResource do backend. */

export interface QuestionBank {
  id: string;
  tenant_id: string;
  name: string;
  subject_id: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'open';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Múltipla escolha',
  true_false: 'Verdadeiro/Falso',
  open: 'Aberta',
};

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export interface Question {
  id: string;
  tenant_id: string;
  question_bank_id: string;
  statement: string;
  type: QuestionType;
  difficulty: QuestionDifficulty | null;
  skill_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
