export type GradeKind = 'period' | 'activity' | 'recovery';

export const GRADE_KIND_LABELS: Record<GradeKind, string> = {
  period: 'Período',
  activity: 'Atividade',
  recovery: 'Recuperação',
};

export interface GradeStudent {
  id: string;
  full_name?: string | null;
  name?: string | null;
}

export interface GradeClass {
  id: string;
  name?: string | null;
}

export interface GradeEnrollment {
  id: string;
  student_id: string | null;
  class_id?: string | null;
  student?: GradeStudent | null;
  class?: GradeClass | null;
}

export interface GradeSubject {
  id: string;
  name?: string | null;
}

export interface GradeEvaluationPeriod {
  id: string;
  name?: string | null;
}

export interface Grade {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  subject_id: string;
  evaluation_period_id: string;
  kind: GradeKind;
  activity_label: string | null;
  weight: number | string | null;
  score_numeric: number | string | null;
  score_concept: string | null;
  score_descriptive: string | null;
  recorded_by_user_id: string | null;
  recorded_at: string | null;
  is_recovered: boolean;
  notes: string | null;
  enrollment?: GradeEnrollment | null;
  subject?: GradeSubject | null;
  evaluation_period?: GradeEvaluationPeriod | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GradeAuditLog {
  id: string;
  tenant_id: string;
  grade_id: string;
  old_score: number | string | null;
  new_score: number | string | null;
  justification: string | null;
  changed_by_user_id: string | null;
  changed_at: string | null;
  grade?: { id: string } | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReleaseEnrollmentRow {
  id: string;
  student_id: string | null;
  student?: {
    id: string;
    full_name?: string | null;
    name?: string | null;
  } | null;
  class?: {
    id: string;
    name?: string | null;
  } | null;
}
