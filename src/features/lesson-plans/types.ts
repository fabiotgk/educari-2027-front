export type LessonPlanApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface LessonPlan {
  id: string;
  tenant_id: string;
  class_diary_id: string;
  evaluation_period_id: string;
  planned_lessons: number;
  taught_lessons: number | null;
  goals: string | null;
  content: string[] | null;
  expected_competencies: string[] | null;
  approval_status: LessonPlanApprovalStatus;
  approved_at: string | null;
  approved_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const LESSON_PLAN_APPROVAL_LABELS: Record<LessonPlanApprovalStatus, string> = {
  draft: 'Rascunho',
  submitted: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export const LESSON_PLAN_APPROVAL_VARIANTS: Record<LessonPlanApprovalStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

export function lessonPlanApprovalLabel(status: LessonPlanApprovalStatus): string {
  return LESSON_PLAN_APPROVAL_LABELS[status] ?? 'Pendente';
}

export function lessonPlanApprovalVariant(
  status: LessonPlanApprovalStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  return LESSON_PLAN_APPROVAL_VARIANTS[status] ?? 'secondary';
}
