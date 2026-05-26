/** Tipos do recurso M29 / IA Avaliação Textual — espelham o EssayEvaluationResource do backend. */

export type EssayEvaluationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EssayEvaluationStudent {
  id: string;
  full_name: string;
}

export interface EssayEvaluation {
  id: string;
  tenant_id: string;
  student_id: string | null;
  prompt_text: string;
  essay_text: string;
  score: number | null;
  competencies: Record<string, unknown> | null;
  feedback: string | null;
  status: EssayEvaluationStatus;
  evaluated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  student: EssayEvaluationStudent | null;
}

export const ESSAY_EVALUATION_STATUS_LABELS: Record<EssayEvaluationStatus, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluída',
  failed: 'Falhou',
};
