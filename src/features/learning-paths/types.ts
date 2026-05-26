/** Tipos do recurso M32 / Trilhas de aprendizagem — espelham o LearningPathResource do backend. */

export type LearningPathDifficulty = 'easy' | 'medium' | 'hard';

export type LearningPathStatus = 'active' | 'paused' | 'completed';

export interface LearningPath {
  id: string;
  tenant_id: string;
  student_id: string | null;
  subject_id: string | null;
  title: string;
  current_level: string | null;
  difficulty: LearningPathDifficulty | null;
  items: unknown[] | null;
  progress_pct: number | null;
  status: LearningPathStatus | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const DIFFICULTY_LABELS: Record<LearningPathDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export const STATUS_LABELS: Record<LearningPathStatus, string> = {
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Concluída',
};
