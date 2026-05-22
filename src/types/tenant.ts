/**
 * Tipos relacionados a Tenant — espelham contratos da API
 * (educari-2027-infra). Eventualmente substituídos por geração
 * automática a partir do OpenAPI.
 *
 * Ver docs/adr/008-customizacao-tenant.md, ADR-019, ADR-020.
 */

export interface TenantTheme {
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  surface_color: string;
  font_family: string;
  institutional_name: string | null;
  institutional_short_name: string | null;
  institutional_state: string | null;
  institutional_city: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export interface TenantFeatureFlag {
  feature_key: string;
  enabled: boolean;
}

export interface TenantSetting {
  category: string;
  key: string;
  value: unknown;
  data_type: 'string' | 'integer' | 'boolean' | 'number' | 'array' | 'object';
}

export interface TenantConfig {
  tenant_id: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived' | 'provisioning';
  theme: TenantTheme;
  feature_flags: TenantFeatureFlag[];
  settings: TenantSetting[];
}

/**
 * Catálogo canônico dos 38 módulos M01-M38.
 * Espelha config/tenant-features.php do backend.
 */
export interface ModuleDescriptor {
  key: string;
  code: string;
  label: string;
  icon: string;
  href: string;
  group: 'core' | 'mobile' | 'admin' | 'expansion';
}
