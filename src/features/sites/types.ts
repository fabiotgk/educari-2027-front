/** Tipos do recurso M10 / Portal Educacional — espelham o SiteResource do backend. */

export type SiteOwnerType = 'tenant' | 'school' | 'project';

export interface Site {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  owner_type: SiteOwnerType | null;
  owner_id: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  description: string | null;
  theme_overrides: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const SITE_OWNER_TYPE_LABELS: Record<SiteOwnerType, string> = {
  tenant: 'Rede / SME',
  school: 'Escola',
  project: 'Projeto',
};
