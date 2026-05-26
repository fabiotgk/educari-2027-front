/** Tipos do recurso M23 / Patrimônio — espelham o AssetResource do backend. */

export type AssetCondition = 'new' | 'good' | 'fair' | 'poor';
export type AssetStatus = 'active' | 'maintenance' | 'disposed' | 'lost';

export interface AssetCategory {
  id: string;
  tenant_id: string;
  name: string;
  code: string | null;
  description: string | null;
  depreciation_rate: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface AssetMovement {
  id: string;
  tenant_id: string;
  asset_id: string;
  from_school_id: string | null;
  to_school_id: string | null;
  movement_type: string;
  moved_at: string | null;
  responsible_user_id: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Asset {
  id: string;
  tenant_id: string;
  asset_category_id: string;
  school_id: string | null;
  patrimony_number: string;
  name: string;
  description: string | null;
  acquisition_date: string | null;
  acquisition_value: string | null;
  current_value: string | null;
  condition: AssetCondition | null;
  status: AssetStatus | null;
  location: string | null;
  category: AssetCategory | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  new: 'Novo',
  good: 'Bom',
  fair: 'Regular',
  poor: 'Ruim',
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Ativo',
  maintenance: 'Em manutenção',
  disposed: 'Baixado',
  lost: 'Perdido',
};
