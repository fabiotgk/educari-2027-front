export interface LearningExpectation {
  id: string;
  tenant_id: string;
  bncc_code: string;
  school_grade_id: string;
  subject_id: string;
  description: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export function learningExpectationActiveLabel(isActive: boolean): string {
  return isActive ? 'Ativa' : 'Inativa';
}

