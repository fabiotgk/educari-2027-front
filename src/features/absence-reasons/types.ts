export interface AbsenceReason {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  is_justified: boolean;
  requires_document: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}
