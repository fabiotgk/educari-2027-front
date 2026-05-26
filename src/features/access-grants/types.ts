/** Tipos do recurso M26 / AccessGrants — espelham o AccessGrantResource do backend. */

export type AccessGrantScopeType = 'tenant' | 'school';

export type AccessGrantStatus = 'active' | 'revoked' | 'expired' | 'pending';

export interface AccessGrantUser {
  id: string;
  name: string;
  email: string;
}

export interface AccessGrant {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  scope_type: AccessGrantScopeType | null;
  scope_id: string | null;
  granted_by_user_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  user?: AccessGrantUser | null;
  granted_by?: AccessGrantUser | null;
}

export const SCOPE_TYPE_LABELS: Record<AccessGrantScopeType, string> = {
  tenant: 'Rede (tenant)',
  school: 'Escola',
};

export const STATUS_LABELS: Record<AccessGrantStatus, string> = {
  active: 'Ativa',
  revoked: 'Revogada',
  expired: 'Expirada',
  pending: 'Pendente',
};
