/** Tipos do recurso M28 / Cadastros Faciais — espelham o FacialEnrollmentResource do backend. */

export type FacialEnrollmentStatus = 'pending' | 'active' | 'revoked';

export interface FacialEnrollmentStudent {
  id: string;
  full_name: string;
}

export interface FacialEnrollment {
  id: string;
  tenant_id: string;
  student_id: string;
  photo_reference: string;
  template_hash: string | null;
  consent_given: boolean;
  consent_at: string | null;
  status: FacialEnrollmentStatus;
  enrolled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  student: FacialEnrollmentStudent | null;
}

export const FACIAL_ENROLLMENT_STATUS_LABELS: Record<FacialEnrollmentStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  revoked: 'Revogado',
};
