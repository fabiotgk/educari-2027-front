/** Tipos do recurso M22 / Programas FNDE — espelham o FinancialProgramResource do backend. */

export type FinancialProgramStatus = 'open' | 'closed';

export interface FinancialProgram {
  id: string;
  tenant_id: string;
  school_id: string | null;
  name: string;
  exercise_year: string;
  process_number: string | null;
  agreement: string | null;
  funding_source: string | null;
  status: FinancialProgramStatus | null;
  opened_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const FINANCIAL_PROGRAM_STATUS_LABELS: Record<FinancialProgramStatus, string> = {
  open: 'Aberto',
  closed: 'Encerrado',
};
