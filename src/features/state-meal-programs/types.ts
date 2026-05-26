/** Tipos do recurso M36 / PNAE Estadual — espelham o StateMealProgramResource do backend. */

export type StateMealProgramStatus = 'draft' | 'active' | 'closed';

export interface StateMealProgram {
  id: string;
  tenant_id: string;
  name: string;
  agreement_number: string | null;
  fiscal_year: number;
  total_value: number | null;
  funding_source: string | null;
  status: StateMealProgramStatus;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const STATE_MEAL_PROGRAM_STATUS_LABELS: Record<StateMealProgramStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  closed: 'Encerrado',
};
