/** Tipos do recurso M37 / Educação Especial — espelham o PdiPlanResource do backend. */

export type PdiPlanStatus = 'active' | 'inactive' | 'completed' | 'cancelled';

export interface PdiPlan {
  id: string;
  tenant_id: string;
  student_id: string;
  school_id: string | null;
  reference_year: string;
  status: PdiPlanStatus;
  responsible_user_id: string | null;
  started_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const PDI_PLAN_STATUS_LABELS: Record<PdiPlanStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};
