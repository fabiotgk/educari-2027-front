/** Item do catálogo de módulos (GET /api/v1/modules/catalog). */
export interface ModuleCatalogItem {
  feature_key: string;
  code: string | null;
  name: string;
  icon: string | null;
  category: string;
  subcategory: string | null;
  status: 'available' | 'coming_soon';
  description: string | null;
  /** A prefeitura contratou este módulo (dentro da vigência). */
  contracted: boolean;
  /** O admin habilitou o módulo (só faz sentido se contratado). */
  enabled: boolean;
  contract_ends_at: string | null;
}

/** Estado derivado para a UI. */
export type ModuleState = 'enabled' | 'contracted' | 'available' | 'coming_soon';

export function moduleState(m: ModuleCatalogItem): ModuleState {
  if (m.status === 'coming_soon') return 'coming_soon';
  if (!m.contracted) return 'available';
  return m.enabled ? 'enabled' : 'contracted';
}
