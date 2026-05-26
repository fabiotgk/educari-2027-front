/** Tipos do recurso M33 / RH Magistério — espelham o StaffMemberResource do backend. */

export interface StaffMember {
  id: string;
  tenant_id: string;
  user_id: string | null;
  name: string;
  cpf: string | null;
  registration_number: string | null;
  role_title: string | null;
  admission_date: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const STAFF_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  retired: 'Aposentado',
  leave: 'Afastado',
  dismissed: 'Exonerado',
};
