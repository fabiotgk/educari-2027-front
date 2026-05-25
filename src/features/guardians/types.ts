/** Tipos do recurso M03 / Responsáveis — espelham o GuardianResource do backend. */

export interface GuardianAddress {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export type GuardianRelationship =
  | 'mother'
  | 'father'
  | 'stepmother'
  | 'stepfather'
  | 'grandparent'
  | 'legal_guardian'
  | 'other';

export interface Guardian {
  id: string;
  tenant_id: string;
  user_id: string | null;
  full_name: string;
  birth_date: string | null;
  email: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  whatsapp: string | null;
  occupation: string | null;
  address: GuardianAddress | null;
  has_pii: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const GUARDIAN_RELATIONSHIP_LABELS: Record<GuardianRelationship, string> = {
  mother: 'Mãe',
  father: 'Pai',
  stepmother: 'Madrasta',
  stepfather: 'Padrasto',
  grandparent: 'Avó/Avô',
  legal_guardian: 'Responsável Legal',
  other: 'Outro',
};
