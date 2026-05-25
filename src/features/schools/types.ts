/** Tipos do recurso M01 / Escolas — espelham o SchoolResource do backend. */

export type SchoolType =
  | 'municipal'
  | 'estadual'
  | 'federal'
  | 'privada'
  | 'cei'
  | 'creche'
  | 'sme_orgao';

export type SchoolStatus = 'active' | 'suspended' | 'closed';

export type SchoolProfile = 'indigena' | 'ceas' | 'quilombola' | 'rural' | 'fronteira';

export interface SchoolAddress {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface SchoolCoordinates {
  lat?: number | null;
  lng?: number | null;
}

export interface School {
  id: string;
  tenant_id: string;
  code: string | null;
  inep_code: string | null;
  name: string;
  short_name: string | null;
  type: SchoolType;
  cnpj: string | null;
  state_registration: string | null;
  email: string | null;
  phone: string | null;
  address: SchoolAddress | null;
  coordinates: SchoolCoordinates | null;
  region: string | null;
  profiles: SchoolProfile[] | null;
  ideb_targets: Record<string, unknown> | null;
  operation_status: SchoolStatus;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  municipal: 'Municipal',
  estadual: 'Estadual',
  federal: 'Federal',
  privada: 'Privada',
  cei: 'CEI',
  creche: 'Creche',
  sme_orgao: 'Órgão SME',
};

export const SCHOOL_STATUS_LABELS: Record<SchoolStatus, string> = {
  active: 'Ativa',
  suspended: 'Suspensa',
  closed: 'Fechada',
};

export const SCHOOL_PROFILE_LABELS: Record<SchoolProfile, string> = {
  indigena: 'Indígena',
  ceas: 'CEAS',
  quilombola: 'Quilombola',
  rural: 'Rural',
  fronteira: 'Fronteira',
};
