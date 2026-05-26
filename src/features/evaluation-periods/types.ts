export interface EvaluationPeriod {
  id: string;
  tenant_id: string;
  school_id: string | null;
  academic_year: string;
  code: string;
  name: string;
  order: number;
  starts_at: string | null;
  ends_at: string | null;
  closing_date: string | null;
  is_closed: boolean;
  closed_at: string | null;
  closed_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function evaluationPeriodStatusLabel(isClosed: boolean): string {
  return isClosed ? 'Fechado' : 'Aberto';
}
