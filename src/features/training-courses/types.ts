/** Tipos do recurso M16 / Capacitação — espelham o TrainingCourseResource do backend. */

export type TrainingCourseStatus =
  | 'planned'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface TrainingCourse {
  id: string;
  tenant_id: string;
  academic_year: string;
  title: string;
  description: string | null;
  period_id: string | null;
  subject_id: string | null;
  target_grades: string[] | null;
  starts_on: string | null;
  ends_on: string | null;
  workload_hours: string | number;
  status: TrainingCourseStatus;
  created_by_user_id: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const TRAINING_COURSE_STATUS_LABELS: Record<TrainingCourseStatus, string> = {
  planned: 'Planejado',
  open: 'Aberto',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};
