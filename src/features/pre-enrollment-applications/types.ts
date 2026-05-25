/** Tipos do recurso M02 / Pré-Matrícula — espelham PreEnrollmentApplicationResource do backend. */

export type PreEnrollmentStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'placed'
  | 'waitlisted'
  | 'cancelled'
  | 'expired';

export interface StudentData {
  name?: string;
  birth_date?: string;
  cpf?: string;
  rg?: string;
  [key: string]: unknown;
}

export interface GuardianData {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  [key: string]: unknown;
}

export interface AddressData {
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  [key: string]: unknown;
}

export interface PreEnrollmentApplication {
  id: string;
  tenant_id: string;
  period_id: string;
  protocol_number: string;
  status: PreEnrollmentStatus;
  applicant_user_id: string | null;
  student_data: StudentData | null;
  guardian_data: GuardianData | null;
  address_data: AddressData | null;
  documents: Record<string, unknown>[] | null;
  desired_education_level_id: string | null;
  desired_school_grade_id: string | null;
  desired_period_id: string | null;
  desired_school_ids: string[] | null;
  placed_class_id: string | null;
  placed_at: string | null;
  accepted_terms_at: string | null;
  terms_text_hash: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const PRE_ENROLLMENT_STATUS_LABELS: Record<PreEnrollmentStatus, string> = {
  submitted: 'Enviada',
  under_review: 'Em análise',
  approved: 'Aprovada',
  placed: 'Matriculada',
  waitlisted: 'Lista de espera',
  cancelled: 'Cancelada',
  expired: 'Expirada',
};
