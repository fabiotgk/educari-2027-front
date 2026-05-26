/** Tipos do recurso M25 / Kits Escolares — espelham SchoolKitResource e KitComponentResource do backend. */

export type SchoolKitStatus = 'planned' | 'active' | 'closed';

export const SCHOOL_KIT_STATUS_LABELS: Record<SchoolKitStatus, string> = {
  planned: 'Planejado',
  active: 'Ativo',
  closed: 'Encerrado',
};

export type KitComponentCategory = 'uniform' | 'supply';

export const KIT_COMPONENT_CATEGORY_LABELS: Record<KitComponentCategory, string> = {
  uniform: 'Uniforme',
  supply: 'Material',
};

export interface SchoolKit {
  id: string;
  tenant_id: string;
  academic_year: string;
  name: string;
  target_stage: string | null;
  description: string | null;
  status: SchoolKitStatus;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface KitComponent {
  id: string;
  tenant_id: string;
  school_kit_id: string;
  item_name: string;
  category: KitComponentCategory;
  quantity: number;
  requires_size: boolean;
  created_at: string | null;
  updated_at: string | null;
}
